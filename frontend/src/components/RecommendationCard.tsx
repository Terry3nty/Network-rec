'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Trophy, Activity, Zap, CheckCircle2, ShieldCheck, Wifi } from 'lucide-react';
import { ProviderInfo } from '../utils/api';

interface RecommendationCardProps {
  location: string;
  recommended: string;
  providers: ProviderInfo[];
}

// Brand helper definitions for premium glows and styling
export const getProviderStyle = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('mtn')) {
    return {
      bg: 'bg-zinc-900/60',
      border: 'border-0',
      shadow: 'shadow-xl shadow-yellow-500/5',
      text: 'text-yellow-500',
      brandColor: '#FFCC00',
      accentBg: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      badge: 'bg-yellow-500/10 text-yellow-550 border-0',
    };
  }
  if (normalized.includes('airtel')) {
    return {
      bg: 'bg-zinc-900/60',
      border: 'border-0',
      shadow: 'shadow-xl shadow-red-500/5',
      text: 'text-red-500',
      brandColor: '#E30A17',
      accentBg: 'bg-gradient-to-r from-red-600 to-rose-500',
      badge: 'bg-red-500/10 text-red-400 border-0',
    };
  }
  if (normalized.includes('glo')) {
    return {
      bg: 'bg-zinc-900/60',
      border: 'border-0',
      shadow: 'shadow-xl shadow-green-500/5',
      text: 'text-green-500',
      brandColor: '#73B72C',
      accentBg: 'bg-gradient-to-r from-green-600 to-emerald-500',
      badge: 'bg-green-500/10 text-green-400 border-0',
    };
  }
  // 9mobile or fallback
  return {
    bg: 'bg-zinc-900/60',
    border: 'border-0',
    shadow: 'shadow-xl shadow-emerald-500/5',
    text: 'text-emerald-500',
    brandColor: '#006643',
    accentBg: 'bg-gradient-to-r from-emerald-600 to-teal-500',
    badge: 'bg-emerald-500/10 text-emerald-450 border-0',
  };
};

export default function RecommendationCard({ location, recommended, providers }: RecommendationCardProps) {
  const topProvider = providers.find((p) => p.name === recommended) || providers[0];
  if (!topProvider) return null;

  const style = getProviderStyle(topProvider.name);

  const reasons = [
    topProvider.speed >= 45 
      ? `Blazing average download speed of ${topProvider.speed} Mbps`
      : `Top average download speed of ${topProvider.speed} Mbps in this zone`,
    topProvider.latency <= 30
      ? `Ultra-responsive connection latency of ${topProvider.latency} ms`
      : `Optimized local latency of ${topProvider.latency} ms`,
    `Signal coverage capacity standing at ${topProvider.coverage}%`,
    `Consistent packet delivery reliability rating of ${topProvider.reliability}%`,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-3xl ${style.bg} ${style.shadow} p-4 sm:p-6 md:p-8 backdrop-blur-md relative overflow-hidden transition-all duration-300 border-0`}
    >
      {/* Decorative Brand Accent Tag */}
      <div className={`absolute top-0 left-0 h-1.5 w-full ${style.accentBg}`} />

      {/* Location Badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 border-0 shrink-0">
          <MapPin size={13} />
        </div>
        <span className="text-xs sm:text-sm font-bold text-zinc-350 truncate">{location}</span>
      </div>

      {/* Recommended Network Header */}
      <div className="flex flex-row items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
            <Trophy size={10} className="text-amber-500 shrink-0" />
            Recommended Network
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mt-1 flex flex-wrap items-center gap-2 tracking-tight text-white">
            <span className="truncate">{topProvider.name}</span>
            <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border-0 ${style.badge} shrink-0`}>
              Score: {topProvider.score}/100
            </span>
          </h2>
        </div>
        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl ${style.accentBg} text-white shadow-lg shadow-orange-600/10 shrink-0`}>
          <Wifi size={18} className="animate-pulse sm:w-5 sm:h-5" />
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6 border-b border-zinc-800/80 pb-6">
        <div className="bg-zinc-950/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center shadow-inner border-0 hover:scale-[1.02] transition-transform">
          <Zap className="mx-auto text-amber-500 mb-1.5 sm:w-5 sm:h-5" size={18} />
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-500 tracking-wide">Speed</div>
          <div className="text-base sm:text-xl font-black text-white mt-0.5 whitespace-nowrap">
            {topProvider.speed} <span className="text-[10px] sm:text-xs font-medium text-zinc-500">Mbps</span>
          </div>
        </div>

        <div className="bg-zinc-950/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center shadow-inner border-0 hover:scale-[1.02] transition-transform">
          <Activity className="mx-auto text-indigo-500 mb-1.5 sm:w-5 sm:h-5" size={18} />
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-500 tracking-wide">Latency</div>
          <div className="text-base sm:text-xl font-black text-white mt-0.5 whitespace-nowrap">
            {topProvider.latency} <span className="text-[10px] sm:text-xs font-medium text-zinc-500">ms</span>
          </div>
        </div>

        <div className="bg-zinc-950/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center shadow-inner border-0 hover:scale-[1.02] transition-transform">
          <CheckCircle2 className="mx-auto text-green-500 mb-1.5 sm:w-5 sm:h-5" size={18} />
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-500 tracking-wide">Coverage</div>
          <div className="text-base sm:text-xl font-black text-white mt-0.5 whitespace-nowrap">{topProvider.coverage}%</div>
        </div>

        <div className="bg-zinc-950/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center shadow-inner border-0 hover:scale-[1.02] transition-transform">
          <ShieldCheck className="mx-auto text-emerald-500 mb-1.5 sm:w-5 sm:h-5" size={18} />
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-500 tracking-wide">Reliability</div>
          <div className="text-base sm:text-xl font-black text-white mt-0.5 whitespace-nowrap">{topProvider.reliability}%</div>
        </div>
      </div>

      {/* Why Description Section */}
      <div>
        <h4 className="text-xs sm:text-sm font-extrabold text-white mb-3 tracking-tight">Recommendation Rationale</h4>
        <ul className="space-y-2.5">
          {reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-400">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-normal">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
