'use client';

import { UnshieldForm } from '@/components/UnshieldForm';

export default function UnshieldPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Unshield BNB</h1>
        <p className="text-gray-500">
          Send shielded BNB to any destination wallet. The GhostFund relayer
          generates a ZK proof and pays gas &mdash; the destination can have zero
          balance.
        </p>
      </div>

      {/* Form card */}
      <div className="card">
        <UnshieldForm />
      </div>

      {/* How it works */}
      <div className="mt-6 card-flat">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          How unshielding works
        </h3>
        <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
          <li>You specify a destination BSC address and BNB amount</li>
          <li>
            The GhostFund relayer generates a Groth16 ZK proof (takes 20-30
            seconds)
          </li>
          <li>The relayer signs and submits the unshield transaction</li>
          <li>The relayer pays BNB gas from its own funded wallet</li>
          <li>
            WBNB is automatically unwrapped to BNB and sent to the destination
          </li>
          <li>
            A small fee (0.3% relayer + 0.25% Railgun) is deducted from the
            amount
          </li>
        </ol>
      </div>

      {/* Privacy guarantee */}
      <div className="mt-4 panel-info">
        <h3 className="text-sm font-semibold text-bnb-400 mb-2">
          Privacy guarantee
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          The relayer can see the destination address and approximate amount, but
          it <span className="text-bnb-400 font-semibold">cannot</span> see
          which wallet originally shielded the tokens. On-chain observers see
          the relayer submitting a transaction &mdash; not your source wallet. The link
          between source and destination is cryptographically broken.
        </p>
      </div>
    </div>
  );
}
