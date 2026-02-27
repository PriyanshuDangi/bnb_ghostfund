import { Router, Request, Response } from 'express';
import { getProvider } from '../services/relayer.service';
import { getPrivateBalance } from '../services/balance.service';

export const statusRouter = Router();

/** GET /api/status/:txHash — Check transaction status on BSC testnet */
statusRouter.get('/:txHash', async (req: Request, res: Response) => {
  try {
    const { txHash } = req.params;

    if (!txHash || !txHash.startsWith('0x') || txHash.length !== 66) {
      res.status(400).json({ error: 'Invalid transaction hash' });
      return;
    }

    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      res.json({ status: 'pending' });
      return;
    }

    res.json({
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      bscscanUrl: `https://testnet.bscscan.com/tx/${txHash}`,
    });
  } catch (err: any) {
    console.error('[Status] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/balance/:walletId — Get private shielded balance */
statusRouter.get(
  '/balance/:walletId',
  async (req: Request, res: Response) => {
    try {
      const { walletId } = req.params;
      if (!walletId) {
        res.status(400).json({ error: 'walletId is required' });
        return;
      }

      const balance = await getPrivateBalance(walletId);
      res.json(balance);
    } catch (err: any) {
      console.error('[Balance] Error:', err.message);
      res.status(500).json({ error: err.message });
    }
  },
);
