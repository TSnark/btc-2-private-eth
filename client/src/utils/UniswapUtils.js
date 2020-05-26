import IUniswapV2Pair from "../contracts/IUniswapV2Pair.json";

const adjustmentFactor = 1.1;

export default async function estimateAmountToSwap(web3, amountToConvertInWei) {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = IUniswapV2Pair.networks[networkId];
  const contract = new web3.eth.Contract(
    IUniswapV2Pair.abi,
    deployedNetwork && deployedNetwork.address
  );
  let { reserve0, reserve1 } = await contract.methods.getReserves().call();
  let k = reserve0 * reserve1;
  let newReserve1 = reserve1 - amountToConvertInWei;
  let reserve0ToSwap = k / newReserve1 - reserve0;
  console.log(reserve0ToSwap);
  return reserve0ToSwap * adjustmentFactor;
}
