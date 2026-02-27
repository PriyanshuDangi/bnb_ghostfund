import { Router, Request, Response } from 'express';
import { unshieldBNB } from '../services/unshield.service';

export const unshieldRouter = Router();

/**
 * Blocking endpoint — proof generation takes 20-30 seconds.
 * For hackathon simplicity, we block the request and return the tx hash.
 * Production would use a job queue + SSE/WebSocket for progress streaming.
 */
unshieldRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { walletId, amount, destinationAddress } = req.body;

    if (!walletId || !amount || !destinationAddress) {
      res.status(400).json({
        error: 'walletId, amount, and destinationAddress are required',
      });
      return;
    }

    if (
      typeof destinationAddress !== 'string' ||
      !destinationAddress.startsWith('0x') ||
      destinationAddress.length !== 42
    ) {
      res.status(400).json({ error: 'Invalid BSC address (must be 0x + 40 hex chars)' });
      return;
    }

    const amountWei = BigInt(amount);
    if (amountWei <= 0n) {
      res.status(400).json({ error: 'amount must be positive' });
      return;
    }

    console.log(`[Unshield] Request: ${amountWei} wei → ${destinationAddress}`);
    const txHash = await unshieldBNB(walletId, destinationAddress, amountWei);

    res.json({
      status: 'confirmed',
      txHash,
      bscscanUrl: `https://testnet.bscscan.com/tx/${txHash}`,
    });
  } catch (err: any) {
    console.error('[Unshield] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
