var BTCToPrivateETH = artifacts.require("./BTCToPrivateETH.sol");

module.exports = function (deployer) {
  deployer.deploy(
    BTCToPrivateETH,
    "0x557e211ec5fc9a6737d2c6b7a1ade3e0c11a8d5d", //REN Gateway Registry Address
    "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a", // Uniswap Router Address
    "0x8b3f5393bA08c24cc7ff5A66a832562aAB7bC95f" //Tornado Address
  );
};
