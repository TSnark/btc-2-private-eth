const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const keys = require("./private.js");

let kovanPrivateKey = keys.kovanPrivateKey;
module.exports = {
  compilers: {
    solc: {
      version: "0.6.7",
    },
  },
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      host: "localhost",
      network_id: 5777,
      port: 8545,
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(
          kovanPrivateKey,
          "https://kovan.infura.io/v3/34551d538c09417bab045d7ae2b20a83"
        ),
      network_id: 42,
      gas: 4700000,
    },
    mainnet: {
      network_id: 1,
    },
  },
};
