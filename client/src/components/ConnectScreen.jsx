import React, { useCallback, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import ConnectButton from "./ConnectButton";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WrongNetworkPopup from "./WrongNetworkPopup";

export default function ConnectScreen({ onConnect, onDisconnect }) {
  const [popupOpen, setPopupOpen] = useState(false);

  const memoizedConnect = useCallback(async () => {
    function subscribeToProviderEvents(provider, web3, networkId, accounts) {
      provider.on("accountsChanged", (newAccounts) => {
        if (Array.isArray(newAccounts) && newAccounts.length) {
          onConnect({
            web3,
            accounts: newAccounts,
            networkId,
            connected: true,
          });
        } else {
          onDisconnect();
        }
      });

      provider.on("networkChanged", (newNetworkId) => {
        if (isNetworkSuppported(newNetworkId)) {
          onConnect({
            web3,
            accounts,
            networkId: newNetworkId.toString(),
            connected: true,
          });
        } else {
          onDisconnect();
          setPopupOpen(true);
        }
      });
    }

    const web3Modal = setupWeb3Modal();

    try {
      const provider = await web3Modal.connect();
      const web3 = new Web3(provider);
      const networkId = await web3.eth.net.getId();
      if (provider.isMetaMask) {
        provider.autoRefreshOnNetworkChange = false;
      }

      const accounts = await web3.eth.getAccounts();

      subscribeToProviderEvents(provider, web3, networkId, accounts);
      setPopupOpen(!isNetworkSuppported(networkId));
      if (
        Array.isArray(accounts) &&
        accounts.length &&
        isNetworkSuppported(networkId)
      ) {
        onConnect({
          web3,
          accounts,
          networkId: networkId.toString(),
          connected: true,
        });
      }
    } catch (error) {
      console.log("error: " + error);
      onDisconnect();
    }
  }, [onConnect, onDisconnect]);

  function isNetworkSuppported(networkId) {
    return networkId === 42;
  }

  function setupWeb3Modal() {
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
    return web3Modal;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" gutterBottom>
          Convert your Bitcoin to privacy preserving Ether.
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Use this dApp to on-ramp to Ethereum while retaining privacy.
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
