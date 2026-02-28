import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'GhostFund — Privacy Gas Relayer for BNB Chain',
  description:
    'Break the on-chain link between source and destination wallets using zero-knowledge proofs on BNB Chain.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} font-sans`}>
        <Providers>
          <div className="min-h-screen flex flex-col relative">
            {/* Subtle top glow from BNB yellow */}
            <div className="pointer-events-none fixed inset-0 bg-gradient-glow z-0" />

            <Navbar />
            <main className="flex-1 relative z-10">{children}</main>

            <footer className="relative z-10 border-t border-surface-400/40 py-8 text-center">
              <p className="text-sm text-gray-600">
                GhostFund &mdash; Privacy Gas Relayer for BNB Chain
              </p>
              <p className="text-xs text-gray-700 mt-1">
                Built with Railgun ZK Privacy on BSC Testnet
              </p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
