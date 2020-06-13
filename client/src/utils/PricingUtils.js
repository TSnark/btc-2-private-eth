import renBTCETHPair from "../contracts/IUniswapV2Pair.json";
import renBTC from "../contracts/renBTC.json";
import JSBI from "jsbi";

import { Token, TokenAmount, Pair, WETH } from "@uniswap/sdk";

const uniswapFees = 0.003;
const weiToSatoshi = 1e10;
const renVMFeesInSats = "35000";

export default async function priceConversion(web3, amountToConvertInWei) {
  const networkId = await web3.eth.net.getId();
  const renBTCETHPairDeployment = renBTCETHPair.networks[networkId];
  const renBTCDeployment = renBTC.networks[networkId];

  let uniswapETH = WETH[networkId];
  let uniswapRenBTC = new Token(
    networkId,
    renBTCDeployment.address,
    8,
    renBTCDeployment.name
  );

  const contract = new web3.eth.Contract(
    renBTCETHPair.abi,
    renBTCETHPairDeployment && renBTCETHPairDeployment.address
  );
  let { reserve0, reserve1 } = await contract.methods.getReserves().call();

  const uniswapPair = new Pair(
    new TokenAmount(uniswapRenBTC, reserve0),
    new TokenAmount(uniswapETH, reserve1)
  );

  let ethAmount = new TokenAmount(uniswapETH, amountToConvertInWei);
  try {
    const renBTCTokenAmountInSats = uniswapPair.getInputAmount(ethAmount)[0];
    let btcToTransfer = addPricingSafetyMargin(renBTCTokenAmountInSats.raw);
    const { orderPrice, priceImpact } = calculatePriceImpact(
      reserve0,
      reserve1,
      renBTCTokenAmountInSats,
      amountToConvertInWei
    );
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

// This is an estimate in percentage so use floating point calculation
function calculatePriceImpact(
  reserve0,
  reserve1,
  renBTCTokenAmountInSats,
  amountToConvertInWei
) {
  const spotPrice = reserve0 / reserve1;
  const orderPrice = renBTCTokenAmountInSats.raw / amountToConvertInWei;
  const priceImpact = (1 - uniswapFees - spotPrice / orderPrice).toFixed(3); // We use 2 decimals on the percentage representation
  return { orderPrice, priceImpact };
}

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
