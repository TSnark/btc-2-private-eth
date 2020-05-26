import React, { useState, useEffect } from "react";
import RenJS from "@renproject/ren";
import { deposit as tornado } from "./utils/TornadoUtils";
import estimateAmountToSwap from "./utils/UniswapUtils";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";

import {
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Container from "@material-ui/core/Container";
import EthSlider from "./components/EthSlider";
import CopiableCard from "./components/CopiableCard";
import AboutDialogs from "./components/AboutDialogs";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
  image: {
    backgroundImage:
      "url(https://images.unsplash.com/photo-1583529968915-10a0c193050a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1017&q=80)",
    backgroundRepeat: "no-repeat",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  note: {
    wordBreak: "break-all",
  },
  cardTitle: {
    fontSize: 14,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function ConvertApp({ web3, renJS, contractAddress }) {
  const [note, setNote] = useState();
  const [mint, setMint] = useState();
  const [ethToRetrieve, setEthToRetrieve] = useState(1e17);
  const [btcToTransfer, setBtcToTransfer] = useState(0);
  const [gatewayAddress, setGatewayAddress] = useState();
  const [loadingState, setLoadingState] = useState({
    loading: false,
    message: "",
  });
  const classes = useStyles();

  useEffect(() => {
    async function init() {
      const accounts = await web3.eth.getAccounts();
      let btcToTransfer =
        (await estimateAmountToSwap(web3, ethToRetrieve)) / 1e8;
      setBtcToTransfer(btcToTransfer);
      let { note, commitment } = await tornado(web3, ethToRetrieve);
      setNote(note);
      const mint = renJS.lockAndMint({
        // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
        sendToken: RenJS.Tokens.BTC.Btc2Eth,

        // The contract we want to interact with
        sendTo: contractAddress,

        // The name of the function we want to call
        contractFn: "deposit",

        nonce: renJS.utils.randomNonce(),

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
      });

      // Show the gateway address to the user so that they can transfer their BTC to it.
      setMint(mint);
      const gatewayAddress = await mint.gatewayAddress();
      setGatewayAddress(gatewayAddress);
    }
    init();
  }, [ethToRetrieve, contractAddress, renJS, web3]);

  const deposit = async () => {
    setLoadingState({
      loading: true,
      message: "Waiting for BTC transfer...",
    });
    // Wait for the Darknodes to detect the BTC transfer.
    const confirmations = 0;
    const deposit = await mint.wait(confirmations);

    // Retrieve signature from RenVM.
    setLoadingState({ loading: true, message: "Submitting to Ren VM..." });
    const signature = await deposit.submit();

    // Submit the signature to Ethereum and receive zBTC.
    setLoadingState({
      loading: true,
      message: "Submitting to smart contract...",
    });

    await signature.submitToEthereum(web3.currentProvider);
    setLoadingState({
      loading: false,
      message: `Deposited ${btcToTransfer} BTC.`,
    });
  };

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={3} md={3} className={classes.image}>
        <Grid container spacing={2}></Grid>
      </Grid>
      <Grid item xs={12} sm={9} md={9} square>
        <Alert severity="warning">
          This is a test project not meant for real use. It operates on Bitcoin
          testnet and Ethereum Kovan testnet
        </Alert>
        <Container component="main" maxWidth="xs">
          <div className={classes.paper}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <Typography variant="h5" component="h5">
                  BTC TO PRIVATE ETH
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12}>
                <EthSlider onChange={setEthToRetrieve} />
              </Grid>
              <Grid item xs={12}>
                <CopiableCard
                  id="btc-amount"
                  title="Send this BTC amount"
                  content={btcToTransfer}
                />
              </Grid>
              <Grid item xs={12}>
                <CopiableCard
                  id="btc-address"
                  title="To the following REN VM address"
                  content={gatewayAddress}
                />
              </Grid>
              <Grid item xs={12}>
                <CopiableCard
                  id="tornado-note"
                  title="Back up your Tornado Cash note for withdrawal"
                  content={note}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={() => deposit()}
            >
              {`I have sent ${btcToTransfer} BTC`}
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Dialog
                  open={loadingState.loading}
                  onClose={() => setLoadingState({ loading: false })}
                >
                  <DialogTitle>{loadingState.message}</DialogTitle>
                  <DialogContent>
                    <LinearProgress />
                  </DialogContent>
                </Dialog>
              </Grid>
            </Grid>
          </div>
          <Box mt={5}>
            <AboutDialogs />
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
}
