import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <section className="text-center mb-20">
        <div className="inline-block rounded-full border border-ghost-500/30 bg-ghost-500/10 px-4 py-1.5 text-sm text-ghost-400 mb-6">
          Privacy Gas Relayer for BNB Chain
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
          Break the{' '}
          <span className="gradient-text">on-chain link</span>
          <br />
          between your wallets
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Send BNB from Wallet A to Wallet B with zero on-chain connection.
          GhostFund uses Railgun&apos;s ZK privacy system so no observer —
          employer, adversary, or analytics firm — can trace the transfer.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/shield" className="btn-primary text-lg px-8 py-4">
            Shield BNB
          </Link>
          <Link href="/unshield" className="btn-secondary text-lg px-8 py-4">
            Unshield BNB
          </Link>
        </div>
      </section>

      {/* Problem */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">The Problem</h2>
        <div className="card max-w-3xl mx-auto">
          <div className="font-mono text-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-red-400">Binance Hot Wallet</span>
              <span className="text-gray-600">&rarr;</span>
              <span className="text-red-400">0xFreshWallet</span>
            </div>
            <p className="text-gray-500 text-xs">
              This single transaction on BscScan permanently links your new
              wallet to your KYC&apos;d identity. Anyone can see it. Forever.
            </p>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">The Solution</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-3xl mb-4">1</div>
            <h3 className="text-lg font-semibold mb-2 text-ghost-400">
              Shield BNB
            </h3>
            <p className="text-sm text-gray-400">
              Deposit BNB from Wallet A into GhostFund&apos;s privacy pool.
              Your tokens enter an encrypted Merkle tree — one of many
              deposits.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-3xl mb-4">2</div>
            <h3 className="text-lg font-semibold mb-2 text-ghost-400">
              Wait
            </h3>
            <p className="text-sm text-gray-400">
              Other users shield and unshield in the same pool. The anonymity
              set grows. Your transaction blends in with the crowd.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-3xl mb-4">3</div>
            <h3 className="text-lg font-semibold mb-2 text-ghost-400">
              Unshield to Wallet B
            </h3>
            <p className="text-sm text-gray-400">
              GhostFund&apos;s relayer generates a ZK proof and sends BNB to
              your destination — even if it has zero balance.
            </p>
          </div>
        </div>
      </section>

      {/* What blockchain sees */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">
          What the Blockchain Sees
        </h2>
        <div className="card max-w-3xl mx-auto font-mono text-sm space-y-4">
          <div>
            <span className="text-gray-500">TX 1:</span>{' '}
            <span className="text-amber-400">0xSource</span>{' '}
            <span className="text-gray-600">&rarr;</span>{' '}
            <span className="text-gray-300">RailgunProxy</span>
            <span className="text-gray-600 text-xs ml-2">
              (shield — one of many)
            </span>
          </div>
          <div>
            <span className="text-gray-500">TX 2:</span>{' '}
            <span className="text-ghost-400">GhostRelayer</span>{' '}
            <span className="text-gray-600">&rarr;</span>{' '}
            <span className="text-gray-300">RailgunProxy</span>{' '}
            <span className="text-gray-600">&rarr;</span>{' '}
            <span className="text-ghost-400">0xDest</span>
            <span className="text-gray-600 text-xs ml-2">
              (relayer pays gas)
            </span>
          </div>
          <div className="border-t border-gray-700 pt-3">
            <p className="text-ghost-400 font-semibold">
              No transaction between 0xSource and 0xDest. The link is broken.
            </p>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">
          Why GhostFund
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-ghost-400 mb-2">
              UTXO-Based Privacy
            </h3>
            <p className="text-sm text-gray-400">
              Unlike Tornado Cash&apos;s fixed denominations, GhostFund
              supports any BNB amount via Railgun&apos;s encrypted Merkle
              tree.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-ghost-400 mb-2">
              Gas Relayer
            </h3>
            <p className="text-sm text-gray-400">
              Destination wallet needs zero BNB. The relayer pays gas and
              deducts a small fee (0.3%) from the transfer.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-ghost-400 mb-2">
              PPOI Compliance
            </h3>
            <p className="text-sm text-gray-400">
              Railgun&apos;s Private Proof of Innocence ensures funds
              didn&apos;t originate from sanctioned addresses. Responsible
              privacy.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-ghost-400 mb-2">
              BSC Native
            </h3>
            <p className="text-sm text-gray-400">
              Built exclusively for BNB Chain. Low fees, fast confirmation,
              and a clear path to BSC mainnet.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Ready to go private?</h2>
          <p className="text-gray-400 mb-6">
            Shield your BNB now and break the link between your wallets.
            Total cost: ~0.8% of the transferred amount.
          </p>
          <Link href="/shield" className="btn-primary">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
