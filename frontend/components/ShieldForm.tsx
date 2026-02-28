'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useSignMessage,
} from 'wagmi';
import { parseEther } from 'viem';
import { english, generateMnemonic } from 'viem/accounts';
import {
  createWallet,
  populateShield,
  getShieldSignatureMessage,
} from '@/lib/api';
import { TxStatus } from './TxStatus';

export function ShieldForm() {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletInfo, setWalletInfo] = useState<{
    id: string;
    railgunAddress: string;
  } | null>(null);

  const { signMessageAsync } = useSignMessage();

  const {
    data: txHash,
    sendTransaction,
    isPending: isSending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    const stored = localStorage.getItem('ghostfund_wallet');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWalletInfo(parsed);
        // Re-register wallet on the backend (handles backend restarts)
        if (parsed.mnemonic) {
          createWallet(parsed.mnemonic).catch(() => {});
        }
      } catch {
        localStorage.removeItem('ghostfund_wallet');
      }
    }
  }, []);

  async function initWallet() {
    if (walletInfo) return walletInfo;

    try {
      const mnemonic = generateMnemonic(english);
      const wallet = await createWallet(mnemonic);
      const fullWallet = { ...wallet, mnemonic };
      localStorage.setItem('ghostfund_wallet', JSON.stringify(fullWallet));
      setWalletInfo(fullWallet);
      return fullWallet;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }

  async function handleShield() {
    if (!isConnected || !amount) return;

    setError('');
    setLoading(true);

    try {
      const wallet = await initWallet();
      if (!wallet) return;

      // Get and sign the shield signature message
      const { message } = await getShieldSignatureMessage();
      const shieldPrivateKey = await signMessageAsync({ message });

      const amountWei = parseEther(amount).toString();
      const { transaction } = await populateShield(
        amountWei,
        wallet.railgunAddress,
        shieldPrivateKey,
      );

      sendTransaction({
        to: transaction.to as `0x${string}`,
        data: transaction.data as `0x${string}`,
        value: BigInt(transaction.value),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {walletInfo && (
        <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-4">
          <p className="text-xs text-gray-500 mb-1">
            Your private 0zk address
          </p>
          <p className="text-sm font-mono text-ghost-400 break-all">
            {walletInfo.railgunAddress}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="shield-amount" className="label">
          Amount (BNB)
        </label>
        <input
          id="shield-amount"
          type="number"
          step="0.001"
          min="0"
          placeholder="0.1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
          disabled={loading || isSending}
        />
        <p className="text-xs text-gray-500 mt-2">
          Shield fee: 0.25% &middot; Your BNB will be wrapped to WBNB and
          deposited into the privacy pool
        </p>
      </div>

      {amount && parseFloat(amount) > 0 && (
        <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">You send</span>
            <span className="text-gray-200">{amount} BNB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Shield fee (0.25%)</span>
            <span className="text-gray-400">
              -{(parseFloat(amount) * 0.0025).toFixed(6)} BNB
            </span>
          </div>
          <div className="border-t border-gray-700 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-gray-300">Private balance</span>
            <span className="text-ghost-400">
              ~{(parseFloat(amount) * 0.9975).toFixed(6)} BNB
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleShield}
        disabled={
          !isConnected || !amount || loading || isSending || isConfirming
        }
        className="btn-primary w-full"
      >
        {loading
          ? 'Preparing...'
          : isSending
            ? 'Sign in MetaMask...'
            : isConfirming
              ? 'Confirming...'
              : 'Shield BNB'}
      </button>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {txHash && (
        <TxStatus
          txHash={txHash}
          status={isConfirmed ? 'confirmed' : 'pending'}
        />
      )}

      {isConfirmed && (
        <div className="rounded-xl border border-ghost-500/20 bg-ghost-500/10 p-4">
          <p className="text-sm text-ghost-400 font-semibold">
            Your BNB is now private. No one can see your shielded balance.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            You can now unshield to any wallet — the link will be broken.
          </p>
        </div>
      )}
    </div>
  );
}
