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
      {/* Private address display */}
      {walletInfo && (
        <div className="card-flat">
          <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wider font-medium">
            Your private 0zk address
          </p>
          <p className="text-sm font-mono text-bnb-400 break-all leading-relaxed">
            {walletInfo.railgunAddress}
          </p>
        </div>
      )}

      {/* Amount input */}
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
        <p className="text-xs text-gray-600 mt-2">
          Shield fee: 0.25% &middot; Your BNB will be wrapped to WBNB and
          deposited into the privacy pool
        </p>
      </div>

      {/* Fee breakdown */}
      {amount && parseFloat(amount) > 0 && (
        <div className="card-flat space-y-2 animate-fade-in">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">You send</span>
            <span className="text-gray-200">{amount} BNB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shield fee (0.25%)</span>
            <span className="text-gray-500">
              -{(parseFloat(amount) * 0.0025).toFixed(6)} BNB
            </span>
          </div>
          <div className="border-t border-surface-400/40 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-gray-300">Private balance</span>
            <span className="text-bnb-400">
              ~{(parseFloat(amount) * 0.9975).toFixed(6)} BNB
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
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

      {/* Error */}
      {error && (
        <div className="panel-error">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Tx status */}
      {txHash && (
        <TxStatus
          txHash={txHash}
          status={isConfirmed ? 'confirmed' : 'pending'}
        />
      )}

      {/* Success message */}
      {isConfirmed && (
        <div className="panel-success animate-fade-in">
          <p className="text-sm text-bnb-400 font-semibold">
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
