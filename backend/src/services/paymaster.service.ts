import { Contract, formatEther } from 'ethers';
import { GHOST_PAYMASTER } from '../config/constants';
import { getRelayerWallet, getProvider } from './relayer.service';

const GHOST_PAYMASTER_ABI = [
  'function relayer() view returns (address)',
  'function feeBasisPoints() view returns (uint256)',
  'function owner() view returns (address)',
  'function calculateFee(uint256 amount) view returns (uint256)',
  'function feeDeposits(address user, address token) view returns (uint256)',
  'function claimGasReimbursement(uint256 gasUsed, uint256 gasPrice)',
  'function depositFee(address token, uint256 amount)',
  'event GasReimbursed(address indexed relayer, uint256 amount)',
  'event FeeDeposited(address indexed user, address indexed token, uint256 amount)',
  'receive() payable',
];

function getPaymasterContract(): Contract {
  if (!GHOST_PAYMASTER) {
    throw new Error('GHOST_PAYMASTER address not configured');
  }
  return new Contract(GHOST_PAYMASTER, GHOST_PAYMASTER_ABI, getRelayerWallet());
}

function getPaymasterReadonly(): Contract {
  if (!GHOST_PAYMASTER) {
    throw new Error('GHOST_PAYMASTER address not configured');
  }
  return new Contract(GHOST_PAYMASTER, GHOST_PAYMASTER_ABI, getProvider());
}

/**
 * Query on-chain paymaster state: relayer address, fee rate, BNB pool balance.
 */
export async function getPaymasterInfo() {
  const contract = getPaymasterReadonly();
  const provider = getProvider();

  const [relayer, feeBps, owner, poolBalance] = await Promise.all([
    contract.relayer() as Promise<string>,
    contract.feeBasisPoints() as Promise<bigint>,
    contract.owner() as Promise<string>,
    provider.getBalance(GHOST_PAYMASTER),
  ]);

  return {
    address: GHOST_PAYMASTER,
    relayer,
    owner,
    feeBasisPoints: Number(feeBps),
    feePercent: `${Number(feeBps) / 100}%`,
    poolBalanceWei: poolBalance.toString(),
    poolBalanceBNB: formatEther(poolBalance),
  };
}

/**
 * Calculate the on-chain fee for a given amount using the paymaster contract.
 */
export async function calculateOnChainFee(amountWei: bigint): Promise<bigint> {
  const contract = getPaymasterReadonly();
  return contract.calculateFee(amountWei) as Promise<bigint>;
}

/**
 * After a successful unshield tx, the relayer claims gas reimbursement
 * from the paymaster's BNB pool. Fails gracefully if pool is empty.
 */
export async function claimGasReimbursement(
  gasUsed: bigint,
  gasPrice: bigint,
): Promise<{ txHash: string; reimbursement: string } | null> {
  if (!GHOST_PAYMASTER) {
    console.log('[Paymaster] Not configured — skipping reimbursement');
    return null;
  }

  const provider = getProvider();
  const poolBalance = await provider.getBalance(GHOST_PAYMASTER);
  const reimbursement = gasUsed * gasPrice;

  if (poolBalance < reimbursement) {
    console.warn(
      `[Paymaster] Pool too low (${formatEther(poolBalance)} BNB) for reimbursement (${formatEther(reimbursement)} BNB) — skipping`,
    );
    return null;
  }

  try {
    const contract = getPaymasterContract();
    const tx = await contract.claimGasReimbursement(gasUsed, gasPrice);
    const receipt = await tx.wait();
    console.log(
      `[Paymaster] Gas reimbursed: ${formatEther(reimbursement)} BNB (tx: ${receipt.hash})`,
    );
    return { txHash: receipt.hash, reimbursement: reimbursement.toString() };
  } catch (err: any) {
    console.error('[Paymaster] Reimbursement failed:', err.message);
    return null;
  }
}

/**
 * Fund the paymaster's BNB pool so it can reimburse the relayer.
 */
export async function fundPaymasterPool(
  amountWei: bigint,
): Promise<string> {
  const relayer = getRelayerWallet();
  const tx = await relayer.sendTransaction({
    to: GHOST_PAYMASTER,
    value: amountWei,
    gasPrice: 3_000_000_000n,
  });
  const receipt = await tx.wait();
  console.log(
    `[Paymaster] Pool funded with ${formatEther(amountWei)} BNB (tx: ${receipt!.hash})`,
  );
  return receipt!.hash;
}

export function isPaymasterConfigured(): boolean {
  return !!GHOST_PAYMASTER;
}
