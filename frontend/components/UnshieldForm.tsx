'use client';

import { useState, useEffect } from 'react';
import { parseEther } from 'viem';
import { requestUnshield, getFees, type FeesResponse } from '@/lib/api';
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
  const [walletId, setWalletId] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('ghostfund_wallet');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWalletId(parsed.id);
      } catch {
        // ignore
      }
    }

    getFees().then(setFees).catch(() => {});
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
      {!walletId && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-400">
            No wallet found. Please shield BNB first to create a private
            wallet.
          </p>
        </div>
      )}

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
        <p className="text-xs text-gray-500 mt-2">
          This can be a brand new wallet with zero BNB — the relayer pays gas
        </p>
      </div>

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

      {amount && parseFloat(amount) > 0 && fees && (
        <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Unshield amount</span>
            <span className="text-gray-200">{amount} BNB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Railgun fee ({fees.railgunUnshieldFeePercent})
            </span>
            <span className="text-gray-400">
              -{(parseFloat(amount) * 0.0025).toFixed(6)} BNB
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Relayer fee ({fees.relayerFeePercent})
            </span>
            <span className="text-gray-400">
              -{(parseFloat(amount) * 0.003).toFixed(6)} BNB
            </span>
          </div>
          <div className="border-t border-gray-700 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-gray-300">Destination receives</span>
            <span className="text-ghost-400">
              ~{(parseFloat(amount) * 0.9945).toFixed(6)} BNB
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Gas is paid by the GhostFund relayer — destination needs zero BNB
          </p>
        </div>
      )}

      <button
        onClick={handleUnshield}
        disabled={!walletId || !isValidAddress || !amount || loading}
        className="btn-primary w-full"
      >
        {loading ? proofProgress || 'Processing...' : 'Unshield BNB'}
      </button>

      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-ghost-500/20 bg-ghost-500/5 p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-ghost-500 border-t-transparent" />
          <p className="text-sm text-ghost-400">{proofProgress}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <TxStatus
            txHash={result.txHash}
            status="confirmed"
            bscscanUrl={result.bscscanUrl}
          />
          <div className="rounded-xl border border-ghost-500/20 bg-ghost-500/10 p-4">
            <p className="text-sm text-ghost-400 font-semibold">
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
