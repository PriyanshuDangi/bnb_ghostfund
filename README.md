# GhostFund — Privacy Gas Relayer for BNB Chain

GhostFund breaks the on-chain link between source and destination wallets on BNB Chain. It uses Railgun's UTXO-based ZK privacy system to let users shield BNB from Wallet A and unshield it to Wallet B — with zero on-chain connection between the two.

## How It Works

```
1. User shields BNB from Wallet A → tokens enter Railgun's encrypted Merkle tree
2. User specifies Wallet B as destination
3. GhostFund relayer generates a ZK proof, signs + submits the unshield tx, pays gas
4. Wallet B receives BNB — no link to Wallet A on-chain
```

**What the blockchain sees:**

```
TX 1: 0xSource → RailgunProxy          (shield — one of many deposits)
TX 2: GhostRelayer → RailgunProxy      (unshield to 0xDest — relayer pays gas)

No transaction between 0xSource and 0xDest. The link is broken.
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), wagmi v2, viem, TailwindCSS |
| Backend | Node.js, TypeScript, Express |
| Privacy | Railgun SDK, Groth16 ZK proofs (snarkjs) |
| Chain | BNB Smart Chain Testnet (Chain ID 97) |
| Contracts | Solidity + Hardhat (Railgun + GhostPaymaster) |

## Project Structure

```
bnb_ghostfund/
├── backend/              # Express API + Railgun Engine
│   ├── src/config/       # Engine init, constants, provider, artifacts
│   ├── src/services/     # wallet, shield, unshield, balance, relayer
│   └── src/routes/       # Thin Express routers
├── frontend/             # Next.js app
│   ├── app/              # Pages: /, /shield, /status, /unshield
│   ├── components/       # UI components
│   └── lib/              # wagmi config, API client
├── contracts/ghostfund/  # GhostPaymaster contract
├── packages/shared-models/ # SDK patch docs
└── docker-compose.yml    # One-command launch
```

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask with BSC Testnet configured
- tBNB from the [BSC Faucet](https://www.bnbchain.org/en/testnet-faucet)

### 1. Deploy Railgun Contracts (Phase 1)

```bash
git clone git@github.com:railgun-privacy/contract.git contracts/railgun
cd contracts/railgun && npm install
# Add bscTestnet to hardhat.config.ts (see memory-bank/tdd.md Phase 1)
DEPLOYER_PRIVATE_KEY=0x... npx hardhat deploy:test --network bscTestnet
```

Record the deployed addresses (proxy, relayAdapt, WBNB, deployment block).

### 2. Configure Environment

```bash
cp .env.example backend/.env
# Edit backend/.env with deployed contract addresses + relayer private key
```

### 3. Start Backend

```bash
cd backend
npm install
npm run dev
```

The backend initializes the Railgun Engine, downloads ZK artifacts (~50-100MB on first run), and starts on port 3001.

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### 5. Docker (Alternative)

```bash
docker-compose up --build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/wallet/create` | Create a Railgun 0zk wallet |
| POST | `/api/shield` | Populate a shield tx for MetaMask signing |
| POST | `/api/unshield` | Generate ZK proof + relayer submits tx |
| GET | `/api/status/:txHash` | Check transaction status |
| GET | `/api/status/balance/:walletId` | Get private shielded balance |
| GET | `/api/fees` | Get current fee structure |
| GET | `/api/health` | Health check + relayer balance |

## Fee Structure

| Fee | Amount | When |
|-----|--------|------|
| Railgun shield fee | 0.25% | On shield |
| Railgun unshield fee | 0.25% | On unshield |
| GhostFund relayer fee | 0.3% | On unshield |
| BSC gas | ~0.003 BNB | Paid by relayer |
| **Total** | **~0.8%** | |

## Demo Flow

1. Connect MetaMask (Wallet A) on BSC Testnet
2. Shield 0.1 BNB from Wallet A
3. Check private balance on the Status page
4. Enter Wallet B address (fresh, zero balance) on the Unshield page
5. Submit — relayer generates ZK proof and sends BNB to Wallet B
6. Verify on BscScan: no connection between Wallet A and Wallet B

## Security

- The relayer sees the destination address and approximate amount
- The relayer **cannot** see the source wallet or private balance
- PPOI (Private Proof of Innocence) ensures funds aren't from sanctioned addresses
- All secrets are in `.env` (gitignored) — never committed

## License

MIT — see [LICENSE](LICENSE)

## Built With

- [Railgun](https://railgun.org) — ZK privacy engine
- [BNB Chain](https://www.bnbchain.org) — target blockchain
- [snarkjs](https://github.com/iden3/snarkjs) — Groth16 prover
- [Next.js](https://nextjs.org) / [wagmi](https://wagmi.sh) / [viem](https://viem.sh)
