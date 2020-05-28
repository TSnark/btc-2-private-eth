import React, { useState, useEffect, useCallback } from "react";
import GatewayJS from "@renproject/gateway";
import { deposit as tornado } from "../utils/TornadoUtils";
import estimateAmountToSwap from "../utils/UniswapUtils";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { Card, CardContent } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import EthSlider from "../components/EthSlider";
import TornadoCashNote from "../components/TornadoCashNote";
import Header from "../components/Header";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    backgroundColor: "#160e1f",
  },
  content: {
    minHeight: "100vh",
    marginTop: theme.spacing(16),
  },
  card: {
    borderRadius: 24,
    minWidth: 256,
    textAlign: "center",
    backgroundColor: "#19172b",
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

export default function MainPage({ web3, contractAddress }) {
  const [note, setNote] = useState();
  const [commitment, setCommitment] = useState();
  const [ethToRetrieve, setEthToRetrieve] = useState(1e17);
  const [btcToTransfer, setBtcToTransfer] = useState(0);
  const [gatewayJS] = useState(new GatewayJS("testnet"));
  const [ethReserveInWei, setEthReserveInWei] = useState(0);
  const [ethAvailable, setEthAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  const classes = useStyles();

  const memoizedCallback = useCallback(() => {
    const recoverTransfers = async () => {
      // Load previous transfers from local storage
      const previousGateways = await gatewayJS.getGateways();
      // Resume each transfer
      for (const transfer of Array.from(previousGateways.values())) {
        gatewayJS
          .recoverTransfer(web3.currentProvider, transfer)
          .pause()
          .result()
          .catch((e) => console.log(e));
      }
    };
    recoverTransfers();
  }, [web3, gatewayJS]);

  useEffect(() => {
    async function init() {
      memoizedCallback();
      let poolValues = await estimateAmountToSwap(web3, ethToRetrieve);
      let { btcToTransfer, ethReserveInWei } = poolValues;
      setBtcToTransfer(btcToTransfer);
      setEthReserveInWei(ethReserveInWei);
      setEthAvailable(ethReserveInWei > ethToRetrieve);
      let { note, commitment } = await tornado(web3, ethToRetrieve);
      console.log(note);
      setNote(note);
      setCommitment(commitment);
    }
    init();
  }, [ethToRetrieve, web3, memoizedCallback]);

  const deposit = async () => {
    setLoading(true);
    const accounts = await web3.eth.getAccounts();
    try {
      await gatewayJS
        .open({
          // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
          sendToken: GatewayJS.Tokens.BTC.Btc2Eth,

          // Amount of BTC we are sending (in Satoshis)
          suggestedAmount: btcToTransfer,

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
              value: commitment,
            },
          ],

          // Web3 provider for submitting mint to Ethereum
          web3Provider: web3.currentProvider,
        })
        .result();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <Grid container className={classes.root}>
      <CssBaseline />
      <Header />
      <Grid
        container
        spacing={4}
        alignItems="center"
        className={classes.content}
        direction="column"
      >
        <Grid item>
          <Alert severity="warning">
            This is a test project not meant for real use. It operates on
            Bitcoin testnet and Ethereum Kovan testnet
          </Alert>
        </Grid>
        <Container component="main" maxWidth="xs">
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <EthSlider disabled={!!loading} onChange={setEthToRetrieve} />
                </Grid>

                {ethAvailable ? (
                  <>
                    <Grid item xs={12}>
                      <TornadoCashNote
                        id="tornado-note"
                        title="Tornado Cash Note"
                        content={note}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        disabled={!!loading}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={() => deposit()}
                      >
                        Start
                      </Button>
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      Insufficient ETH in Uniswap:{" "}
                      {(ethReserveInWei / 1e18).toFixed(8)} ETH
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Grid>
    </Grid>
  );
}
