import { Router, Request, Response } from 'express';
import {
  populateShieldBNB,
  getShieldSignatureMessage,
} from '../services/shield.service';

export const shieldRouter = Router();

/**
 * GET /api/shield/signature-message
 * Returns the message the user must sign to derive the shield private key.
 */
shieldRouter.get('/signature-message', (_req: Request, res: Response) => {
  try {
    const message = getShieldSignatureMessage();
    res.json({ message });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/shield
 * Populates a shield transaction for MetaMask signing.
 */
shieldRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { amount, railgunAddress, shieldPrivateKey } = req.body;

    if (!amount || !railgunAddress || !shieldPrivateKey) {
      res.status(400).json({
        error: 'amount, railgunAddress, and shieldPrivateKey are required',
      });
      return;
    }

    if (
      typeof railgunAddress !== 'string' ||
      !railgunAddress.startsWith('0zk')
    ) {
      res.status(400).json({ error: 'railgunAddress must start with 0zk' });
      return;
    }

    const amountWei = BigInt(amount);
    if (amountWei <= 0n) {
      res.status(400).json({ error: 'amount must be positive' });
      return;
    }

    console.log(
      `[Shield] Populating shield tx: ${amountWei} wei → ${railgunAddress}`,
    );
    const transaction = await populateShieldBNB(
      railgunAddress,
      shieldPrivateKey,
      amountWei,
    );

    res.json({
      transaction: {
        to: transaction.to,
        data: transaction.data,
        value: transaction.value?.toString() ?? '0',
      },
    });
  } catch (err: any) {
    console.error('[Shield] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
