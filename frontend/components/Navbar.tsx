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
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-ghost-500 flex items-center justify-center text-white font-bold text-sm">
                GF
              </div>
              <span className="font-bold text-lg gradient-text">
                GhostFund
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-gray-800 text-ghost-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
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
