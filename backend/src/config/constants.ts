import { NetworkName } from '@railgun-community/shared-models';
import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

// BSC Testnet RPC (primary + optional fallback)
export const BSC_TESTNET_RPC = requireEnv('BSC_TESTNET_RPC');
export const BSC_TESTNET_RPC_FALLBACK = process.env.BSC_TESTNET_RPC_FALLBACK || '';

// Railgun contract addresses (deployed in Phase 1)
export const RAILGUN_PROXY = requireEnv('RAILGUN_PROXY');
export const RAILGUN_RELAY_ADAPT = requireEnv('RAILGUN_RELAY_ADAPT');
export const RAILGUN_WBNB = requireEnv('RAILGUN_WBNB');
export const DEPLOYMENT_BLOCK = parseInt(process.env.DEPLOYMENT_BLOCK || '0');

// Relayer wallet (funded with tBNB)
export const RELAYER_PRIVATE_KEY = requireEnv('RELAYER_PRIVATE_KEY');

// GhostPaymaster contract (on-chain gas reimbursement)
export const GHOST_PAYMASTER = process.env.GHOST_PAYMASTER || '';

// Railgun 0zk wallet credentials (mnemonic is optional — wallets created per-user via API)
export const RAILGUN_MNEMONIC = process.env.RAILGUN_MNEMONIC || '';
export const RAILGUN_ENCRYPTION_KEY = requireEnv('RAILGUN_ENCRYPTION_KEY');

// Engine storage
export const ENGINE_DB_PATH = process.env.ENGINE_DB_PATH || './engine.db';
export const ARTIFACTS_PATH = process.env.ARTIFACTS_PATH || './artifacts';

// PPOI aggregator
export const PPOI_AGGREGATOR_URL =
  process.env.PPOI_AGGREGATOR_URL || 'https://ppoi-agg.horsewithsixlegs.xyz';

// Server
export const PORT = parseInt(process.env.PORT || '3001');

// Using Hardhat network name with runtime overrides (see engine.ts)
// Switch to NetworkName.BNBChainTestnet if using the shared-models fork
export const NETWORK = NetworkName.Hardhat;

// Relayer fee: 0.3% of unshielded amount
export const RELAYER_FEE_BASIS_POINTS = 30;

export const BSC_TESTNET_CHAIN_ID = 97;
