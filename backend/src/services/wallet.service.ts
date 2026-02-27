import {
  createRailgunWallet,
  getRailgunWalletAddressData,
} from '@railgun-community/wallet';
import { RAILGUN_ENCRYPTION_KEY } from '../config/constants';

export interface WalletInfo {
  id: string;
  railgunAddress: string;
}

/**
 * Creates a new Railgun 0zk wallet from a mnemonic.
 * The 0zk address is separate from the user's MetaMask (0x) address —
 * it's the private keypair needed for ZK proof generation.
 */
export async function createWallet(mnemonic: string): Promise<WalletInfo> {
  const walletInfo = await createRailgunWallet(
    RAILGUN_ENCRYPTION_KEY,
    mnemonic,
    {},
  );

  if (!walletInfo) {
    throw new Error('Failed to create Railgun wallet');
  }

  return {
    id: walletInfo.id,
    railgunAddress: walletInfo.railgunAddress,
  };
}

/**
 * Retrieves the address data for an existing Railgun wallet.
 */
export function getWalletAddress(walletId: string) {
  return getRailgunWalletAddressData(walletId);
}
