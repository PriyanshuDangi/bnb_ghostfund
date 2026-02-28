import express from 'express';
import cors from 'cors';
import { PORT, RELAYER_FEE_BASIS_POINTS } from './config/constants';
import { initializeRailgunEngine } from './config/engine';
import { walletRouter } from './routes/wallet.routes';
import { shieldRouter } from './routes/shield.routes';
import { unshieldRouter } from './routes/unshield.routes';
import { statusRouter } from './routes/status.routes';
import { getRelayerWallet } from './services/relayer.service';

// BigInt JSON serialization — Express cannot serialize BigInt natively
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();

app.use(cors());
app.use(express.json());

// Request timeout for long-running proof generation (60s)
app.use((_req, _res, next) => {
  _req.setTimeout(120_000);
  _res.setTimeout(120_000);
  next();
});

// Routes
app.use('/api/wallet', walletRouter);
app.use('/api/shield', shieldRouter);
app.use('/api/unshield', unshieldRouter);
app.use('/api/status', statusRouter);

// Fee info endpoint
app.get('/api/fees', (_req, res) => {
  res.json({
    relayerFeeBasisPoints: RELAYER_FEE_BASIS_POINTS,
    relayerFeePercent: `${RELAYER_FEE_BASIS_POINTS / 100}%`,
    railgunShieldFeePercent: '0.25%',
    railgunUnshieldFeePercent: '0.25%',
    totalApproxPercent: '0.8%',
    token: 'BNB',
  });
});

// Debug: inspect wallet UTXO state
app.get('/api/debug/wallet/:walletId', async (_req, res) => {
  try {
    const { walletForID } = require('@railgun-community/wallet');
    const { TXIDVersion } = require('@railgun-community/shared-models');
    const { NETWORK } = require('./config/constants');
    const wallet = walletForID(_req.params.walletId);
    const balances = wallet.balances?.[TXIDVersion.V2_PoseidonMerkle]?.[NETWORK];
    const utxos = wallet.utxos?.[TXIDVersion.V2_PoseidonMerkle]?.[NETWORK];
    res.json({
      id: wallet.id,
      hasBalances: !!balances,
      balanceKeys: balances ? Object.keys(balances) : [],
      balances: balances ?? {},
      hasUtxos: !!utxos,
      utxoCount: utxos ? Object.keys(utxos).length : 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    const wallet = getRelayerWallet();
    const balance = await wallet.provider!.getBalance(wallet.address);
    res.json({
      status: 'ok',
      network: 'bsc-testnet',
      chainId: 97,
      relayerAddress: wallet.address,
      relayerBalanceWei: balance.toString(),
    });
  } catch {
    res.json({ status: 'ok', network: 'bsc-testnet', chainId: 97 });
  }
});

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  GhostFund — Privacy Gas Relayer for BNB  ');
  console.log('═══════════════════════════════════════════');
  console.log('[GhostFund] Initializing Railgun Engine...');

  await initializeRailgunEngine();

  app.listen(PORT, () => {
    console.log(`[GhostFund] Server running on http://localhost:${PORT}`);
    console.log(`[GhostFund] Health: http://localhost:${PORT}/api/health`);
  });
}

main().catch((err) => {
  console.error('[GhostFund] Fatal error:', err);
  process.exit(1);
});
