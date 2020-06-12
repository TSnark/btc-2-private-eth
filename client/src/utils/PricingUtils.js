import IUniswapV2Pair from "../contracts/IUniswapV2Pair.json";
import JSBI from "jsbi";

import { Token, TokenAmount, Pair, WETH } from "@uniswap/sdk";

const uniswapFees = 0.003;
const weiToSatoshi = 1e10;

export default async function priceConversion(web3, amountToConvertInWei) {
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
    const btcTokenAmount = uniswapPair.getInputAmount(ethAmount)[0];
    let btcToTransfer = addPricingSafetyMargin(btcTokenAmount.raw);
    const spotPrice = reserve0 / reserve1;
    const orderPrice = btcTokenAmount.raw / amountToConvertInWei;
    const priceImpact = (1 - uniswapFees - spotPrice / orderPrice).toFixed(3);
    return {
      price: orderPrice * weiToSatoshi,
      priceImpact,
      btcToTransfer,
      ethReserveInWei: reserve1,
    };
  } catch (e) {
    console.log(e);
    return {
      price: 0,
      priceImpact: 1,
      btcToTransfer: 0,
      ethReserveInWei: reserve1,
    };
  }
}

const renVMFeesInSats = "35000";
// We add a safety margin and fees in case the price moves while we wait for confirmations
function addPricingSafetyMargin(amount) {
  // Add RenVM miners fees
  const amountWithMinersFees = JSBI.add(amount, JSBI.BigInt(renVMFeesInSats));
  // Add 1% buffer to in case the price moves during confirmation this also includes 0.1% RenVM fees
  return JSBI.divide(
    JSBI.multiply(amountWithMinersFees, JSBI.BigInt("101")),
    JSBI.BigInt("100")
  );
}
