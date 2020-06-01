import React, { useEffect, useCallback } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Web3 from "web3";
import Web3Modal from "web3modal";

const useStyles = makeStyles((theme) => ({
  submit: {
    borderRadius: 24,
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function ConnectButton({ onConnect }) {
  const classes = useStyles();

  const memoizedConnect = useCallback(() => {
    const connect = async () => {
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: "34551d538c09417bab045d7ae2b20a83",
          },
        },
      };
      const web3Modal = new Web3Modal({
        providerOptions, // required
        theme: "dark",
      });

      const provider = await web3Modal.connect();

      onConnect(new Web3(provider));
    };
    connect();
  }, [onConnect]);

  useEffect(() => {
    memoizedConnect();
  }, [memoizedConnect]);

  return (
    <Button
      type="submit"
      fullWidth
      variant="contained"
      color="secondary"
      className={classes.submit}
      onClick={() => memoizedConnect()}
    >
      Connect your Ethereum wallet
    </Button>
  );
}
