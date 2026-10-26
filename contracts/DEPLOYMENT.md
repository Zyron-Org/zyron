# ZyronAttestation – Monad Testnet Deployment

| Field | Value |
|---|---|
| Network | Monad Testnet |
| Chain ID | 10143 |
| RPC | https://testnet-rpc.monad.xyz |
| Explorer | https://testnet.monadvision.com |
| Native token | MON |
| Contract address | **0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3** |
| Explorer | https://testnet.monadvision.com/address/0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3 |
| Deploy tx | 0xe7e706c56c781c5fe66bf13c13b177484094568bcd8625c8f9458001063ed356 |
| Block | 68403973 |
| Deployer / admin / operator | 0x48b106E3C8681D08c513268854Aef257883298d3 |

Verified on-chain after deploy: code present, `name()` = "Zyron Security Seal",
`admin`/`operator` as above, `attestationCount` = 0, EIP-712 domain chainId = 10143.

> The deployer is a throwaway testnet key. Before production, rotate admin via
> `initiateAdminTransfer` / `acceptAdminTransfer` and set a dedicated operator via `setOperator`.

## Deploy

```bash
cp .env.example .env   # fill in PRIVATE_KEY (funded with MON)
source .env
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $MONAD_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

The script reverts unless `block.chainid == 10143`. After deploying, record
the address here and in `deployment-monad-testnet.json` (done for the current deployment).

## Previous deployment (superseded)

Arbitrum Sepolia (421614): see `deployment-arbitrum-sepolia.json`.
