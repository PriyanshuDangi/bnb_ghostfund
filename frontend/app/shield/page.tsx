'use client';

import { useAccount } from 'wagmi';
import { ShieldForm } from '@/components/ShieldForm';
import { WalletConnect } from '@/components/WalletConnect';

export default function ShieldPage() {
  const { isConnected } = useAccount();

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Shield BNB</h1>
        <p className="text-gray-400">
          Deposit BNB into the privacy pool. Your tokens will be wrapped to
          WBNB and shielded inside Railgun&apos;s encrypted Merkle tree.
        </p>
      </div>

      <div className="card">
        {!isConnected ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-400">
              Connect your BSC testnet wallet to start shielding BNB.
            </p>
            <WalletConnect />
          </div>
        ) : (
          <ShieldForm />
        )}
      </div>

      <div className="mt-6 rounded-xl bg-gray-900/50 border border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          How shielding works
        </h3>
        <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
          <li>Your BNB is automatically wrapped to WBNB (BEP-20 format)</li>
          <li>WBNB is deposited into the Railgun privacy contract</li>
          <li>Tokens are associated with your private 0zk address</li>
          <li>
            The shield transaction is public on BscScan, but you&apos;re one of
            many depositors
          </li>
          <li>
            After shielding, no one can see your private balance or trace it to
            your wallet
          </li>
        </ol>
      </div>
    </div>
  );
}
