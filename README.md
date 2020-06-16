## BTC to Private ETH

This is a very preliminary test version.

[Live test version](https://tsnark.github.io/btc-2-private-eth/).

### How does this work

### Deposits

This DApp converts your BTC into private ETH.

After your BTC transfer is confirmed (2 blocks), you can withdraw your ETH to a wallet of your choice without having any on chain link between the BTC you sent and the ETH you received.

### Withdrawals

To withdraw your private ETH, go to Tornado Cash and present the secret note from this Dapp.

### Technical explanation.

This DApp performs the following steps:

1. Queries the latest price of the pair zBTC/ETH on Uniswap V2

2. Sets up a REN VM mint and transfer to convert BTC into zBTC Once the transfer is confirmed

3. Mints new zBTC using the REN VM signature

4. Converts zBTC into ETH on Uniswap V2

5. Deposits ETH into Tornado Cash

6. Forwards the remainder ETH to the originating user Address
