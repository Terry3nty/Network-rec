'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ProviderInfo } from '../utils/api';
import { getProviderStyle } from './RecommendationCard';

interface RankingListProps {
  providers: ProviderInfo[];
}

export default function RankingList({ providers }: RankingListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (name: string) => {
    setExpandedId(expandedId === name ? null : name);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-foreground tracking-tight">Operator Leaderboard</h3>
        <span className="text-xs font-semibold text-muted-txt">Sorted by Rank</span>
      </div>
      <div className="space-y-3">
        {providers.map((provider, index) => {
          const style = getProviderStyle(provider.name);
          const isExpanded = expandedId === provider.name;
          const rank = index + 1;

          return (
            <div
              key={provider.name}
              className={`rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm overflow-hidden backdrop-blur-md transition-all duration-300 ${
                isExpanded ? 'ring-1 ring-orange-550/20' : ''
              }`}
            >
              {/* Header/Summary Card Row */}
              <div
                onClick={() => toggleExpand(provider.name)}
                className="flex items-center justify-between p-5.5 cursor-pointer hover:bg-[var(--divider)]/40 transition-colors duration-200 select-none"
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <span className={`flex h-6.5 w-6.5 items-center justify-center rounded-full text-xs font-bold ${
                    rank === 1
                      ? 'bg-amber-950 text-amber-300 font-extrabold border border-amber-900/35'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {rank}
                  </span>
                  
                  {/* Provider Name */}
                  <h4 className="font-extrabold text-foreground flex items-center gap-2.5">
                    {provider.name}
                    {rank === 1 && (
                      <span className="text-[9px] uppercase tracking-widest font-black bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Top Rank
                      </span>
                    )}
                  </h4>
                </div>

                {/* Score and Toggler */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-muted-txt font-bold uppercase tracking-wide block">Score</span>
                    <span className="text-sm font-black text-foreground">
                      {provider.score} <span className="text-[10px] text-muted-txt font-normal">/100</span>
                    </span>
                  </div>

                  {/* Horizontal Bar (relative score) */}
                  <div className="hidden sm:block w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${provider.score}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className={`h-full ${style.accentBg} rounded-full`}
                    />
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-[var(--card-border)] text-zinc-400 transition-colors">
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Details Panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="border-t border-[var(--card-border)] bg-zinc-950/20 overflow-hidden"
                  >
                    <div className="p-5 grid grid-cols-2 gap-4">
                      {/* Metric Download Speed */}
                      <div className="flex items-center gap-3.5 bg-zinc-900/30 border border-zinc-800/40 p-3 rounded-2xl">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-950/40 text-amber-500">
                          <Zap size={16} />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-muted-txt tracking-wide block">Speed</span>
                          <span className="text-sm font-black text-zinc-200">{provider.speed} Mbps</span>
                        </div>
                      </div>

                      {/* Metric Latency */}
                      <div className="flex items-center gap-3.5 bg-zinc-900/30 border border-zinc-800/40 p-3 rounded-2xl">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-950/40 text-indigo-500">
                          <Activity size={16} />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-muted-txt tracking-wide block">Latency</span>
                          <span className="text-sm font-black text-zinc-200">{provider.latency} ms</span>
                        </div>
                      </div>

                      {/* Metric Coverage */}
                      <div className="flex items-center gap-3.5 bg-zinc-900/30 border border-zinc-800/40 p-3 rounded-2xl">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-950/40 text-green-500">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-muted-txt tracking-wide block">Coverage</span>
                          <span className="text-sm font-black text-zinc-200">{provider.coverage}%</span>
                        </div>
                      </div>

                      {/* Metric Reliability */}
                      <div className="flex items-center gap-3.5 bg-zinc-900/30 border border-zinc-800/40 p-3 rounded-2xl">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950/40 text-emerald-500">
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-muted-txt tracking-wide block">Reliability</span>
                          <span className="text-sm font-black text-zinc-200">{provider.reliability}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
