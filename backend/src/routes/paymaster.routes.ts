import { Router, Request, Response } from 'express';
import {
  getPaymasterInfo,
  calculateOnChainFee,
  fundPaymasterPool,
  isPaymasterConfigured,
} from '../services/paymaster.service';

export const paymasterRouter = Router();

/**
 * GET /api/paymaster — returns on-chain paymaster state
 */
paymasterRouter.get('/', async (_req: Request, res: Response) => {
  if (!isPaymasterConfigured()) {
    res.status(404).json({ error: 'GhostPaymaster not configured' });
    return;
  }

  try {
    const info = await getPaymasterInfo();
    res.json(info);
  } catch (err: any) {
    console.error('[Paymaster] Info error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/paymaster/fee/:amountWei — calculate on-chain fee for a given amount
 */
paymasterRouter.get('/fee/:amountWei', async (req: Request, res: Response) => {
  if (!isPaymasterConfigured()) {
    res.status(404).json({ error: 'GhostPaymaster not configured' });
    return;
  }

  try {
    const amountWei = BigInt(req.params.amountWei);
    const fee = await calculateOnChainFee(amountWei);
    res.json({
      amountWei: amountWei.toString(),
      feeWei: fee.toString(),
    });
  } catch (err: any) {
    console.error('[Paymaster] Fee calc error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/paymaster/fund — fund the paymaster BNB pool (owner/relayer only)
 */
paymasterRouter.post('/fund', async (req: Request, res: Response) => {
  if (!isPaymasterConfigured()) {
    res.status(404).json({ error: 'GhostPaymaster not configured' });
    return;
  }

  try {
    const { amount } = req.body;
    if (!amount) {
      res.status(400).json({ error: 'amount (in wei) is required' });
      return;
    }

    const amountWei = BigInt(amount);
    if (amountWei <= 0n) {
      res.status(400).json({ error: 'amount must be positive' });
      return;
    }

    const txHash = await fundPaymasterPool(amountWei);
    res.json({
      status: 'funded',
      txHash,
      bscscanUrl: `https://testnet.bscscan.com/tx/${txHash}`,
    });
  } catch (err: any) {
    console.error('[Paymaster] Fund error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
