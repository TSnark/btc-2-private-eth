import React, { Component } from "react";
import RenJS from "@renproject/ren";
import BTCToPrivateETH from "./contracts/BTCToPrivateETH.json";
import getWeb3 from "./getWeb3";
import ConvertApp from "./ConvertApp";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

import "./App.css";

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

class App extends Component {
  state = {
    web3: null,
    contract: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BTCToPrivateETH.networks[networkId];
      const instance = new web3.eth.Contract(
        BTCToPrivateETH.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    const { web3, contract } = this.state;
    if (!web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <ThemeProvider theme={darkTheme}>
        <ConvertApp
          web3={web3}
          renJS={new RenJS("testnet")}
          contractAddress={contract.options.address}
        ></ConvertApp>
      </ThemeProvider>
    );
  }
}

export default App;
