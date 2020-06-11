const { use, expect } = require("chai");
const { utils, Contract, ContractFactory } = require("ethers");
const {
  deployMockContract,
  MockProvider,
  solidity,
  deployContract,
} = require("ethereum-waffle");
const IUniswapV2Router02 = require("../build/IUniswapV2Router02.json");
const IGatewayRegistry = require("../build/IGatewayRegistry.json");
const IGateway = require("../build/IGateway.json");
const Tornado = require("../build/Tornado.json");
const WETH = require("../build/IWETH.json");
const IERC20 = require("../build/IERC20.json");
const BTCToPrivateETH = require("../build/BTCToPrivateETH.json");

use(solidity);

describe("BTCToPrivateETHTests", function () {
  let mockGatewayRegistry;
  let mockGateway;
  let mockUniswapRouter;
  let mockTornado01;
  let mockTornado1;
  let mockTornado10;
  let mockTornado100;
  let mockIERC20;
  let mockWETH;
  let contract;
  let mockTornados;

  // const provider = waffle.provider;
  const provider = new MockProvider();
  const [wallet, recipientWallet] = provider.getWallets();

  const setContractBalance = async (balance) => {
    let tx = {
      to: contract.address,
      value: utils.parseEther(balance),
    };

    await wallet.sendTransaction(tx);
  };

  beforeEach(async () => {
    mockGatewayRegistry = await deployMockContract(
      wallet,
      IGatewayRegistry.abi
    );
    mockGateway = await deployMockContract(wallet, IGateway.abi);
    mockUniswapRouter = await deployMockContract(
      wallet,
      IUniswapV2Router02.abi
    );
    mockTornado01 = await deployMockContract(wallet, Tornado.abi);
    mockTornado1 = await deployMockContract(wallet, Tornado.abi);
    mockTornado10 = await deployMockContract(wallet, Tornado.abi);
    mockTornado100 = await deployMockContract(wallet, Tornado.abi);
    mockIERC20 = await deployMockContract(wallet, IERC20.abi);
    mockWETH = await deployMockContract(wallet, WETH.abi);

    mockTornados = {
      [utils.parseEther("0.1")]: mockTornado01,
      [utils.parseEther("1")]: mockTornado1,
      [utils.parseEther("10")]: mockTornado10,
      [utils.parseEther("100")]: mockTornado100,
    };

    contract = await deployContract(wallet, BTCToPrivateETH, [
      mockGatewayRegistry.address,
      mockUniswapRouter.address,
      mockTornado01.address,
      mockTornado1.address,
      mockTornado10.address,
      mockTornado100.address,
    ]);
  });

  async function happyPathTest(ethAmountWanted) {
    const ethAmountSwapped = ethAmountWanted;
    const ethAmountDeposited = ethAmountWanted;
    const btcAmountMintedInSats = 100;
    const commitmentB32 = utils.formatBytes32String("commitment");
    const nHash = utils.formatBytes32String("nHash");
    const sig = utils.formatBytes32String("sig");
    const pHash = calculatePHash(
      recipientWallet,
      commitmentB32,
      ethAmountWanted
    );
    // Artificially set balance to simulate a successful swap to ETH
    await setContractBalance(ethAmountSwapped);

    await mockGateway.mock.mint.returns(btcAmountMintedInSats);
    await mockGatewayRegistry.mock.getGatewayBySymbol.returns(
      mockGateway.address
    );
    await mockGatewayRegistry.mock.getTokenBySymbol.returns(mockIERC20.address);
    await mockUniswapRouter.mock.getAmountsOut.returns([
      0,
      utils.parseEther(ethAmountSwapped),
    ]);
    await mockUniswapRouter.mock.swapExactTokensForETH.returns([]);
    await mockUniswapRouter.mock.WETH.returns(mockWETH.address);

    const mockTornado = mockTornados[utils.parseEther(ethAmountWanted)];
    await mockTornado.mock.deposit.returns();
    await mockIERC20.mock.approve.returns(true);
    const now = (await provider.getBlock()).timestamp;

    await expect(
      contract.deposit(
        recipientWallet.address,
        commitmentB32,
        utils.parseEther(ethAmountWanted),
        btcAmountMintedInSats,
        nHash,
        sig
      )
    )
      // Verification of triggered events
      .to.emit(contract, "Deposited")
      .withArgs(
        recipientWallet.address,
        utils.parseEther(ethAmountDeposited),
        commitmentB32
      );

    // Verification of contracts interactions

    expect("getGatewayBySymbol").to.be.calledOnContractWith(
      mockGatewayRegistry,
      ["BTC"]
    );

    expect("mint").to.be.calledOnContractWith(mockGateway, [
      pHash,
      btcAmountMintedInSats,
      nHash,
      sig,
    ]);

    expect("getTokenBySymbol").to.be.calledOnContractWith(mockGatewayRegistry, [
      "BTC",
    ]);

    expect("approve").to.be.calledOnContractWith(mockIERC20, [
      mockUniswapRouter.address,
      btcAmountMintedInSats,
    ]);

    expect("getAmountsOut").to.be.calledOnContractWith(mockUniswapRouter, [
      btcAmountMintedInSats,
      [mockIERC20.address, mockWETH.address],
    ]);

    expect(
      "swapExactTokensForETH"
    ).to.be.calledOnContractWith(mockUniswapRouter, [
      btcAmountMintedInSats,
      utils.parseEther(ethAmountWanted),
      [mockIERC20.address, mockWETH.address],
      contract.address,
      now,
    ]);

    expect("deposit").to.be.calledOnContractWith(mockTornado, [commitmentB32]);
  }

  it("Convert all minted renBTC into 0.1 ether and deposits correctly", async () =>
    happyPathTest("0.1"));

  it("Convert all minted renBTC into 1 ether and deposits correctly", async () =>
    happyPathTest("1"));

  it("Convert all minted renBTC into 10 ether and deposits correctly", async () =>
    happyPathTest("10"));

  it("Convert all minted renBTC into 100 ether and deposits correctly", async () =>
    happyPathTest("100"));

  it("Minted renBTC swap for more than required ether and change gets returned", async function () {
    const ethAmountWanted = "1.0";
    const ethAmountDeposited = ethAmountWanted;
    const ethAmountReturned = "0.5";
    const ethAmountSwapped = "1.5"; //ethAmountWanted + ethAmountReturned;
    const btcAmountMintedInSats = 100;
    const commitmentB32 = utils.formatBytes32String("commitment");
    const nHash = utils.formatBytes32String("nHash");
    const sig = utils.formatBytes32String("sig");
    const pHash = calculatePHash(
      recipientWallet,
      commitmentB32,
      ethAmountWanted
    );
    // Artificially set balance to simulate a successful swap to ETH
    await setContractBalance(ethAmountSwapped);

    await mockGateway.mock.mint.returns(btcAmountMintedInSats);
    await mockGatewayRegistry.mock.getGatewayBySymbol.returns(
      mockGateway.address
    );
    await mockGatewayRegistry.mock.getTokenBySymbol.returns(mockIERC20.address);
    await mockUniswapRouter.mock.swapExactTokensForETH.returns([]);
    await mockUniswapRouter.mock.getAmountsOut.returns([
      0,
      utils.parseEther(ethAmountSwapped),
    ]);
    await mockUniswapRouter.mock.WETH.returns(mockWETH.address);
    const mockTornado = mockTornados[utils.parseEther(ethAmountWanted)];
    await mockTornado.mock.deposit.returns();
    await mockIERC20.mock.approve.returns(true);
    const now = (await provider.getBlock()).timestamp;
    const initialRecipientBalance = await recipientWallet.getBalance();

    await expect(
      contract.deposit(
        recipientWallet.address,
        commitmentB32,
        utils.parseEther(ethAmountWanted),
        btcAmountMintedInSats,
        nHash,
        sig
      )
    )
      // Verification of triggered events
      .to.emit(contract, "Deposited")
      .withArgs(
        recipientWallet.address,
        utils.parseEther(ethAmountDeposited),
        commitmentB32
      )
      .to.emit(contract, "EthReturned")
      .withArgs(recipientWallet.address, utils.parseEther(ethAmountReturned));

    expect(await recipientWallet.getBalance()).to.equal(
      initialRecipientBalance.add(
        utils.bigNumberify(utils.parseEther(ethAmountReturned))
      )
    );

    // Verification of contracts interactions

    expect("getGatewayBySymbol").to.be.calledOnContractWith(
      mockGatewayRegistry,
      ["BTC"]
    );

    expect("mint").to.be.calledOnContractWith(mockGateway, [
      pHash,
      btcAmountMintedInSats,
      nHash,
      sig,
    ]);

    expect("getTokenBySymbol").to.be.calledOnContractWith(mockGatewayRegistry, [
      "BTC",
    ]);

    expect("approve").to.be.calledOnContractWith(mockIERC20, [
      mockUniswapRouter.address,
      btcAmountMintedInSats,
    ]);

    expect("getAmountsOut").to.be.calledOnContractWith(mockUniswapRouter, [
      btcAmountMintedInSats,
      [mockIERC20.address, mockWETH.address],
    ]);

    expect(
      "swapExactTokensForETH"
    ).to.be.calledOnContractWith(mockUniswapRouter, [
      btcAmountMintedInSats,
      utils.parseEther(ethAmountWanted),
      [mockIERC20.address, mockWETH.address],
      contract.address,
      now,
    ]);

    expect("deposit").to.be.calledOnContractWith(mockTornado, [commitmentB32]);
  });

  it("Send all renBTC back to the originator if the swap fails", async function () {
    const ethAmountWanted = "1.0";
    const btcAmountMintedInSats = 100;
    const commitmentB32 = utils.formatBytes32String("commitment");
    const nHash = utils.formatBytes32String("nHash");
    const sig = utils.formatBytes32String("sig");
    const pHash = calculatePHash(
      recipientWallet,
      commitmentB32,
      ethAmountWanted
    );

    await mockGateway.mock.mint.returns(btcAmountMintedInSats);
    await mockGatewayRegistry.mock.getGatewayBySymbol.returns(
      mockGateway.address
    );
    await mockGatewayRegistry.mock.getTokenBySymbol.returns(mockIERC20.address);
    await mockUniswapRouter.mock.getAmountsOut.returns([
      0,
      utils.parseEther(ethAmountWanted),
    ]);
    await mockUniswapRouter.mock.swapExactTokensForETH.reverts();
    await mockUniswapRouter.mock.WETH.returns(mockWETH.address);
    await mockIERC20.mock.approve.returns(true);
    await mockIERC20.mock.transfer.returns(true);

    const now = (await provider.getBlock()).timestamp;

    await expect(
      contract.deposit(
        recipientWallet.address,
        commitmentB32,
        utils.parseEther(ethAmountWanted),
        btcAmountMintedInSats,
        nHash,
        sig
      )
    )
      // Verification of triggered events
      .to.emit(contract, "BtcReturned")
      .withArgs(recipientWallet.address, btcAmountMintedInSats);

    // Verification of contracts interactions

    expect("getGatewayBySymbol").to.be.calledOnContractWith(
      mockGatewayRegistry,
      ["BTC"]
    );

    expect("mint").to.be.calledOnContractWith(mockGateway, [
      pHash,
      btcAmountMintedInSats,
      nHash,
      sig,
    ]);

    expect("getTokenBySymbol").to.be.calledOnContractWith(mockGatewayRegistry, [
      "BTC",
    ]);

    expect("getAmountsOut").to.be.calledOnContractWith(mockUniswapRouter, [
      btcAmountMintedInSats,
      [mockIERC20.address, mockWETH.address],
    ]);

    expect(
      "swapExactTokensForETH"
    ).to.be.calledOnContractWith(mockUniswapRouter, [
      btcAmountMintedInSats,
      utils.parseEther(ethAmountWanted),
      [mockIERC20.address, mockWETH.address],
      contract.address,
      now,
    ]);

    expect("transfer").to.be.calledOnContractWith(mockIERC20, [
      recipientWallet.address,
      btcAmountMintedInSats,
    ]);
  });

  it("Send all renBTC back to the originator if amount swapped less than wanted", async function () {
    const ethAmountWanted = "1.0";
    const ethAmountSwapped = "0.9";
    const btcAmountMintedInSats = 100;
    const commitmentB32 = utils.formatBytes32String("commitment");
    const nHash = utils.formatBytes32String("nHash");
    const sig = utils.formatBytes32String("sig");
    const pHash = calculatePHash(
      recipientWallet,
      commitmentB32,
      ethAmountWanted
    );

    await mockGateway.mock.mint.returns(btcAmountMintedInSats);
    await mockGatewayRegistry.mock.getGatewayBySymbol.returns(
      mockGateway.address
    );
    await mockGatewayRegistry.mock.getTokenBySymbol.returns(mockIERC20.address);
    await mockUniswapRouter.mock.getAmountsOut.returns([
      0,
      utils.parseEther(ethAmountSwapped),
    ]);
    await mockUniswapRouter.mock.swapExactTokensForETH.returns([]);
    await mockUniswapRouter.mock.WETH.returns(mockWETH.address);
    await mockIERC20.mock.transfer.returns(true);

    await expect(
      contract.deposit(
        recipientWallet.address,
        commitmentB32,
        utils.parseEther(ethAmountWanted),
        btcAmountMintedInSats,
        nHash,
        sig
      )
    )
      // Verification of triggered events
      .to.emit(contract, "BtcReturned")
      .withArgs(recipientWallet.address, btcAmountMintedInSats);

    // Verification of contracts interactions

    expect("getGatewayBySymbol").to.be.calledOnContractWith(
      mockGatewayRegistry,
      ["BTC"]
    );

    expect("mint").to.be.calledOnContractWith(mockGateway, [
      pHash,
      btcAmountMintedInSats,
      nHash,
      sig,
    ]);

    expect("getTokenBySymbol").to.be.calledOnContractWith(mockGatewayRegistry, [
      "BTC",
    ]);

    expect("getAmountsOut").to.be.calledOnContractWith(mockUniswapRouter, [
      btcAmountMintedInSats,
      [mockIERC20.address, mockWETH.address],
    ]);

    expect("transfer").to.be.calledOnContractWith(mockIERC20, [
      recipientWallet.address,
      btcAmountMintedInSats,
    ]);
  });

  it("Send all renBTC back to the originator if wanted amount less than 0.1", async function () {
    const ethAmountWanted = "0.09";
    const btcAmountMintedInSats = 100;
    const commitmentB32 = utils.formatBytes32String("commitment");
    const nHash = utils.formatBytes32String("nHash");
    const sig = utils.formatBytes32String("sig");
    const pHash = calculatePHash(
      recipientWallet,
      commitmentB32,
      ethAmountWanted
    );

    await mockGateway.mock.mint.returns(btcAmountMintedInSats);
    await mockGatewayRegistry.mock.getGatewayBySymbol.returns(
      mockGateway.address
    );
    await mockGatewayRegistry.mock.getTokenBySymbol.returns(mockIERC20.address);
    await mockUniswapRouter.mock.getAmountsOut.returns([
      0,
      utils.parseEther(ethAmountWanted),
    ]);
    await mockUniswapRouter.mock.swapExactTokensForETH.returns([]);
    await mockUniswapRouter.mock.WETH.returns(mockWETH.address);
    await mockIERC20.mock.transfer.returns(true);

    await expect(
      contract.deposit(
        recipientWallet.address,
        commitmentB32,
        utils.parseEther(ethAmountWanted),
        btcAmountMintedInSats,
        nHash,
        sig
      )
    )
      // Verification of triggered events
      .to.emit(contract, "BtcReturned")
      .withArgs(recipientWallet.address, btcAmountMintedInSats);

    // Verification of contracts interactions

    expect("getGatewayBySymbol").to.be.calledOnContractWith(
      mockGatewayRegistry,
      ["BTC"]
    );

    expect("mint").to.be.calledOnContractWith(mockGateway, [
      pHash,
      btcAmountMintedInSats,
      nHash,
      sig,
    ]);

    expect("getTokenBySymbol").to.be.calledOnContractWith(mockGatewayRegistry, [
      "BTC",
    ]);

    expect("transfer").to.be.calledOnContractWith(mockIERC20, [
      recipientWallet.address,
      btcAmountMintedInSats,
    ]);
  });

  it("Send all renBTC back to the originator if wanted amount more than 100", async function () {
    const ethAmountWanted = "100.1";
    const btcAmountMintedInSats = 100;
    const commitmentB32 = utils.formatBytes32String("commitment");
    const nHash = utils.formatBytes32String("nHash");
    const sig = utils.formatBytes32String("sig");
    const pHash = calculatePHash(
      recipientWallet,
      commitmentB32,
      ethAmountWanted
    );

    await mockGateway.mock.mint.returns(btcAmountMintedInSats);
    await mockGatewayRegistry.mock.getGatewayBySymbol.returns(
      mockGateway.address
    );
    await mockGatewayRegistry.mock.getTokenBySymbol.returns(mockIERC20.address);
    await mockUniswapRouter.mock.getAmountsOut.returns([
      0,
      utils.parseEther(ethAmountWanted),
    ]);
    await mockUniswapRouter.mock.swapExactTokensForETH.returns([]);
    await mockUniswapRouter.mock.WETH.returns(mockWETH.address);
    await mockIERC20.mock.transfer.returns(true);

    await expect(
      contract.deposit(
        recipientWallet.address,
        commitmentB32,
        utils.parseEther(ethAmountWanted),
        btcAmountMintedInSats,
        nHash,
        sig
      )
    )
      // Verification of triggered events
      .to.emit(contract, "BtcReturned")
      .withArgs(recipientWallet.address, btcAmountMintedInSats);

    // Verification of contracts interactions

    expect("getGatewayBySymbol").to.be.calledOnContractWith(
      mockGatewayRegistry,
      ["BTC"]
    );

    expect("mint").to.be.calledOnContractWith(mockGateway, [
      pHash,
      btcAmountMintedInSats,
      nHash,
      sig,
    ]);

    expect("getTokenBySymbol").to.be.calledOnContractWith(mockGatewayRegistry, [
      "BTC",
    ]);

    expect("transfer").to.be.calledOnContractWith(mockIERC20, [
      recipientWallet.address,
      btcAmountMintedInSats,
    ]);
  });
});

function calculatePHash(recipientWallet, commitmentB32, ethAmountWanted) {
  const encodedParams = utils.defaultAbiCoder.encode(
    ["address", "bytes32", "uint256"],
    [recipientWallet.address, commitmentB32, utils.parseEther(ethAmountWanted)]
  );
  const pHash = utils.solidityKeccak256(["bytes"], [encodedParams]);
  return pHash;
}
