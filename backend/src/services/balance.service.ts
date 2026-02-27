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
 * Scans the Merkle tree and returns the private (shielded) WBNB balance
 * for a given Railgun wallet. The balance is denominated in WBNB but
 * displayed to the user as "BNB (shielded)".
 */
export async function getPrivateBalance(
  walletId: string,
): Promise<PrivateBalance> {
  const { chain } = NETWORK_CONFIG[NETWORK];

  // Refresh balances by scanning the Merkle tree
  await refreshBalances(chain, [walletId]);

  const wallet = walletForID(walletId);
  const balance = await balanceForERC20Token(
    TXIDVersion.V2_PoseidonMerkle,
    wallet,
    NETWORK,
    RAILGUN_WBNB,
    true,
  );

  const balanceWei = balance?.toString() ?? '0';
  const balanceBNB = Number(balanceWei) / 1e18;

  return {
    tokenAddress: RAILGUN_WBNB,
    symbol: 'BNB (shielded)',
    balanceWei,
    balanceFormatted: balanceBNB.toFixed(6),
  };
}
