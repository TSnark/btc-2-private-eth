// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

interface IWETH {
  function deposit() external payable;

  function transfer(address to, uint256 value) external returns (bool);

  function withdraw(uint256) external;
}

interface IERC20 {
  function approve(address spender, uint256 value) external returns (bool);

  function transfer(address to, uint256 value) external returns (bool);
}

interface IUniswapV2Router02 {
  function factory() external pure returns (address);

  function WETH() external pure returns (address);

  function getAmountsOut(uint256 amountIn, address[] calldata path)
    external
    view
    returns (uint256[] memory amounts);

  function swapExactTokensForETH(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external returns (uint256[] memory amounts);
}

interface IGateway {
  function mint(
    bytes32 _pHash,
    uint256 _amount,
    bytes32 _nHash,
    bytes calldata _sig
  ) external returns (uint256);

  function burn(bytes calldata _to, uint256 _amount) external returns (uint256);
}

interface IGatewayRegistry {
  function getGatewayBySymbol(string calldata _tokenSymbol)
    external
    view
    returns (IGateway);

  function getTokenBySymbol(string calldata _tokenSymbol)
    external
    view
    returns (address);
}

interface Tornado {
  function deposit(bytes32 _commitment) external payable;
}

contract BTCToPrivateETH {
  event Deposited(
    address indexed _originator,
    uint256 _value,
    bytes32 _commitment
  );
  event EthReturned(address indexed _originator, uint256 _value);
  event BtcReturned(address indexed _originator, uint256 _value);

  IGatewayRegistry private registry;
  IUniswapV2Router02 private uniswapRouter;
  mapping(uint256 => Tornado) private tornados;

  constructor(
    address _registry,
    address _uniswapRouterAddress,
    address _tornadoAddress01,
    address _tornadoAddress1,
    address _tornadoAddress10,
    address _tornadoAddress100
  ) public {
    registry = IGatewayRegistry(_registry);
    uniswapRouter = IUniswapV2Router02(_uniswapRouterAddress);
    tornados[0.1 ether] = Tornado(_tornadoAddress01);
    tornados[1 ether] = Tornado(_tornadoAddress1);
    tornados[10 ether] = Tornado(_tornadoAddress10);
    tornados[100 ether] = Tornado(_tornadoAddress100);
  }

  function deposit(
    // Parameters from users
    address payable _to,
    bytes32 _commitment,
    uint256 _ethAmount,
    // Parameters from Darknodes
    uint256 _amount,
    bytes32 _nHash,
    bytes calldata _sig
  ) external {
    // Call the gateway to retrieve tokens
    bytes32 pHash = keccak256(abi.encode(_to, _commitment, _ethAmount));
    uint256 mintedAmount = registry.getGatewayBySymbol("BTC").mint(
      pHash,
      _amount,
      _nHash,
      _sig
    );

    address renBTCAddress = address(registry.getTokenBySymbol("BTC"));
    IERC20 renBTC = IERC20(renBTCAddress);

    address[] memory path = new address[](2);
    path[0] = renBTCAddress;
    path[1] = uniswapRouter.WETH();
    // Call tornado only if the balance is more or equals than the requested amount
    // Do not send a fraction of the requested amount even if it matches a legal Tornado deposits
    if (
      _isTornadoAdmissible(_ethAmount) &&
      (uniswapRouter.getAmountsOut(mintedAmount, path)[1] >= _ethAmount)
    ) {
      // Approve the exchange to transfer the minted amount
      renBTC.approve(address(uniswapRouter), mintedAmount);
      // Swap and transfer ETH to the BTC sender
      try
        uniswapRouter.swapExactTokensForETH(
          mintedAmount,
          _ethAmount, //We do not allow slippage beyond what the originator requested
          path,
          address(this),
          now
        )
      returns (uint256[] memory) {
        _deposit(_to, _commitment, _ethAmount);
      } catch {
        // If the swap fails we send the whole minted amount back to the originator
        _returnRenBTC(_to, mintedAmount, renBTC);
      }
    } else {
      _returnRenBTC(_to, mintedAmount, renBTC);
    }
  }

  function _isTornadoAdmissible(uint256 _amount) private pure returns (bool) {
    return (_amount == 0.1 ether ||
      _amount == 1 ether ||
      _amount == 10 ether ||
      _amount == 100 ether);
  }

  function _returnRenBTC(
    address _to,
    uint256 _mintedAmount,
    IERC20 renBTC
  ) private {
    renBTC.transfer(_to, _mintedAmount);
    emit BtcReturned(_to, _mintedAmount);
  }

  function _deposit(
    address payable _to,
    bytes32 _commitment,
    uint256 _ethAmount
  ) private {
    tornados[_ethAmount].deposit{ value: _ethAmount }(_commitment);
    emit Deposited(_to, _ethAmount, _commitment);
    //We always return any remainder balance to the originating address
    uint256 remainderBalance = address(this).balance;
    if (remainderBalance > 0) {
      _to.transfer(remainderBalance);
      emit EthReturned(_to, remainderBalance);
    }
  }

  receive() external payable {}
}
