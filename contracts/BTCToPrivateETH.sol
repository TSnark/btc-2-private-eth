pragma solidity >=0.5.0;


interface IWETH {
    function deposit() external payable;

    function transfer(address to, uint256 value) external returns (bool);

    function withdraw(uint256) external;
}


interface IUniswapV2Router01 {
    function factory() external pure returns (address);

    function WETH() external pure returns (address);

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

    function burn(bytes calldata _to, uint256 _amount)
        external
        returns (uint256);
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
    IGatewayRegistry private registry;
    IUniswapV2Router01 private uniswapRouter;
    Tornado private tornado;

    constructor(
        address _registry,
        address _uniswapRouterAddress,
        address _tornadoAddress
    ) public {
        registry = IGatewayRegistry(_registry);
        uniswapRouter = IUniswapV2Router01(_uniswapRouterAddress);
        tornado = Tornado(_tornadoAddress);
    }

    function deposit(
        // Parameters from users
        address payable _to,
        bytes32 _commitment,
        // Parameters from Darknodes
        uint256 _amount,
        bytes32 _nHash,
        bytes calldata _sig
    ) external {
        bytes32 pHash = keccak256(abi.encode(_to, _commitment));
        uint256 mintedAmount = registry.getGatewayBySymbol("BTC").mint(
            pHash,
            _amount,
            _nHash,
            _sig
        );

        address zBTCAddress = address(registry.getTokenBySymbol("BTC"));
        // Approve the exchange to transfer the minted amount
        safeApprove(zBTCAddress, address(uniswapRouter), mintedAmount);

        address[] memory path = new address[](2);
        path[0] = zBTCAddress;
        path[1] = uniswapRouter.WETH();
        // Swap and transfer ETH to the BTC sender
        uniswapRouter.swapExactTokensForETH(
            mintedAmount,
            0,
            path,
            address(this),
            now //Maybe encode in payload
        );

        //We call tornado only if the balance is enough
        if (address(this).balance >= 0.1 ether) {
            tornado.deposit.value(0.1 ether)(_commitment);
        }
        _to.transfer(address(this).balance);
    }

    function() external payable {}

    function safeApprove(
        address token,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0x095ea7b3, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "BTCToETH: APPROVE_FAILED"
        );
    }
}
