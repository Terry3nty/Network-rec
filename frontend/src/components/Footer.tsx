import React from 'react';
import Link from 'next/link';
import { Signal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 py-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-650 text-white border-0">
              <Signal size={14} />
            </div>
            <span className="text-sm font-bold text-zinc-200">
              NetworkWise
            </span>
          </div>
          <p className="text-center text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} NetworkWise. Powered by open data and crowdsourced metrics.
          </p>
          <div className="flex gap-4 text-xs text-zinc-500">
            <Link href="/analytics" className="hover:text-orange-400 transition-colors">Analytics</Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
