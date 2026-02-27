import {
  refreshBalances,
  balanceForERC20Token,
  walletForID,
} from '@railgun-community/wallet';
import {
  TXIDVersion,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import { NETWORK, RAILGUN_WBNB } from '../config/constants';

export interface PrivateBalance {
  tokenAddress: string;
  symbol: string;
  balanceWei: string;
  balanceFormatted: string;
}

/**
 * Triggers a background Merkle tree scan and reads the shielded WBNB balance.
 * The initial full scan runs on engine startup; subsequent calls do an
 * incremental scan to pick up new events since the last scan.
 */
export async function getPrivateBalance(
  walletId: string,
): Promise<PrivateBalance> {
  const { chain } = NETWORK_CONFIG[NETWORK];

  console.log('[Balance] Refreshing balance for wallet', walletId.substring(0, 16) + '...');

  // Incremental scan — picks up any new events since the last scan.
  // Much faster than a full rescan since it only processes new blocks.
  try {
    await refreshBalances(chain, [walletId]);
  } catch (err: any) {
    console.warn('[Balance] Refresh error (non-fatal):', err.message);
  }

  const wallet = walletForID(walletId);

  let balanceWei = '0';
  try {
    const balance = await balanceForERC20Token(
      TXIDVersion.V2_PoseidonMerkle,
      wallet,
      NETWORK,
      RAILGUN_WBNB,
      false,
    );
    balanceWei = balance?.toString() ?? '0';
  } catch (err: any) {
    console.warn('[Balance] balanceForERC20Token error:', err.message);
  }

  const balanceBNB = Number(balanceWei) / 1e18;
  console.log('[Balance] WBNB:', balanceBNB.toFixed(6), 'BNB');

  return {
    tokenAddress: RAILGUN_WBNB,
    symbol: 'BNB (shielded)',
    balanceWei,
    balanceFormatted: balanceBNB.toFixed(6),
  };
}
