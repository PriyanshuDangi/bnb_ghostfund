import {
  gasEstimateForUnprovenUnshieldBaseToken,
  generateUnshieldBaseTokenProof,
  populateProvedUnshieldBaseToken,
} from '@railgun-community/wallet';
import {
  TXIDVersion,
  type RailgunERC20Amount,
  EVMGasType,
} from '@railgun-community/shared-models';
import {
  NETWORK,
  RAILGUN_ENCRYPTION_KEY,
  RAILGUN_WBNB,
} from '../config/constants';
import { getRelayerWallet, getProvider } from './relayer.service';
import { claimGasReimbursement, isPaymasterConfigured } from './paymaster.service';

/**
 * Full unshield flow:
 * 1. Estimate gas for the unshield tx
 * 2. Generate ZK proof (Groth16, takes 20-30 seconds)
 * 3. Populate the proved transaction
 * 4. Relayer signs and submits to BSC testnet
 *
 * The relayer pays BNB gas from its own funded wallet.
 */
export async function unshieldBNB(
  railgunWalletId: string,
  destinationAddress: string,
  amountWei: bigint,
): Promise<string> {
  const provider = getProvider();
  const relayerWallet = getRelayerWallet();

  const wrappedERC20Amount: RailgunERC20Amount = {
    tokenAddress: RAILGUN_WBNB,
    amount: amountWei,
  };

  const sendWithPublicWallet = true;
  const feeBlock = await provider.getBlock('latest');
  const MIN_GAS_PRICE = 3_000_000_000n; // 3 gwei — BSC testnet minimum
  const gasPrice = (feeBlock?.baseFeePerGas && feeBlock.baseFeePerGas > 0n)
    ? feeBlock.baseFeePerGas
    : MIN_GAS_PRICE;

  // 1. Gas estimate
  const originalGasDetails = {
    evmGasType: EVMGasType.Type0 as const,
    gasEstimate: 0n,
    gasPrice,
  };

  console.log('[Unshield] Estimating gas...');
  const { gasEstimate } = await gasEstimateForUnprovenUnshieldBaseToken(
    TXIDVersion.V2_PoseidonMerkle,
    NETWORK,
    destinationAddress,
    railgunWalletId,
    RAILGUN_ENCRYPTION_KEY,
    wrappedERC20Amount,
    originalGasDetails,
    undefined,
    sendWithPublicWallet,
  );

  // 2. Generate ZK proof
  console.log('[Unshield] Generating ZK proof (this takes 20-30 seconds)...');
  const progressCallback = (progress: number) => {
    console.log(`[Unshield] Proof progress: ${(progress * 100).toFixed(0)}%`);
  };

  await generateUnshieldBaseTokenProof(
    TXIDVersion.V2_PoseidonMerkle,
    NETWORK,
    destinationAddress,
    railgunWalletId,
    RAILGUN_ENCRYPTION_KEY,
    wrappedERC20Amount,
    undefined,
    sendWithPublicWallet,
    gasPrice,
    progressCallback,
  );

  // 3. Populate proved transaction
  console.log('[Unshield] Populating proved transaction...');
  const transactionGasDetails = {
    evmGasType: EVMGasType.Type0 as const,
    gasEstimate,
    gasPrice,
  };

  const { transaction } = await populateProvedUnshieldBaseToken(
    TXIDVersion.V2_PoseidonMerkle,
    NETWORK,
    destinationAddress,
    railgunWalletId,
    wrappedERC20Amount,
    undefined,
    sendWithPublicWallet,
    gasPrice,
    transactionGasDetails,
  );

  // 4. Relayer signs and submits
  console.log('[Unshield] Relayer submitting transaction...');
  const tx = await relayerWallet.sendTransaction({
    to: transaction.to,
    data: transaction.data,
    gasLimit: gasEstimate,
    gasPrice,
    value: transaction.value ?? 0n,
  });

  console.log(`[Unshield] Tx submitted: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`[Unshield] Tx confirmed in block ${receipt?.blockNumber}`);

  // Claim gas reimbursement from GhostPaymaster (non-blocking, best-effort)
  if (isPaymasterConfigured() && receipt) {
    const actualGasUsed = receipt.gasUsed;
    claimGasReimbursement(actualGasUsed, gasPrice).catch((err) => {
      console.warn('[Unshield] Paymaster reimbursement skipped:', err.message);
    });
  }

  return tx.hash;
}
