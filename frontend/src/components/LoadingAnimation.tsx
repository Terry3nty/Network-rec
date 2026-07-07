'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Signal, Loader2 } from 'lucide-react';

interface LoadingAnimationProps {
  customLocation?: string | null;
}

const STEPS = [
  'Accessing Geolocation Sensor...',
  'Determining GPS Coordinates...',
  'Resolving Coordinates Address...',
  'Querying Regional Cellular Grids...',
  'Blending Speed Logs & Coverage Databases...',
  'Calculating Weighted Provider Ranks...',
  'Compiling Recommendations...',
];

export default function LoadingAnimation({ customLocation }: LoadingAnimationProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl backdrop-blur-md max-w-lg w-full mx-auto transition-colors duration-300">
      
      {/* 📡 Radar Scanning Visualizer */}
      <div className="relative mb-10 h-44 w-44 flex items-center justify-center overflow-hidden">
        
        {/* Concentric Circles */}
        <div className="absolute h-40 w-40 rounded-full border border-blue-500/10 dark:border-blue-400/5" />
        <div className="absolute h-28 w-28 rounded-full border border-blue-500/20 dark:border-blue-400/10" />
        <div className="absolute h-16 w-16 rounded-full border border-blue-500/30 dark:border-blue-400/20" />
        
        {/* Sweeping Sonar Scan Line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute h-40 w-40 origin-center rounded-full bg-gradient-to-tr from-blue-500/0 via-blue-500/0 to-blue-500/20 z-0 pointer-events-none"
        />

        {/* Mock Glowing Signal Towers appearing dynamically */}
        <motion.div
          animate={{ opacity: [0.1, 1, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute top-8 left-10 h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
        />
        <motion.div
          animate={{ opacity: [0.1, 1, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
          className="absolute bottom-12 right-8 h-2 w-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"
        />
        <motion.div
          animate={{ opacity: [0.1, 1, 0.1] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
          className="absolute top-20 right-14 h-2 w-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
        />

        {/* Central Core Signal Pulse */}
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20">
          <Signal size={26} className="animate-pulse" />
        </div>
      </div>

      {/* Main Title */}
      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
        Analyzing Local Airwaves
      </h3>

      {/* Optional Location Badge */}
      {customLocation && (
        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-6 bg-blue-50/80 dark:bg-blue-950/40 px-3.5 py-1.5 rounded-full border border-blue-100/50 dark:border-blue-900/30">
          Location: {customLocation}
        </p>
      )}

      {/* Stepper Status Box */}
      <div className="h-10 overflow-hidden relative w-72 flex items-center justify-center border-t border-b border-slate-100 dark:border-slate-800/60 py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-center gap-2.5"
          >
            <Loader2 size={13} className="animate-spin text-blue-500 shrink-0" />
            <span className="tracking-wide">{STEPS[stepIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Linear Percentage Track */}
      <div className="w-64 h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden mt-6 shadow-inner">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
        />
      </div>
    </div>
  );
}
