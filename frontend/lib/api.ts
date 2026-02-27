const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

// Wallet
export interface WalletResponse {
  id: string;
  railgunAddress: string;
}

export function createWallet(mnemonic: string): Promise<WalletResponse> {
  return request('/wallet/create', {
    method: 'POST',
    body: JSON.stringify({ mnemonic }),
  });
}

// Balance
export interface BalanceResponse {
  tokenAddress: string;
  symbol: string;
  balanceWei: string;
  balanceFormatted: string;
}

export function getBalance(walletId: string): Promise<BalanceResponse> {
  return request(`/status/balance/${walletId}`);
}

// Shield
export interface ShieldTransaction {
  to: string;
  data: string;
  value: string;
}

export interface ShieldResponse {
  transaction: ShieldTransaction;
}

export function getShieldSignatureMessage(): Promise<{ message: string }> {
  return request('/shield/signature-message');
}

export function populateShield(
  amount: string,
  railgunAddress: string,
  shieldPrivateKey: string,
): Promise<ShieldResponse> {
  return request('/shield', {
    method: 'POST',
    body: JSON.stringify({ amount, railgunAddress, shieldPrivateKey }),
  });
}

// Unshield
export interface UnshieldResponse {
  status: string;
  txHash: string;
  bscscanUrl: string;
}

export function requestUnshield(
  walletId: string,
  amount: string,
  destinationAddress: string,
): Promise<UnshieldResponse> {
  return request('/unshield', {
    method: 'POST',
    body: JSON.stringify({ walletId, amount, destinationAddress }),
  });
}

// Status
export interface TxStatusResponse {
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  bscscanUrl?: string;
}

export function getTxStatus(txHash: string): Promise<TxStatusResponse> {
  return request(`/status/${txHash}`);
}

// Fees
export interface FeesResponse {
  relayerFeeBasisPoints: number;
  relayerFeePercent: string;
  railgunShieldFeePercent: string;
  railgunUnshieldFeePercent: string;
  totalApproxPercent: string;
  token: string;
}

export function getFees(): Promise<FeesResponse> {
  return request('/fees');
}

// Health
export interface HealthResponse {
  status: string;
  network: string;
  chainId: number;
  relayerAddress?: string;
  relayerBalanceWei?: string;
}

export function getHealth(): Promise<HealthResponse> {
  return request('/health');
}
