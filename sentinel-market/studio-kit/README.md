# SentinelMarket × BNB Agent Studio

Turns the browser demo into a real agent economy on **BSC testnet**:

| Demo step                    | Real implementation                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| Worker agents + reputation   | Seller agents built with **BNB Agent Studio**, identity via **ERC-8004**                                |
| Escrow / pay / refund        | **ERC-8183** jobs (createJob → registerJob → fund → settle)                                             |
| Sentinel hires by reputation | `sentinel/sentinel.ts` (buyer, uses `@bnbagent/sdk`)                                                    |
| Verifier                     | `verify()` in `sentinel.ts` (scores the deliverable)                                                    |
| Self-funding                 | Sentinel sells its own alert via an X402/ERC-8183 face; `bag budget enable` auto-refills the LLM wallet |

> Studio manages keys and funds and is under active development. Use **BSC testnet** and throwaway wallets only. Never paste wallet passwords into chat.

## 1. Install (Node 22+, pnpm 10, Bun 1.3+ for deploy)

```
npm install --global @bnbagent/studio-cli
bag skills install        # then reload Claude Code / Cursor
```

## 2. Build the three worker (seller) agents

Open Claude Code or Cursor in an empty folder per agent and run one prompt each:

**ScanBot**

```
/bnbagent-studio Create a BNB Chain seller agent named scanbot that sells rug-pull
risk scans for BEP-20 tokens (returns a 0-100 risk score with cited on-chain
evidence). Start on bsc-testnet, use ERC-8183, expose A2A and MCP, default wallet
and LLM, store deliverables on IPFS. Price 0.03 per job.
```

**QuoteFox**

```
/bnbagent-studio Create a seller agent named quotefox that sells PancakeSwap v3 LP
rebalance quotes. bsc-testnet, ERC-8183, A2A + MCP, default wallet/LLM, IPFS. Price 0.04.
```

**CheapGuess** (the low-quality one, so reputation has something to punish)

```
/bnbagent-studio Create a seller agent named cheapguess that sells quick whale-wallet
movement digests. bsc-testnet, ERC-8183, A2A, default wallet/LLM, IPFS. Price 0.02.
```

Implement only `runWork` in each `app/agent/src/sellerCore.ts`, then:

```
bag doctor && bag dev                      # local test (A2A :9000)
bag deploy prepare
bag deploy --provider bnb                  # 48h managed testnet trial (throwaway wallet!)
bag deploy verify --provider bnb           # confirms the ERC-8004 identity
```

Copy each agent's wallet address, public URL and agent id into `sentinel/workers.json`.

## 3. Run the Sentinel (buyer / verifier / treasury)

```
cd sentinel && pnpm install
cp .env.example .env.local     # fill WALLET_PASSWORD, PRIVATE_KEY (first run only), faucet-funded
pnpm start "Rug-pull scan on 0x..."
```

Get test BNB and tokens from <https://www.bnbchain.org/en/testnet-faucet>.

## 4. Known gaps (verify before demo day)

- `negotiate`, `notify_funded` and deliverable fetch are isolated in the `adapter` section of `sentinel.ts`. The exact A2A JSON-RPC shapes come from each agent's card at `/.well-known/agent.json`; check them against your deployed agent.
- The reject/dispute call is not in the docs I read. See `typescript/examples/client/` ("dispute-reject") in <https://github.com/bnb-chain/bnbagent-sdk> and wire it into `rejectJob()`.
- Reputation here is a local JSON file (`reputation.json`). Swap in the ERC-8004 reputation registry if your SDK version exposes it.
- Studio never auto-settles a buyer's job; settlement is deliberate in this script.
