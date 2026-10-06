'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, RefreshCw, CheckCircle2, AlertCircle, Radio, Signal } from 'lucide-react';
import { getClientNetworkInfo } from '@/utils/api';

// Get backend base URL from process.env
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type TestState = 'idle' | 'pinging' | 'downloading' | 'completed' | 'error';
type NetworkGen = '5G' | '4G LTE' | '4G' | '3G' | 'Detecting...';

export default function SpeedTest() {
  const [testState, setTestState] = useState<TestState>('idle');
  const [ping, setPing] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ispName, setIspName] = useState<string>('');
  const [networkGen, setNetworkGen] = useState<NetworkGen>('Detecting...');

  // Fetch detected network ISP on mount and check network API
  useEffect(() => {
    getClientNetworkInfo()
      .then((info) => {
        setIspName(info.isp);

        // Check Network Information API hints if supported by browser
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
          const conn = (navigator as unknown as { connection?: { downlink?: number; effectiveType?: string } }).connection;
          if (conn?.downlink && conn.downlink >= 45) {
            setNetworkGen('5G');
          } else if (conn?.effectiveType === '4g') {
            setNetworkGen('4G LTE');
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Determine 5G vs 4G based on real-time speed, latency, and carrier radio indicators
  const resolveGeneration = (currentSpeed: number, currentPing: number | null): NetworkGen => {
    // 5G Ultra Criteria:
    // Speed >= 45 Mbps OR (Speed >= 38 Mbps and Ping <= 35ms)
    if (currentSpeed >= 45 || (currentSpeed >= 38 && currentPing !== null && currentPing <= 35)) {
      return '5G';
    }
    // 4G LTE Advanced Criteria: 15 Mbps to 45 Mbps
    if (currentSpeed >= 15) {
      return '4G LTE';
    }
    // 4G Standard: 5 to 15 Mbps
    if (currentSpeed >= 5) {
      return '4G';
    }
    // 3G Legacy / Congested
    if (currentSpeed > 0) {
      return '3G';
    }
    return 'Detecting...';
  };

  const runSpeedTest = async () => {
    setTestState('pinging');
    setErrorMsg(null);
    setPing(null);
    setSpeed(0);
    setProgress(0);
    setNetworkGen('Detecting...');

    try {
      // 1. Latency (Ping) Test - 3 rounds
      const pings: number[] = [];
      for (let i = 0; i < 3; i++) {
        const pingStart = performance.now();
        const res = await fetch(`${API_URL}/speedtest/ping?t=${Date.now()}`);
        if (!res.ok) throw new Error('Ping failed');
        pings.push(performance.now() - pingStart);
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
          const speedBps = (receivedBytes * 8) / elapsedSeconds;
          const speedMbps = parseFloat((speedBps / (1024 * 1024)).toFixed(1));
          setSpeed(speedMbps);

          // Real-time dynamic generation evaluation
          const detectedGen = resolveGeneration(speedMbps, avgPing);
          if (detectedGen !== 'Detecting...') {
            setNetworkGen(detectedGen);
          }
        }
      }

      setTestState('completed');
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Network test failed. Server unreachable.';
      setErrorMsg(errMsg);
      setTestState('error');
    }
  };

  // Run automatically on page mount
  useEffect(() => {
    const timer = setTimeout(() => {
      runSpeedTest();
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute speedometer angle: dynamically scale to 150 Mbps if 5G detected
  const maxSpeedLimit = speed > 100 || networkGen === '5G' ? 150 : 100;
  const speedPercentage = Math.min(speed / maxSpeedLimit, 1);
  const strokeDashoffset = 251.2 - 251.2 * speedPercentage;

  const getSpeedRecommendation = () => {
    if (networkGen === '5G' || speed >= 45) {
      return {
        text: '5G Ultra Connection Detected',
        desc: 'Blazing 5G speeds with ultra-low latency. Perfect for 4K/8K streaming, competitive gaming, and massive bandwidth transfers.',
        color: 'text-emerald-400 font-black',
      };
    }
    if (networkGen === '4G LTE' || speed >= 15) {
      return {
        text: '4G LTE Advanced Connection',
        desc: 'High-speed 4G cellular data. Ideal for HD video calls, standard web browsing, and multi-device streaming.',
        color: 'text-orange-500 font-extrabold',
      };
    }
    if (speed >= 5) {
      return {
        text: '4G Standard Connection',
        desc: 'Adequate for social messaging and light web browsing. Consider moving closer to windows for LTE Advanced reception.',
        color: 'text-amber-500 font-bold',
      };
    }
    return {
      text: '3G / Congested Connection',
      desc: 'Slow cellular reception. Expect buffering on video calls. Check our regional recommendations for faster local carriers.',
      color: 'text-rose-500 font-black',
    };
  };

  const recommendation = getSpeedRecommendation();

  // Badge styling depending on 5G vs 4G
  const getGenBadge = () => {
    switch (networkGen) {
      case '5G':
        return {
          label: '5G Ultra',
          pillClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10 shadow-sm animate-pulse',
          dotClass: 'bg-emerald-400',
        };
      case '4G LTE':
        return {
          label: '4G LTE',
          pillClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          dotClass: 'bg-orange-400',
        };
      case '4G':
        return {
          label: '4G',
          pillClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dotClass: 'bg-amber-400',
        };
      case '3G':
        return {
          label: '3G',
          pillClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dotClass: 'bg-rose-400',
        };
      default:
        return {
          label: 'Detecting Band...',
          pillClass: 'bg-zinc-800 text-zinc-400 border-zinc-700',
          dotClass: 'bg-zinc-400',
        };
    }
  };

  const genBadge = getGenBadge();

  return (
    <div className="rounded-3xl bg-card p-6 md:p-8 shadow-[var(--card-shadow)] border border-[var(--card-border)] relative overflow-hidden transition-all duration-300 w-full text-left">
      {/* Glow highlight */}
      <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-orange-655 to-amber-500 animate-pulse" />

      {/* Header with Detected ISP & 5G/4G Badge */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Zap size={16} className="text-orange-500" />
              Live Network Speed Test
            </h3>
            {/* Real-time 5G / 4G Generation Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${genBadge.pillClass}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${genBadge.dotClass}`} />
              {genBadge.label}
            </span>
          </div>

          <p className="text-[10px] font-bold text-muted-txt uppercase tracking-wider mt-1 flex items-center gap-1.5">
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

      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
        
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
                <stop offset="100%" stopColor={networkGen === '5G' ? '#10b981' : '#e11d48'} />
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
            <span className={`text-[9px] font-extrabold uppercase mt-0.5 ${networkGen === '5G' ? 'text-emerald-400' : 'text-orange-400'}`}>
              {networkGen !== 'Detecting...' ? networkGen : ''}
            </span>
          </div>
        </div>

        {/* Diagnostic Data Panels: 3-column metrics */}
        <div className="flex-grow space-y-4 w-full">
          <div className="grid grid-cols-3 gap-2">
            
            {/* Download Speed */}
            <div className="p-2.5 bg-input-bg rounded-2xl border border-[var(--card-border)] shadow-inner">
              <span className="text-[8px] sm:text-[9px] text-muted-txt font-extrabold uppercase tracking-wider block truncate">Download</span>
              <span className="text-xs sm:text-base font-black text-foreground block mt-1 truncate">
                {speed > 0 ? `${speed} Mbps` : '...'}
              </span>
            </div>

            {/* Latency (Ping) */}
            <div className="p-2.5 bg-input-bg rounded-2xl border border-[var(--card-border)] shadow-inner">
              <span className="text-[8px] sm:text-[9px] text-muted-txt font-extrabold uppercase tracking-wider flex items-center gap-0.5 truncate">
                <Activity size={9} className="text-muted-txt shrink-0" />
                Ping
              </span>
              <span className="text-xs sm:text-base font-black text-foreground block mt-1 truncate">
                {ping !== null ? `${ping} ms` : '...'}
              </span>
            </div>

            {/* Network Band / Technology (5G vs 4G) */}
            <div className="p-2.5 bg-input-bg rounded-2xl border border-[var(--card-border)] shadow-inner">
              <span className="text-[8px] sm:text-[9px] text-muted-txt font-extrabold uppercase tracking-wider flex items-center gap-0.5 truncate">
                {networkGen === '5G' ? (
                  <Radio size={9} className="text-emerald-400 shrink-0" />
                ) : (
                  <Signal size={9} className="text-orange-400 shrink-0" />
                )}
                Network
              </span>
              <span className={`text-xs sm:text-base font-black block mt-1 truncate ${networkGen === '5G' ? 'text-emerald-400' : networkGen === '4G LTE' ? 'text-orange-400' : 'text-foreground'}`}>
                {networkGen}
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
                  <span>Measuring latency & analyzing carrier radio bands...</span>
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
                      Testing throughput ({networkGen})...
                    </span>
                    <span className="font-bold text-orange-555">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1 w-full bg-[var(--divider)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-100 ${networkGen === '5G' ? 'bg-emerald-500' : 'bg-orange-500'}`}
                      style={{ width: `${progress}%` }}
                    />
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
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${networkGen === '5G' ? 'text-emerald-400' : 'text-green-500'}`} />
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
