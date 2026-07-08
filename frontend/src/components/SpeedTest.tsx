'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { getClientNetworkInfo } from '@/utils/api';

// Get backend base URL from process.env
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type TestState = 'idle' | 'pinging' | 'downloading' | 'completed' | 'error';

export default function SpeedTest() {
  const [testState, setTestState] = useState<TestState>('idle');
  const [ping, setPing] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ispName, setIspName] = useState<string>('');

  // Fetch detected network ISP on mount
  useEffect(() => {
    getClientNetworkInfo()
      .then((info) => {
        setIspName(info.isp);
      })
      .catch((err) => console.error(err));
  }, []);

  const runSpeedTest = async () => {
    setTestState('pinging');
    setErrorMsg(null);
    setPing(null);
    setSpeed(0);
    setProgress(0);

    try {
      // 1. Latency (Ping) Test - 3 rounds
      const pings: number[] = [];
      for (let i = 0; i < 3; i++) {
        const pingStart = performance.now();
        // Add timestamp to query to prevent browser caching
        const res = await fetch(`${API_URL}/speedtest/ping?t=${Date.now()}`);
        if (!res.ok) throw new Error('Ping failed');
        pings.push(performance.now() - pingStart);
        // Wait 100ms between pings
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const avgPing = Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
      setPing(avgPing);

      // 2. Download Speed Test - 3MB stream
      setTestState('downloading');
      const downloadStart = performance.now();
      const response = await fetch(`${API_URL}/speedtest/download?size=3&t=${Date.now()}`);
      if (!response.ok) throw new Error('Download request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Body reader unavailable');

      // Attempt to read total length (default to 3MB if headers omitted)
      const contentLengthHeader = response.headers.get('content-length');
      const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader) : 3 * 1024 * 1024;
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        receivedBytes += value.length;
        setProgress(Math.min((receivedBytes / totalBytes) * 100, 100));

        const elapsedSeconds = (performance.now() - downloadStart) / 1000;
        if (elapsedSeconds > 0) {
          // speed = bits / seconds / 1,000,000 to get Mbps
          const speedBps = (receivedBytes * 8) / elapsedSeconds;
          const speedMbps = parseFloat((speedBps / (1024 * 1024)).toFixed(1));
          setSpeed(speedMbps);
        }
      }

      setTestState('completed');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Network test failed. Server unreachable.');
      setTestState('error');
    }
  };

  // Run automatically on page mount
  useEffect(() => {
    const timer = setTimeout(() => {
      runSpeedTest();
    }, 800); // Small delay to let the page mount smoothly
    return () => clearTimeout(timer);
  }, []);

  // Compute speedometer angle: max speed displayed 100 Mbps (maps to 180 degrees sweep)
  const maxSpeedLimit = 100;
  const speedPercentage = Math.min(speed / maxSpeedLimit, 1);
  const strokeDashoffset = 251.2 - 251.2 * speedPercentage; // Gauge circumference is 251.2

  const getSpeedRecommendation = () => {
    if (speed >= 40) return { text: 'Excellent Connection', desc: 'Blazing speed. Perfect for heavy gaming, 4K streaming and high bandwidth downloads.', color: 'text-green-500' };
    if (speed >= 15) return { text: 'Good Connection', desc: 'Stable speed. Ideal for HD streaming, zoom calls, and standard web browsing.', color: 'text-orange-500' };
    return { text: 'Low Connection', desc: 'Slow response. Check other operators or move closer to windows for better reception.', color: 'text-rose-500 font-black' };
  };

  const recommendation = getSpeedRecommendation();

  return (
    <div className="rounded-3xl bg-card p-6 md:p-8 shadow-[var(--card-shadow)] border border-[var(--card-border)] relative overflow-hidden transition-all duration-300 w-full text-left">
      {/* Glow highlight */}
      <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-orange-655 to-amber-500 animate-pulse" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Zap size={16} className="text-orange-500" />
            Live Network Speed Test
          </h3>
          <p className="text-[10px] font-bold text-muted-txt uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
            {ispName ? (
              <>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                Detected: <span className="text-orange-500 font-extrabold">{ispName}</span>
              </>
            ) : (
              'Real-time connection audit'
            )}
          </p>
        </div>

        <button
          onClick={runSpeedTest}
          disabled={testState === 'pinging' || testState === 'downloading'}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-input-bg border border-[var(--card-border)] hover:bg-[var(--divider)] text-foreground transition-colors cursor-pointer disabled:opacity-30 active:scale-95 shrink-0"
          title="Re-run speed test"
        >
          <RefreshCw size={14} className={testState === 'pinging' || testState === 'downloading' ? 'animate-spin text-orange-500' : ''} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8 justify-center">
        
        {/* Speedometer Gauge */}
        <div className="relative flex items-center justify-center h-36 w-36 shrink-0 select-none">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="var(--divider)"
              strokeWidth="6"
            />
            {/* Active speed progress indicator */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="url(#speedGradient)"
              strokeWidth="7.5"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
          </svg>

          {/* Speed value overlays */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-foreground tracking-tight leading-none">
              {speed}
            </span>
            <span className="text-[10px] font-bold text-muted-txt uppercase tracking-widest mt-1">
              Mbps
            </span>
          </div>
        </div>

        {/* Diagnostic Data Panels (Improved Mobile Responsiveness) */}
        <div className="flex-grow space-y-4.5 w-full">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            
            {/* Download panel */}
            <div className="p-2.5 sm:p-3 bg-input-bg rounded-2xl border border-[var(--card-border)] shadow-inner">
              <span className="text-[9px] sm:text-[10px] text-muted-txt font-extrabold uppercase tracking-wider block truncate">Download Speed</span>
              <span className="text-sm min-[360px]:text-base sm:text-lg font-black text-foreground block mt-1 truncate">
                {speed > 0 ? `${speed} Mbps` : 'Measuring...'}
              </span>
            </div>

            {/* Latency (Ping) panel */}
            <div className="p-2.5 sm:p-3 bg-input-bg rounded-2xl border border-[var(--card-border)] shadow-inner">
              <span className="text-[9px] sm:text-[10px] text-muted-txt font-extrabold uppercase tracking-wider flex items-center gap-1 truncate">
                <Activity size={10} className="text-muted-txt shrink-0" />
                Latency (Ping)
              </span>
              <span className="text-sm min-[360px]:text-base sm:text-lg font-black text-foreground block mt-1 truncate">
                {ping !== null ? `${ping} ms` : 'Testing...'}
              </span>
            </div>
          </div>

          {/* Test Status Indicator Drawer */}
          <div className="text-xs">
            <AnimatePresence mode="wait">
              
              {testState === 'pinging' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-muted-txt font-medium"
                >
                  <LoaderIcon />
                  <span>Measuring connection latency RTT...</span>
                </motion.div>
              )}

              {testState === 'downloading' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-muted-txt font-medium">
                    <span className="flex items-center gap-2">
                      <LoaderIcon />
                      Streaming test payload...
                    </span>
                    <span className="font-bold text-orange-555">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1 w-full bg-[var(--divider)] rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                  </div>
                </motion.div>
              )}

              {testState === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5"
                >
                  <CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <span className={`font-black block text-sm tracking-tight ${recommendation.color}`}>
                      {recommendation.text}
                    </span>
                    <p className="text-muted-txt text-[11px] leading-relaxed mt-0.5">
                      {recommendation.desc}
                    </p>
                  </div>
                </motion.div>
              )}

              {testState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 text-red-405 font-bold"
                >
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-sm tracking-tight text-red-500">Test Interrupted</span>
                    <p className="text-muted-txt text-[11px] leading-relaxed mt-0.5">
                      {errorMsg || 'Server refused connections. Check backend logs.'}
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple loader helper icon
function LoaderIcon() {
  return (
    <svg className="animate-spin h-3.5 w-3.5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
