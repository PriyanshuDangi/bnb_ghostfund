'use client';

interface TxStatusProps {
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  bscscanUrl?: string;
}

export function TxStatus({ txHash, status, bscscanUrl }: TxStatusProps) {
  const statusConfig = {
    pending: {
      color: 'text-amber-400',
      bg: 'bg-amber-400/10 border-amber-400/20',
      label: 'Pending',
      dot: 'bg-amber-400 animate-pulse',
    },
    confirmed: {
      color: 'text-ghost-400',
      bg: 'bg-ghost-400/10 border-ghost-400/20',
      label: 'Confirmed',
      dot: 'bg-ghost-400',
    },
    failed: {
      color: 'text-red-400',
      bg: 'bg-red-400/10 border-red-400/20',
      label: 'Failed',
      dot: 'bg-red-400',
    },
  };

  const cfg = statusConfig[status];
  const url = bscscanUrl || `https://testnet.bscscan.com/tx/${txHash}`;

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          <span className={`text-sm font-semibold ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-ghost-400 hover:text-ghost-300 transition-colors"
        >
          View on BscScan &rarr;
        </a>
      </div>
      <p className="text-xs text-gray-500 font-mono break-all">{txHash}</p>
    </div>
  );
}
