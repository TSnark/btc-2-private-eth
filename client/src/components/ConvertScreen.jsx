import BTCToPrivateETH from "../contracts/BTCToPrivateETH.json";
import React, { useState, useEffect, useContext, useCallback } from "react";
import GatewayJS from "@renproject/gateway";
import { Alert, AlertTitle } from "@material-ui/lab";
import JSBI from "jsbi";
import Web3Context from "../state/Web3Context";
import ConvertCard from "./ConvertCard";
import DoneCard from "./DoneCard";
import GridLoader from "react-spinners/GridLoader";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  spinner: {
    display: "flex",
    justifyContent: "center",
    margin: theme.spacing(24, 0, 0),
  },
}));

export default function ConvertScreen() {
  const [contractAddress, setContractAddress] = useState();
  const [gatewayJS, setGatewayJS] = useState();
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [note, setNote] = useState();
  const { web3, accounts, networkId } = useContext(Web3Context);
  const classes = useStyles();

  // We recover only the previous "active" transaction and force the user
  // to deal with it.
  const recoverLastTransfer = useCallback(async () => {
    try {
      if (!!gatewayJS) {
        // Load previous transfer from local storage
        setLoading(true);
        const previousGateways = await gatewayJS.getGateways();
        const previousTransfers = Array.from(previousGateways.values()) || [];
        setLoading(false);

        if (!!previousTransfers) {
          setRecovering(true);
          // Resume last already paid transfers
          await Promise.allSettled(
            previousTransfers
              .filter(isPaidTransfer)
              .map((previousTransfer) =>
                gatewayJS
                  .recoverTransfer(web3.currentProvider, previousTransfer)
                  .pause()
                  .result()
              )
          );
          setRecovering(false);
        }
      }
    } catch (e) {
      setLoading(false);
      setRecovering(false);
      console.log(e);
    }
  }, [web3, gatewayJS]);

  function isPaidTransfer(previousTransfer) {
    return (
      !!previousTransfer &&
      (previousTransfer.status === "mint_deposited" ||
        previousTransfer.status === "mint_returnedFromRenVM")
    );
  }

  useEffect(() => {
    setGatewayJS(new GatewayJS(networkId === "1" ? "mainnet" : "testnet"));
    setContractAddress(BTCToPrivateETH.networks[networkId].address);
  }, [networkId]);

  useEffect(() => {
    recoverLastTransfer();
  }, [recoverLastTransfer]);

  const deposit = async (btcToTransfer, commitment, ethToRetrieve, note) => {
    setNote(note);
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
    setCompleted(true);
  };

  if (loading) {
    return (
      <div className={classes.spinner}>
        <GridLoader size={16} color={"#123abc"} loading={loading} />
      </div>
    );
  } else if (recovering) {
    return (
      <Alert severity="warning">
        <AlertTitle>Pending transactions detected. </AlertTitle>
        Complete your previous transactions before starting a new one. Failing
        to do so will result in loss of funds.
      </Alert>
    );
  } else if (completed) {
    return <DoneCard note={note} onStart={() => setCompleted(false)} />;
  } else {
    return <ConvertCard deposit={deposit} />;
  }
}
