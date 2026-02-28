'use client';

import { useState, useEffect, useCallback } from 'react';
import { createWallet, getBalance, type BalanceResponse } from '@/lib/api';

export default function StatusPage() {
  const [walletInfo, setWalletInfo] = useState<{
    id: string;
    railgunAddress: string;
  } | null>(null);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('ghostfund_wallet');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWalletInfo(parsed);
        if (parsed.mnemonic) {
          createWallet(parsed.mnemonic).catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    if (!walletInfo) return;
    setLoading(true);
    setError('');
    try {
      const bal = await getBalance(walletInfo.id);
      setBalance(bal);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [walletInfo]);

  useEffect(() => {
    if (walletInfo) fetchBalance();
  }, [walletInfo, fetchBalance]);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Private Balance</h1>
        <p className="text-gray-500">
          View your shielded BNB balance. This balance is invisible to on-chain
          observers.
        </p>
      </div>

      {!walletInfo ? (
        <div className="card text-center py-8">
          <p className="text-gray-400 mb-2">No private wallet found.</p>
          <p className="text-sm text-gray-600">
            Shield BNB first to create your private 0zk wallet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Balance hero */}
          <div className="card text-center bg-gradient-to-b from-surface-50 to-surface-100 border-bnb-400/15">
            <p className="text-sm text-gray-600 mb-2 uppercase tracking-wider font-medium">
              Shielded Balance
            </p>
            <p className="text-5xl font-bold gradient-text mb-1">
              {loading ? '...' : balance?.balanceFormatted ?? '0.000000'}
            </p>
            <p className="text-sm text-gray-500">BNB (shielded as WBNB)</p>
          </div>

          {/* Wallet details */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Wallet Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">
                  Wallet ID
                </p>
                <p className="text-sm font-mono text-gray-300 break-all">
                  {walletInfo.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">
                  0zk Address
                </p>
                <p className="text-sm font-mono text-bnb-400 break-all">
                  {walletInfo.railgunAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchBalance}
            disabled={loading}
            className="btn-secondary w-full"
          >
            {loading ? 'Scanning Merkle tree...' : 'Refresh Balance'}
          </button>

          {/* Error */}
          {error && (
            <div className="panel-error">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Privacy info */}
          <div className="card-flat">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Privacy Info
            </h3>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
              <li>
                Your balance is stored in an encrypted Merkle tree &mdash; only you
                can see it
              </li>
              <li>
                On-chain observers see deposits into the Railgun contract, but
                cannot determine individual balances
              </li>
              <li>
                The anonymity set grows as more users shield and unshield
              </li>
              <li>
                Wait for more pool activity before unshielding for maximum
                privacy
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
