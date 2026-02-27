import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
              GhostFund &mdash; Privacy Gas Relayer for BNB Chain &middot; Built
              with Railgun ZK Privacy
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
