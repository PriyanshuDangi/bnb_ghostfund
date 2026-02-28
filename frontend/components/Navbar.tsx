'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnect } from './WalletConnect';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shield', label: 'Shield' },
  { href: '/status', label: 'Status' },
  { href: '/unshield', label: 'Unshield' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-400/40 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-bnb-400 flex items-center justify-center text-black font-bold text-sm transition-shadow group-hover:shadow-glow">
                GF
              </div>
              <span className="font-bold text-lg gradient-text">
                GhostFund
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'bg-bnb-400/10 text-bnb-400 border border-bnb-400/20'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-surface-300/60'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
