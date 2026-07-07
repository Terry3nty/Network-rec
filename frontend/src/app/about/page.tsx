'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Signal, BarChart3, Layers, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="bg-zinc-955 text-zinc-150 py-12 px-4 sm:px-6 lg:px-8 min-h-[85vh]">
      <div className="mx-auto max-w-4xl">
        
        {/* Navigation Breadcrumb (Orange Accents) */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight size={11} />
          <span className="font-bold text-orange-500">About</span>
        </nav>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-white sm:text-4xl mb-4 tracking-tight"
        >
          About NetworkWise
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-base md:text-lg text-zinc-400 mb-10 leading-relaxed"
        >
          NetworkWise is a modern location-based mobile network recommender system that enables users to identify the best performing telecom providers in their immediate vicinity without having to run bandwidth-heavy speed tests.
        </motion.p>

        {/* Scoring Engine Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <BarChart3 size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">The Scoring Algorithm</h2>
          </div>

          <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
            Providers are evaluated using a multi-metric scoring formula. Scores are normalized out of 100 based on standard industry cellular benchmarks:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-zinc-950/80 rounded-2xl border-0 shadow-inner">
              <span className="text-sm font-bold text-white flex items-center justify-between">
                <span>Speed Weight</span>
                <span className="text-orange-500">50%</span>
              </span>
              <p className="text-xs text-zinc-500 mt-2.5 leading-relaxed">
                Download speed is normalized up to a standard benchmark of 100 Mbps (meaning 100 Mbps or higher returns a speed score of 100).
              </p>
            </div>

            <div className="p-4 bg-zinc-950/80 rounded-2xl border-0 shadow-inner">
              <span className="text-sm font-bold text-white flex items-center justify-between">
                <span>Coverage Weight</span>
                <span className="text-orange-500">25%</span>
              </span>
              <p className="text-xs text-zinc-500 mt-2.5 leading-relaxed">
                Evaluates signal strength coverage percentage (0% to 100%) near the location.
              </p>
            </div>

            <div className="p-4 bg-zinc-950/80 rounded-2xl border-0 shadow-inner">
              <span className="text-sm font-bold text-white flex items-center justify-between">
                <span>Latency Weight</span>
                <span className="text-orange-500">15%</span>
              </span>
              <p className="text-xs text-zinc-500 mt-2.5 leading-relaxed">
                Connection responsiveness: Round-trip time latency under 10ms scores 100%, and values above 150ms score 0% (lower latency is prioritized).
              </p>
            </div>

            <div className="p-4 bg-zinc-950/80 rounded-2xl border-0 shadow-inner">
              <span className="text-sm font-bold text-white flex items-center justify-between">
                <span>Reliability Weight</span>
                <span className="text-orange-500">10%</span>
              </span>
              <p className="text-xs text-zinc-500 mt-2.5 leading-relaxed">
                Calculates packet-loss success rate and connection stability percentages.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Architecture Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <Layers size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Modular Data Architecture</h2>
          </div>

          <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
            NetworkWise is built with modularity as a core requirement. The backend uses the **Adapter Design Pattern** to ingest network telemetry from multiple sources without altering the scoring service or Express router:
          </p>

          <ul className="space-y-4 text-sm text-zinc-300">
            <li className="flex gap-2">
              <span className="font-bold text-orange-550 shrink-0">1. Database Adapter:</span>
              <span className="text-zinc-400">Queries our structured PostgreSQL tables for historic regional logs within a geofenced coordinate boundary.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-orange-550 shrink-0">2. External Mock Adapter:</span>
              <span className="text-zinc-400">Simulates real-time feeds from third-party cell tower maps and crowdsourced networks, blending records on-the-fly.</span>
            </li>
          </ul>
        </motion.div>

        {/* Roadmap Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <Calendar size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Future Roadmap</h2>
          </div>

          <div className="space-y-4 text-sm text-zinc-400">
            <p className="leading-relaxed">We designed the codebase structure so that the following extensions can be integrated with minimal effort:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-zinc-300">
              <div className="flex items-center gap-2.5 p-3 bg-zinc-950/80 rounded-xl border-0 shadow-inner">
                <Signal size={14} className="text-orange-500 shrink-0" />
                <span>Built-in Browser Speed Test</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-zinc-950/80 rounded-xl border-0 shadow-inner">
                <Signal size={14} className="text-orange-500 shrink-0" />
                <span>Crowdsourced speed submissions</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-zinc-950/80 rounded-xl border-0 shadow-inner">
                <Signal size={14} className="text-orange-500 shrink-0" />
                <span>Interactive coverage heatmap</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-zinc-950/80 rounded-xl border-0 shadow-inner">
                <Signal size={14} className="text-orange-500 shrink-0" />
                <span>AI-generated recommendations</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
