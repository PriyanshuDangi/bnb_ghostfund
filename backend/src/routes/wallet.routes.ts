import { Router, Request, Response } from 'express';
import { createWallet, getWalletAddress } from '../services/wallet.service';

export const walletRouter = Router();

walletRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const { mnemonic } = req.body;
    if (!mnemonic || typeof mnemonic !== 'string') {
      res.status(400).json({ error: 'mnemonic is required (string)' });
      return;
    }

    const wallet = await createWallet(mnemonic);
    res.json({
      id: wallet.id,
      railgunAddress: wallet.railgunAddress,
    });
  } catch (err: any) {
    console.error('[Wallet] Create error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

walletRouter.get('/:walletId/address', async (req: Request, res: Response) => {
  try {
    const { walletId } = req.params;
    const addressData = getWalletAddress(walletId);
    res.json(addressData);
  } catch (err: any) {
    console.error('[Wallet] Address error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
