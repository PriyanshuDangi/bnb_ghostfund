import Link from 'next/link';

const steps = [
  {
    num: '01',
    title: 'Shield BNB',
    desc: 'Deposit BNB from Wallet A into GhostFund\u2019s privacy pool. Your tokens enter an encrypted Merkle tree \u2014 one of many deposits.',
  },
  {
    num: '02',
    title: 'Wait',
    desc: 'Other users shield and unshield in the same pool. The anonymity set grows. Your transaction blends in with the crowd.',
  },
  {
    num: '03',
    title: 'Unshield to Wallet B',
    desc: 'GhostFund\u2019s relayer generates a ZK proof and sends BNB to your destination \u2014 even if it has zero balance.',
  },
];

const features = [
  {
    title: 'UTXO-Based Privacy',
    desc: 'Unlike Tornado Cash\u2019s fixed denominations, GhostFund supports any BNB amount via Railgun\u2019s encrypted Merkle tree.',
  },
  {
    title: 'Gas Relayer',
    desc: 'Destination wallet needs zero BNB. The relayer pays gas and deducts a small fee (0.3%) from the transfer.',
  },
  {
    title: 'PPOI Compliance',
    desc: 'Railgun\u2019s Private Proof of Innocence ensures funds didn\u2019t originate from sanctioned addresses. Responsible privacy.',
  },
  {
    title: 'BSC Native',
    desc: 'Built exclusively for BNB Chain. Low fees, fast confirmation, and a clear path to BSC mainnet.',
  },
];

const contracts = [
  { name: 'RailgunProxy', addr: '0x5e0d11D4Ba0B606c4dd19eAbce2d43daFCE6b7c0' },
  { name: 'RelayAdapt', addr: '0x254798830B89f716E66D2F77b611320883a7A52C' },
  { name: 'WBNB', addr: '0xAc21F2a5fA4297bE7E150Dd8133BcaDe04979033' },
  { name: 'GhostPaymaster', addr: '0x77aDC78a0dfE3A7622149b93977cEe68343eefcF' },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-28">
      {/* ── Hero ── */}
      <section className="text-center pt-8">
        <div className="inline-block rounded-full border border-bnb-400/30 bg-bnb-400/10 px-4 py-1.5 text-sm text-bnb-400 mb-6 animate-fade-in">
          Privacy Gas Relayer for BNB Chain
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
          Break the{' '}
          <span className="gradient-text">on-chain link</span>
          <br />
          between your wallets
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Send BNB from Wallet A to Wallet B with zero on-chain connection.
          GhostFund uses Railgun&apos;s ZK privacy system so no observer &mdash;
          employer, adversary, or analytics firm &mdash; can trace the transfer.
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

      {/* ── The Problem ── */}
      <section>
        <h2 className="section-title">The Problem</h2>
        <p className="section-subtitle text-sm">
          A single on-chain transaction permanently links wallets.
        </p>

        <div className="card max-w-3xl mx-auto">
          <div className="font-mono text-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-red-400">Binance Hot Wallet</span>
              <span className="text-surface-600">&rarr;</span>
              <span className="text-red-400">0xFreshWallet</span>
            </div>
            <p className="text-gray-600 text-xs">
              This single transaction on BscScan permanently links your new
              wallet to your KYC&apos;d identity. Anyone can see it. Forever.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Solution ── */}
      <section>
        <h2 className="section-title">The Solution</h2>
        <p className="section-subtitle text-sm">
          Three steps to complete financial privacy on BNB Chain.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="card text-center group">
              <div className="text-3xl font-bold text-bnb-400/30 group-hover:text-bnb-400/60 transition-colors duration-300 mb-3">
                {s.num}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-bnb-400">
                {s.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What blockchain sees ── */}
      <section>
        <h2 className="section-title">What the Blockchain Sees</h2>
        <p className="section-subtitle text-sm">
          Two separate, unlinkable transactions.
        </p>

        <div className="card max-w-3xl mx-auto font-mono text-sm space-y-4">
          <div>
            <span className="text-gray-600">TX 1:</span>{' '}
            <span className="text-amber-400">0xSource</span>{' '}
            <span className="text-surface-600">&rarr;</span>{' '}
            <span className="text-gray-300">RailgunProxy</span>
            <span className="text-gray-700 text-xs ml-2">
              (shield &mdash; one of many)
            </span>
          </div>
          <div>
            <span className="text-gray-600">TX 2:</span>{' '}
            <span className="text-bnb-400">GhostRelayer</span>{' '}
            <span className="text-surface-600">&rarr;</span>{' '}
            <span className="text-gray-300">RailgunProxy</span>{' '}
            <span className="text-surface-600">&rarr;</span>{' '}
            <span className="text-bnb-400">0xDest</span>
            <span className="text-gray-700 text-xs ml-2">
              (relayer pays gas)
            </span>
          </div>
          <div className="border-t border-surface-400/40 pt-3">
            <p className="text-bnb-400 font-semibold">
              No transaction between 0xSource and 0xDest. The link is broken.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why GhostFund ── */}
      <section>
        <h2 className="section-title">Why GhostFund</h2>
        <p className="section-subtitle text-sm">
          Purpose-built privacy infrastructure for BNB Chain.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card group">
              <h3 className="font-semibold text-bnb-400 mb-2 group-hover:text-bnb-300 transition-colors duration-200">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Deployed Contracts ── */}
      <section>
        <h2 className="section-title">Deployed Contracts</h2>
        <p className="section-subtitle text-sm">
          Verified on BSC Testnet (Chain ID 97).
        </p>

        <div className="card max-w-3xl mx-auto font-mono text-xs space-y-3">
          {contracts.map(({ name, addr }) => (
            <div key={addr} className="flex items-center justify-between gap-4">
              <span className="text-gray-500 text-sm font-sans">{name}</span>
              <a
                href={`https://testnet.bscscan.com/address/${addr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bnb-400 hover:text-bnb-300 truncate transition-colors duration-200"
              >
                {addr}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center pb-8">
        <div className="card max-w-2xl mx-auto bg-gradient-to-b from-surface-50 to-surface-100 border-bnb-400/15">
          <h2 className="text-2xl font-bold mb-3">Ready to go private?</h2>
          <p className="text-gray-500 mb-6">
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
