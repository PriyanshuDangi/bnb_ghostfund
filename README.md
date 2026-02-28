# GhostFund — Privacy Gas Relayer for BNB Chain

**Break the on-chain link between your wallets.**

GhostFund lets users send BNB from Wallet A to Wallet B with **zero on-chain connection**. It uses [Railgun](https://railgun.org)'s UTXO-based zero-knowledge privacy system — the first gas relayer implementation on BNB Chain — so no observer, analytics firm, or adversary can trace the transfer.

> Built for the BNB Chain Hackathon. All contracts are **deployed and live** on BSC Testnet.

---

## How It Works

```
1. User shields BNB from Wallet A  →  tokens enter Railgun's encrypted Merkle tree
2. User specifies Wallet B          →  a fresh wallet with zero BNB is fine
3. GhostFund relayer generates ZK proof, signs + submits the unshield tx, pays gas
4. Wallet B receives BNB            →  no link to Wallet A on-chain
```

**What the blockchain sees:**

```
TX 1:  0xSource       →  RailgunProxy     (shield — one of many deposits)
TX 2:  GhostRelayer   →  RailgunProxy     (unshield to 0xDest — relayer pays gas)

No transaction between 0xSource and 0xDest. The link is broken.
```

---

## Deployed Contracts (BSC Testnet)

All contracts are live on BNB Smart Chain Testnet (Chain ID 97). See [`bsc.address`](bsc.address) for the full list.

| Contract | Address | Explorer |
|----------|---------|----------|
| **RailgunProxy** | `0x5e0d11D4Ba0B606c4dd19eAbce2d43daFCE6b7c0` | [View](https://testnet.bscscan.com/address/0x5e0d11D4Ba0B606c4dd19eAbce2d43daFCE6b7c0) |
| **RelayAdapt** | `0x254798830B89f716E66D2F77b611320883a7A52C` | [View](https://testnet.bscscan.com/address/0x254798830B89f716E66D2F77b611320883a7A52C) |
| **WBNB** | `0xAc21F2a5fA4297bE7E150Dd8133BcaDe04979033` | [View](https://testnet.bscscan.com/address/0xAc21F2a5fA4297bE7E150Dd8133BcaDe04979033) |
| **GhostPaymaster** | `0x77aDC78a0dfE3A7622149b93977cEe68343eefcF` | [View](https://testnet.bscscan.com/address/0x77aDC78a0dfE3A7622149b93977cEe68343eefcF) |

Deployer / Relayer: [`0x117A3E11a93B2C88713bd35bE47FaFb81E4461C5`](https://testnet.bscscan.com/address/0x117A3E11a93B2C88713bd35bE47FaFb81E4461C5)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), wagmi v2, viem, TailwindCSS |
| Backend | Node.js, TypeScript, Express, ethers.js v6 |
| Privacy | Railgun SDK (`@railgun-community/wallet`), Groth16 ZK proofs (snarkjs) |
| Chain | BNB Smart Chain Testnet (Chain ID 97) |
| Contracts | Solidity + Hardhat (Railgun suite + GhostPaymaster) |
| Infrastructure | Docker, docker-compose |

---

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask with BSC Testnet ([setup guide](docs/TECHNICAL.md#add-bsc-testnet-to-metamask))
- tBNB from the [BSC Faucet](https://www.bnbchain.org/en/testnet-faucet)

### Docker (one command)

```bash
git clone https://github.com/PriyanshuDangi/bnb_ghostfund.git.git && cd ghostfund
cp .env.example backend/.env
# Edit backend/.env — add your RELAYER_PRIVATE_KEY
docker-compose up --build
```

### Manual

```bash
# Backend
cd backend && npm install
cp .env.example .env    # Edit with your values
npm run dev             # Starts on :3001 (first run downloads ZK artifacts ~50-100MB)

# Frontend (new terminal)
cd frontend && npm install
npm run dev             # Starts on :3000
```

Open http://localhost:3000

---

## Project Structure

```
bnb_ghostfund/
├── backend/              # Express API + Railgun Engine
│   ├── src/config/       # Engine init, constants, provider, artifacts
│   ├── src/services/     # wallet, shield, unshield, balance, relayer, paymaster
│   ├── src/routes/       # Thin Express routers
│   └── Dockerfile
├── frontend/             # Next.js 14 app
│   ├── app/              # Pages: /, /shield, /status, /unshield
│   ├── components/       # Navbar, ShieldForm, UnshieldForm, WalletConnect
│   ├── lib/              # wagmi config, API client
│   └── Dockerfile
├── contracts/
│   ├── ghostfund/        # GhostPaymaster (our custom contract)
│   └── railgun/          # Railgun contracts (deployed to BSC testnet)
├── docs/
│   ├── PROJECT.md        # Problem, solution, market fit, roadmap
│   └── TECHNICAL.md      # Architecture diagrams, setup, API reference
├── bsc.address           # All deployed contract addresses + explorer links
├── docker-compose.yml    # One-command launch
├── LICENSE               # MIT
└── .env.example          # Environment variable template
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + relayer balance |
| GET | `/api/fees` | Current fee structure |
| POST | `/api/wallet/create` | Create a Railgun 0zk wallet |
| POST | `/api/shield` | Populate shield tx for MetaMask signing |
| POST | `/api/unshield` | Generate ZK proof + relayer submits tx |
| GET | `/api/status/:txHash` | Transaction status |
| GET | `/api/status/balance/:walletId` | Private shielded balance |
| GET | `/api/paymaster` | GhostPaymaster contract info |

Full API reference in [`docs/TECHNICAL.md`](docs/TECHNICAL.md#api-reference).

---

## Fee Structure

| Fee | Amount | When |
|-----|--------|------|
| Railgun shield fee | 0.25% | On shield |
| Railgun unshield fee | 0.25% | On unshield |
| GhostFund relayer fee | 0.3% | On unshield |
| BSC gas | ~0.003 BNB | Paid by relayer |
| **Total** | **~0.8%** | |

Example: Shield 1 BNB → destination receives ~0.992 BNB.

---

## Demo Flow

1. Connect MetaMask (Wallet A) on BSC Testnet
2. Shield 0.01 BNB from Wallet A on the `/shield` page
3. Check private balance on `/status`
4. Enter Wallet B address (fresh, zero balance) on `/unshield`
5. Submit — relayer generates ZK proof and sends BNB to Wallet B
6. **Verify on BscScan:** no connection between Wallet A and Wallet B

---

## Security

- The relayer sees the destination address and approximate amount
- The relayer **cannot** see the source wallet or full private balance
- PPOI (Private Proof of Innocence) ensures funds aren't from sanctioned addresses
- All secrets are in `.env` (gitignored) — never committed
- `.env.example` files have placeholder values only

---

## Documentation

| Document | What's Inside |
|----------|--------------|
| [`docs/PROJECT.md`](docs/PROJECT.md) | Problem statement, solution, market fit, business model, roadmap |
| [`docs/TECHNICAL.md`](docs/TECHNICAL.md) | Architecture diagrams (Mermaid), user journey flow, API reference, setup guide |
| [`bsc.address`](bsc.address) | All deployed contract addresses with BscScan links |
| [`memory-bank/prd.md`](memory-bank/prd.md) | Full product requirements document |
| [`memory-bank/tdd.md`](memory-bank/tdd.md) | Technical design document (implementation phases) |

---

## Built With

| Project | Role |
|---------|------|
| [Railgun](https://railgun.org) | ZK privacy engine (UTXO-based, Groth16 proofs) |
| [BNB Chain](https://www.bnbchain.org) | Target blockchain (BSC Testnet, Chain ID 97) |
| [snarkjs](https://github.com/iden3/snarkjs) | Groth16 ZK prover |
| [OpenZeppelin](https://openzeppelin.com/contracts) | Smart contract libraries (Ownable, ReentrancyGuard) |
| [Next.js](https://nextjs.org) / [wagmi](https://wagmi.sh) / [viem](https://viem.sh) | Frontend framework + wallet connection |
| [ethers.js v6](https://docs.ethers.org/v6/) | Blockchain interaction |
| [Express](https://expressjs.com/) | Backend REST API |

Full dependency list with versions and licenses in [`docs/PROJECT.md`](docs/PROJECT.md#open-source-dependencies).

---

## License

MIT — see [LICENSE](LICENSE)

---

## Author

**Priyanshu Dangi** — [GitHub](https://github.com/priyanshu-dangi)
