import BTCToPrivateETH from "../contracts/BTCToPrivateETH.json";
import React, { useState, useEffect, useContext } from "react";
import GatewayJS from "@renproject/gateway";
import { deposit as tornado } from "../utils/TornadoUtils";
import estimateAmountToSwap from "../utils/PricingUtils";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { Card, CardContent } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import EthSlider from "../components/EthSlider";
import TornadoCashNote from "../components/TornadoCashNote";
import JSBI from "jsbi";
import { useAsync } from "react-async-hook";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import useConstant from "use-constant";
import Web3Context from "../state/Web3Context";

const useStyles = makeStyles((theme) => ({
  card: {
    borderRadius: 24,
    textAlign: "center",
  },
  cardTitle: {
    fontSize: 14,
    textAlign: "center",
    spacing: 10,
  },
  cardContent: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(6),
    paddingLeft: theme.spacing(6),
  },
  submit: {
    borderRadius: 24,
    margin: theme.spacing(3, 0, 2),
  },
}));

const generateNote = async (web3, ethToRetrieve) => {
  let { btcToTransferInSats, ethReserveInWei } = await estimateAmountToSwap(
    web3,
    ethToRetrieve
  );
  const enoughLiquidity = ethReserveInWei > ethToRetrieve;
  let { note, commitment } = await tornado(web3, ethToRetrieve);
  return {
    enoughLiquidity,
    btcToTransferInSats,
    ethReserveInWei,
    note,
    commitment,
  };
};

export default function ConvertCard() {
  const [contractAddress, setContractAddress] = useState();
  const [ethToRetrieve, setEthToRetrieve] = useState(1e17);
  const [gatewayJS] = useState(new GatewayJS("testnet"));
  const [converting, setConverting] = useState(false);
  const classes = useStyles();
  const { web3, accounts, networkId } = useContext(Web3Context);
  const debouncedGenerateNote = useConstant(() =>
    AwesomeDebouncePromise(generateNote, 300)
  );

  const asyncNote = useAsync(debouncedGenerateNote, [web3, ethToRetrieve], {
    setLoading: (state) => ({ ...state, loading: true }),
  });

  useEffect(() => {
    setContractAddress(BTCToPrivateETH.networks[networkId].address);
  }, [networkId]);

  const deposit = async () => {
    setConverting(true);
    try {
      await gatewayJS
        .open({
          // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
          sendToken: GatewayJS.Tokens.BTC.Btc2Eth,

          // Amount of BTC we are sending (in Satoshis)
          suggestedAmount: asyncNote.result.btcToTransferInSats,

          sendTo: contractAddress,

          // The name of the function we want to call
          contractFn: "deposit",

          nonce: GatewayJS.utils.randomNonce(),

          // Arguments expected for calling `deposit`
          contractParams: [
            {
              name: "_to",
              type: "address",
              value: accounts[0],
            },
            {
              name: "_commitment",
              type: "bytes32",
              value: asyncNote.result.commitment,
            },
            {
              name: "_ethAmount",
              type: "uint256",
              value: JSBI.BigInt(ethToRetrieve),
            },
          ],

          // Web3 provider for submitting mint to Ethereum
          web3Provider: web3.currentProvider,
        })
        .result();
      setConverting(false);
    } catch (error) {
      setConverting(false);
      console.log(error);
    }
  };

  const NoteOrWarning = () => {
    return asyncNote.result && !asyncNote.result.enoughLiquidity ? (
      <Grid item xs={12}>
        <Alert severity="error">
          Insufficient ETH in Uniswap:{" "}
          {asyncNote.result &&
            (asyncNote.result.ethReserveInWei / 1e18).toFixed(8)}{" "}
          ETH
        </Alert>
      </Grid>
    ) : (
      <>
        <Grid item xs={12}>
          <TornadoCashNote
            id="tornado-note"
            title="Tornado Cash Note"
            content={asyncNote.result.note}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            disabled={!!converting}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={() => deposit()}
            size="large"
          >
            Convert BTC to Private ETH
          </Button>
        </Grid>
      </>
    );
  };

  if (!!contractAddress) {
    return (
      <>
        {asyncNote.result && (
          <Card className={classes.card} variant="outlined">
            <CardContent className={classes.cardContent}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <EthSlider
                    disabled={!!converting}
                    onChange={setEthToRetrieve}
                  />
                </Grid>
                <Grid item xs={12}>
                  <NoteOrWarning />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </>
    );
  } else {
    return (
      <Alert severity="warning">
        <AlertTitle>This dApp work</AlertTitle>
        This is a warning alert — <strong>check it out!</strong>
      </Alert>
    );
  }
}
