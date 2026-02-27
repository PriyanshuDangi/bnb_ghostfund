import { EVMGasType } from '@railgun-community/shared-models';

/**
 * BSC uses legacy (Type0) gas pricing.
 * Default gas price fallback: 10 gwei.
 */
export const DEFAULT_GAS_PRICE = 10_000_000_000n;

export interface GasDetailsType0 {
  evmGasType: typeof EVMGasType.Type0;
  gasEstimate: bigint;
  gasPrice: bigint;
}

/** Build Type0 gas details for BSC transactions */
export function buildGasDetails(
  gasEstimate: bigint,
  gasPrice: bigint = DEFAULT_GAS_PRICE,
): GasDetailsType0 {
  return {
    evmGasType: EVMGasType.Type0,
    gasEstimate,
    gasPrice,
  };
}

/** Calculate fee in wei from basis points (e.g., 30 bps = 0.3%) */
export function calculateFee(amountWei: bigint, basisPoints: number): bigint {
  return (amountWei * BigInt(basisPoints)) / 10_000n;
}
