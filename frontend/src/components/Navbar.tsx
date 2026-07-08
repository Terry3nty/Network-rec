'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Signal, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getClientNetworkInfo } from '@/utils/api';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [ipAddress, setIpAddress] = useState<string>('');

  useEffect(() => {
    getClientNetworkInfo()
      .then((info) => {
        setIpAddress(info.ip);
      })
      .catch((err) => console.error(err));
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Recommend', href: '/recommend' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-950/85 backdrop-blur-md transition-colors duration-300 shadow-md shadow-zinc-950/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-655 text-white shadow-md shadow-orange-600/10 group-hover:scale-105 transition-transform border-0">
            <Signal size={22} className="animate-pulse" />
          </div>
          <span className="text-xl font-black tracking-tight text-white group-hover:text-orange-500 transition-colors">
            Network<span className="text-orange-500">Wise</span>
          </span>
        </Link>

        {/* Centered IP Address Badge (Desktop only, absolutely positioned) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 rounded-full bg-zinc-900/60 border border-zinc-800/80 px-3.5 py-1.5 text-xs text-zinc-400 font-mono shadow-inner shadow-black/10 select-all">
          <Globe size={11} className="text-green-500 animate-pulse shrink-0" />
          <span className="text-[9px] uppercase font-black tracking-wider text-zinc-500 mr-0.5 shrink-0 select-none">IP:</span>
          {ipAddress ? ipAddress : 'Resolving...'}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-semibold transition-colors"
              >
                <span className={isActive ? "text-orange-500" : "text-zinc-400 hover:text-white"}>
                  {link.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button (Properly collapses) */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border-0 transition-colors cursor-pointer active:scale-95"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Orange styled, borderless drawer) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden border-t border-zinc-900/60 bg-zinc-950 shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile IP Badge */}
              <div className="flex items-center gap-2 px-4.5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 text-xs font-mono text-zinc-400 select-all mb-2.5">
                <Globe size={12} className="text-green-500 animate-pulse shrink-0" />
                <span className="text-[9px] uppercase font-black tracking-wider text-zinc-500 shrink-0 select-none">IP Address:</span>
                {ipAddress ? ipAddress : 'Resolving...'}
              </div>

              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-orange-500/10 text-orange-500'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
