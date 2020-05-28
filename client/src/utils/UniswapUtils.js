import IUniswapV2Pair from "../contracts/IUniswapV2Pair.json";

import { Token, TokenAmount, Pair, WETH } from "@uniswap/sdk";

export default async function estimateAmountToSwap(web3, amountToConvertInWei) {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = IUniswapV2Pair.networks[networkId];

  let uniswapETH = WETH[networkId];
  let uniswapBTC = new Token(
    networkId,
    "0x0a9add98c076448cbcfacf5e457da12ddbef4a8f",
    8,
    "testBTC"
  );

  const contract = new web3.eth.Contract(
    IUniswapV2Pair.abi,
    deployedNetwork && deployedNetwork.address
  );
  let { reserve0, reserve1 } = await contract.methods.getReserves().call();

  const uniswapPair = new Pair(
    new TokenAmount(uniswapBTC, reserve0),
    new TokenAmount(uniswapETH, reserve1)
  );

  let ethAmount = new TokenAmount(uniswapETH, amountToConvertInWei);
  try {
    let btcAmount = uniswapPair.getInputAmount(ethAmount)[0];

    return {
      btcToTransfer: add10PercentSafetyMargin(btcAmount).toFixed(
        uniswapBTC.decimals
      ),
      ethReserveInWei: reserve1,
    };
  } catch (e) {
    return {
      btcToTransfer: "0",
      ethReserveInWei: reserve1,
    };
  }
}

// We add a safety margin in case the price moves while we wait for confirmations
function add10PercentSafetyMargin(amount) {
  return amount.multiply("11").divide("10");
}
