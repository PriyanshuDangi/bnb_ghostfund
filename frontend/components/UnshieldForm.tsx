'use client';

import { useState, useEffect } from 'react';
import { parseEther } from 'viem';
import {
  createWallet,
  requestUnshield,
  getFees,
  getPaymasterInfo,
  type FeesResponse,
  type PaymasterResponse,
} from '@/lib/api';
import { TxStatus } from './TxStatus';

export function UnshieldForm() {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [proofProgress, setProofProgress] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    txHash: string;
    bscscanUrl: string;
  } | null>(null);
  const [fees, setFees] = useState<FeesResponse | null>(null);
  const [paymaster, setPaymaster] = useState<PaymasterResponse | null>(null);
  const [walletId, setWalletId] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('ghostfund_wallet');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWalletId(parsed.id);
        if (parsed.mnemonic) {
          createWallet(parsed.mnemonic).catch(() => {});
        }
      } catch {
        // ignore
      }
    }

    getFees().then(setFees).catch(() => {});
    getPaymasterInfo().then(setPaymaster).catch(() => {});
  }, []);

  async function handleUnshield() {
    if (!walletId || !destination || !amount) return;

    setError('');
    setResult(null);
    setLoading(true);
    setProofProgress('Submitting request to relayer...');

    try {
      const amountWei = parseEther(amount).toString();
      setProofProgress(
        'Generating ZK proof — this takes 20-30 seconds...',
      );

      const res = await requestUnshield(walletId, amountWei, destination);
      setResult({ txHash: res.txHash, bscscanUrl: res.bscscanUrl });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProofProgress('');
    }
  }

  const isValidAddress =
    destination.startsWith('0x') && destination.length === 42;

  return (
    <div className="space-y-6">
      {/* No wallet warning */}
      {!walletId && (
        <div className="panel-warning">
          <p className="text-sm text-amber-400">
            No wallet found. Please shield BNB first to create a private
            wallet.
          </p>
        </div>
      )}

      {/* Destination address */}
      <div>
        <label htmlFor="dest-address" className="label">
          Destination Address
        </label>
        <input
          id="dest-address"
          type="text"
          placeholder="0x... (fresh wallet with zero balance)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="input-field font-mono text-sm"
          disabled={loading}
        />
        <p className="text-xs text-gray-600 mt-2">
          This can be a brand new wallet with zero BNB — the relayer pays gas
        </p>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="unshield-amount" className="label">
          Amount (BNB)
        </label>
        <input
          id="unshield-amount"
          type="number"
          step="0.001"
          min="0"
          placeholder="0.09"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
          disabled={loading}
        />
      </div>

      {/* Fee breakdown */}
      {amount && parseFloat(amount) > 0 && fees && (
        <div className="card-flat space-y-2 animate-fade-in">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Unshield amount</span>
            <span className="text-gray-200">{amount} BNB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Railgun fee ({fees.railgunUnshieldFeePercent})
            </span>
            <span className="text-gray-500">
              -{(parseFloat(amount) * 0.0025).toFixed(6)} BNB
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Relayer fee ({fees.relayerFeePercent})
            </span>
            <span className="text-gray-500">
              -{(parseFloat(amount) * 0.003).toFixed(6)} BNB
            </span>
          </div>
          <div className="border-t border-surface-400/40 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-gray-300">Destination receives</span>
            <span className="text-bnb-400">
              ~{(parseFloat(amount) * 0.9945).toFixed(6)} BNB
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Gas is paid by the GhostFund relayer — destination needs zero BNB
          </p>
        </div>
      )}

      {/* GhostPaymaster info */}
      {paymaster && (
        <div className="card-flat space-y-2 border-bnb-400/15 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-bnb-400 animate-pulse-glow" />
            <span className="text-xs font-semibold text-bnb-400 uppercase tracking-wider">
              GhostPaymaster
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Contract</span>
            <a
              href={`https://testnet.bscscan.com/address/${paymaster.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-bnb-400 hover:text-bnb-300 font-mono text-xs transition-colors duration-200"
            >
              {paymaster.address.slice(0, 6)}...{paymaster.address.slice(-4)}
            </a>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">On-chain fee rate</span>
            <span className="text-gray-200">{paymaster.feePercent}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Gas reimbursement pool</span>
            <span className="text-gray-200">
              {parseFloat(paymaster.poolBalanceBNB).toFixed(4)} BNB
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleUnshield}
        disabled={!walletId || !isValidAddress || !amount || loading}
        className="btn-primary w-full"
      >
        {loading ? proofProgress || 'Processing...' : 'Unshield BNB'}
      </button>

      {/* ZK proof progress */}
      {loading && (
        <div className="flex items-center gap-3 panel-info animate-fade-in">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-bnb-400 border-t-transparent" />
          <p className="text-sm text-bnb-400">{proofProgress}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="panel-error">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          <TxStatus
            txHash={result.txHash}
            status="confirmed"
            bscscanUrl={result.bscscanUrl}
          />
          <div className="panel-success">
            <p className="text-sm text-bnb-400 font-semibold">
              No on-chain link between your source and destination wallets!
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Search BscScan for any connection between them — you won&apos;t
              find one.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
