'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation, MapPin, Search, ShieldCheck, Activity, BarChart3, Wifi, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchLocation, GeocodeResult } from '../utils/api';
import SpeedTest from '@/components/SpeedTest';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Fallback to IP-based Geolocation if hardware sensors fail
  const fallbackToIP = async (): Promise<boolean> => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          router.push(`/recommend?lat=${lat}&lng=${lng}&source=ip`);
          return true;
        }
      }
    } catch (e) {
      console.warn('First IP fallback (ipapi.co) failed, trying secondary...', e);
    }

    try {
      const res = await fetch('https://freeipapi.com/api/json');
      if (res.ok) {
        const data = await res.json();
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          router.push(`/recommend?lat=${lat}&lng=${lng}&source=ip`);
          return true;
        }
      }
    } catch (e) {
      console.error('All IP Geolocation fallbacks failed:', e);
    }
    return false;
  };

  // Trigger GPS Geolocation
  const handleGetLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        router.push(`/recommend?lat=${latitude}&lng=${longitude}`);
      },
      async (err) => {
        console.warn('Hardware GPS failed, attempting IP Geolocation fallback...', err);
        const success = await fallbackToIP();
        if (success) return;

        let msg = 'Failed to retrieve your location.';
        if (err.code === 1) {
          msg = 'Location permission denied. Please search for your location manually below.';
        } else if (err.code === 2) {
          msg = 'Position unavailable. Check your device location settings or search manually.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please try again or search manually.';
        }
        setError(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Search by text
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);
    try {
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setError('No locations found matching your search.');
      }
    } catch {
      setError('Error searching for location. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = (loc: GeocodeResult) => {
    router.push(`/recommend?lat=${loc.lat}&lng=${loc.lon}`);
  };

  return (
    <div className="relative flex flex-col justify-center overflow-hidden bg-background text-foreground py-20 px-4 sm:px-6 lg:px-8 min-h-[85vh] transition-colors duration-300">
      
      {/* Subtle Warm Orange Glow Spot (Extremely low opacity, works in both dark and light modes) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center flex flex-col items-center">
        
        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-500 mb-8 shadow-sm border-0"
        >
          <Wifi size={13} className="animate-pulse" />
          Rank Cellular Networks Instantly
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-3xl leading-[1.15]"
        >
          Find the Best Network
          <span className="block text-orange-500 mt-2.5">
            Right Where You Stand
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-base md:text-lg text-muted-txt leading-relaxed transition-colors duration-300"
        >
          Don&apos;t guess which mobile provider is best. Get real-time rankings compiled from network coverage datasets, speed registries, and crowdsourced cellular signals.
        </motion.p>

        {/* Main CTA Card (Dynamic light/dark theme) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10 w-full max-w-md rounded-3xl bg-card p-6 md:p-8 shadow-[var(--card-shadow)] border border-[var(--card-border)] transition-all duration-300"
        >
          {/* GPS Button */}
          <button
            onClick={handleGetLocation}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-orange-655 py-4.5 px-5 text-base font-bold text-white shadow-lg shadow-orange-650/15 hover:bg-orange-600 focus:outline-none disabled:opacity-75 transition-all group active:scale-[0.98] cursor-pointer border-0"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Scanning Airwaves...
              </>
            ) : (
              <>
                <Navigation size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-white" />
                Find the Best Network Near Me
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center justify-center gap-3">
            <span className="h-px w-full bg-[var(--divider)]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-txt shrink-0">or</span>
            <span className="h-px w-full bg-[var(--divider)]" />
          </div>

          {/* Search Input (Dynamic Colors) */}
          <form onSubmit={handleSearchSubmit} className="relative flex gap-2.5">
            <div className="relative flex-grow">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-txt" />
              <input
                type="text"
                placeholder="Enter city or area name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-input-bg py-3.5 pl-11 pr-4 text-sm text-foreground placeholder-muted-txt outline-none focus:ring-1 focus:ring-orange-500/50 transition-all border border-[var(--card-border)]"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-input-bg hover:bg-[var(--divider)] text-foreground border border-[var(--card-border)] transition-colors cursor-pointer"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 text-xs text-red-405 font-bold bg-red-950/10 p-3.5 rounded-xl border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Dropdown Results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 overflow-hidden rounded-2xl bg-card shadow-[var(--card-shadow)] divide-y divide-[var(--divider)] text-left max-h-56 overflow-y-auto border border-[var(--card-border)]"
              >
                {searchResults.map((result, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelectLocation(result)}
                    className="flex items-center justify-between px-5 py-3.5 text-sm text-foreground hover:bg-[var(--divider)] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin size={14} className="text-muted-txt group-hover:text-orange-500 transition-colors shrink-0" />
                      <span className="truncate pr-2">{result.display_name}</span>
                    </div>
                    <ArrowRight size={12} className="text-zinc-550 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Live Internet Speed Test (Auto-runs on load) */}
        <div className="mt-6 w-full max-w-md z-10">
          <SpeedTest />
        </div>

        {/* Core Value Props (Dynamic Color Scheme) */}
        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3 w-full max-w-4xl text-left">
          <motion.div
            whileHover={{ y: -5 }}
            className="rounded-2xl bg-card p-6 shadow-[var(--card-shadow)] border border-[var(--card-border)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 mb-4 border-0">
              <Activity size={18} />
            </div>
            <h3 className="font-extrabold text-foreground text-base">Multi-Source Aggregation</h3>
            <p className="mt-2.5 text-xs md:text-sm text-muted-txt leading-relaxed">
              Aggregates coverage registries, speed databases, and crowdsourced latency audits to form a complete network profile.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="rounded-2xl bg-card p-6 shadow-[var(--card-shadow)] border border-[var(--card-border)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 mb-4 border-0">
              <BarChart3 size={18} />
            </div>
            <h3 className="font-extrabold text-foreground text-base">Weighted Scoring</h3>
            <p className="mt-2.5 text-xs md:text-sm text-muted-txt leading-relaxed">
              Ranks networks using custom metrics: 50% download speed, 25% coverage strength, 15% latency, and 10% connection reliability.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="rounded-2xl bg-card p-6 shadow-[var(--card-shadow)] border border-[var(--card-border)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 mb-4 border-0">
              <ShieldCheck size={18} />
            </div>
            <h3 className="font-extrabold text-foreground text-base">Zero Bandwidth Cost</h3>
            <p className="mt-2.5 text-xs md:text-sm text-muted-txt leading-relaxed">
              Get immediate results without installing apps or spending data to manually run heavy bandwidth speed tests.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
