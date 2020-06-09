import BTCToPrivateETH from "../contracts/BTCToPrivateETH.json";
import React, { useState, useEffect, useContext, useCallback } from "react";
import GatewayJS from "@renproject/gateway";
import { Alert, AlertTitle } from "@material-ui/lab";
import JSBI from "jsbi";
import Web3Context from "../state/Web3Context";
import ConvertCard from "./ConvertCard";

export default function ConvertScreen() {
  const [contractAddress, setContractAddress] = useState();
  const [gatewayJS] = useState(new GatewayJS("testnet"));
  const [recovering, setRecovering] = useState(false);
  const { web3, accounts, networkId } = useContext(Web3Context);

  // We recover only the previous "active" transaction and force the user
  // to deal with it.
  const recoverLastTransfer = useCallback(async () => {
    // Load previous transfer from local storage
    const previousGateways = await gatewayJS.getGateways();
    const previousTransfers = Array.from(previousGateways.values());
    // Resume last transfer if still active
    if (isActiveTransfer(previousTransfers[0])) {
      setRecovering(previousTransfers);
      gatewayJS
        .recoverTransfer(web3.currentProvider, previousTransfers[0])
        .pause()
        .result()
        .catch((e) => console.log(e));
    }
  }, [web3, gatewayJS]);

  useEffect(() => {
    recoverLastTransfer();
    setContractAddress(BTCToPrivateETH.networks[networkId].address);
  }, [networkId, recoverLastTransfer]);

  function isActiveTransfer(previousTransfer) {
    return (
      (!!previousTransfer && previousTransfer.status === "mint_deposited") ||
      previousTransfer.status === "mint_returnedFromRenVM"
    );
  }

  const deposit = async (btcToTransferInSats, commitment, ethToRetrieve) => {
    await gatewayJS
      .open({
        // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
        sendToken: GatewayJS.Tokens.BTC.Btc2Eth,

        // Amount of BTC we are sending (in Satoshis)
        suggestedAmount: btcToTransferInSats,

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
  };

  if (recovering) {
    return (
      <Alert severity="warning">
        <AlertTitle>Pending transaction detected. </AlertTitle>
        Complete your previous transaction before starting a new one. Failing to
        do so will result in loss of funds.
      </Alert>
    );
  } else {
    return <ConvertCard deposit={deposit} />;
  }
}