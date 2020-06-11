var BTCToPrivateETH = artifacts.require("./BTCToPrivateETH.sol");
const addresses = require("./addresses.js");

module.exports = function (deployer, network) {
  network = network.replace("-fork", "");

  deployer.deploy(
    BTCToPrivateETH,
    addresses[network].renGatewayRegistry,
    addresses[network].uniswapRouter,
    addresses[network].tornado01,
    addresses[network].tornado1,
    addresses[network].tornado10,
    addresses[network].tornado100
  );
};
