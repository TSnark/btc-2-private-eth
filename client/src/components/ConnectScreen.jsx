import React, { useCallback, useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import ConnectButton from "./ConnectButton";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WrongNetworkPopup from "./WrongNetworkPopup";

export default function ConnectScreen({ onConnect, onDisconnect }) {
  const [popupOpen, setPopupOpen] = useState(false);

  const memoizedConnect = useCallback(
    async (event) => {
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: "34551d538c09417bab045d7ae2b20a83",
          },
        },
      };

      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
        theme: "dark",
      });

      const provider = await web3Modal.connect();
      const web3 = new Web3(provider);
      const networkId = await web3.eth.net.getId();

      if (networkId !== 42) {
        setPopupOpen(true);
        return;
      }

      const accounts = await web3.eth.getAccounts();
      provider.on("accountsChanged", (accounts) => {
        if (!Array.isArray(accounts) || !accounts.length) {
          onDisconnect();
        }
        onConnect({ web3, accounts, networkId });
      });

      provider.on("networkChanged", (accounts) => {
        onConnect({ web3, accounts, networkId });
      });

      onConnect({ web3, accounts, networkId });
    },
    [onConnect, onDisconnect]
  );

  useEffect(() => {
    memoizedConnect();
  }, [memoizedConnect]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" gutterBottom>
          Convert your Bitcoin to privacy preserving Ether.
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          By using this dApp you can on ramp to the Ethereum world without
          privacy concerns.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ConnectButton
          onConnect={memoizedConnect}
          onDisconnect={onDisconnect}
        />
        <WrongNetworkPopup open={popupOpen} setOpen={setPopupOpen} />
      </Grid>
    </Grid>
  );
}
