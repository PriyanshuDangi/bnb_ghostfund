'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { bscTestnet } from '@/lib/wagmi';

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongChain = isConnected && chain?.id !== bscTestnet.id;

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        className="btn-primary text-sm"
      >
        Connect Wallet
      </button>
    );
  }

  if (isWrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: bscTestnet.id })}
        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 transition-all duration-200"
      >
        <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
        Switch to BSC Testnet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-xl border border-surface-500 bg-surface-300 px-3 py-2 transition-all duration-200 hover:border-bnb-400/30">
        <span className="h-2 w-2 rounded-full bg-bnb-400 animate-pulse-glow" />
        <span className="text-sm text-gray-300 font-mono">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <span className="text-xs text-gray-600 border-l border-surface-500 pl-2">
          BSC Testnet
        </span>
      </div>
      <button
        onClick={() => disconnect()}
        className="text-sm text-gray-600 hover:text-bnb-400 transition-colors duration-200"
      >
        Disconnect
      </button>
    </div>
  );
}
