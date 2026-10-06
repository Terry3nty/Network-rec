'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Eye,
  Globe2,
  Smartphone,
  Laptop,
  RefreshCw,
  MapPin,
  Wifi,
  ChevronRight,
  ShieldCheck,
  Radio,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import { fetchAnalyticsStats, AnalyticsStats } from '@/utils/api';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const data = await fetchAnalyticsStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError('Could not connect to analytics telemetry server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Fetch initial stats asynchronously
    const init = async () => {
      try {
        const data = await fetchAnalyticsStats();
        if (isMounted) {
          setStats(data);
          setLastUpdated(new Date());
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError('Could not connect to analytics telemetry server.');
          setLoading(false);
        }
      }
    };

    init();

    // Auto-poll every 30 seconds
    const interval = setInterval(() => {
      fetchAnalyticsStats()
        .then((data) => {
          if (isMounted) {
            setStats(data);
            setLastUpdated(new Date());
          }
        })
        .catch(console.error);
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Helper to get Channel badge styling
  const getChannelStyle = (channel: string) => {
    const lower = channel.toLowerCase();
    if (lower.includes('linkedin')) {
      return { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' };
    }
    if (lower.includes('whatsapp')) {
      return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' };
    }
    if (lower.includes('twitter') || lower.includes('x')) {
      return { bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', dot: 'bg-cyan-400' };
    }
    if (lower.includes('google') || lower.includes('search')) {
      return { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' };
    }
    return { bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-400' };
  };

  const topReferrerName = stats?.topReferrers?.[0]?.name || 'Direct / Bookmark';

  return (
    <div className="bg-zinc-955 text-zinc-150 py-10 px-4 sm:px-6 lg:px-8 min-h-[90vh]">
      <div className="mx-auto max-w-7xl">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={11} />
          <span className="font-bold text-orange-500">Traffic Intelligence</span>
        </nav>

        {/* Header with Live Indicator & Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-500 mb-2.5">
              <Radio size={13} className="animate-pulse" />
              <span>Real-Time Traffic Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Traffic & Referral Intelligence
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Live telemetry tracking inbound sources (LinkedIn, WhatsApp, etc.), devices, and telecom coverage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={() => loadStats(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => loadStats(true)} className="underline hover:text-white">Retry</button>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-zinc-900/60 rounded-3xl backdrop-blur-md shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Page Views</span>
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <Eye size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {loading ? '...' : (stats?.totalVisits ?? 0)}
            </div>
            <span className="text-[11px] text-zinc-500 mt-2">Across all platform routes</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 bg-zinc-900/60 rounded-3xl backdrop-blur-md shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Unique Visitors</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Users size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {loading ? '...' : (stats?.uniqueVisitors ?? 0)}
            </div>
            <span className="text-[11px] text-zinc-500 mt-2">Distinct IP addresses</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 bg-zinc-900/60 rounded-3xl backdrop-blur-md shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Top Traffic Channel</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Share2 size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight truncate">
              {loading ? '...' : topReferrerName}
            </div>
            <span className="text-[11px] text-zinc-500 mt-2">Primary inbound acquisition</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 bg-zinc-900/60 rounded-3xl backdrop-blur-md shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Top Detected ISP</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Wifi size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight truncate">
              {loading ? '...' : (stats?.topIsps?.[0]?.name || 'MTN Nigeria')}
            </div>
            <span className="text-[11px] text-zinc-500 mt-2">Most active subscriber base</span>
          </motion.div>
        </div>

        {/* Traffic Channels Breakdown & Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Acquisition Channels (2 cols) */}
          <div className="lg:col-span-2 bg-zinc-900/60 rounded-3xl p-6 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Inbound Traffic Channels</h2>
                  <p className="text-xs text-zinc-400">Where people are clicking your links from</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-xs text-zinc-500">Loading traffic sources...</div>
            ) : !stats?.topReferrers?.length ? (
              <div className="py-10 text-center text-xs text-zinc-500">No referral traffic recorded yet.</div>
            ) : (
              <div className="space-y-4">
                {stats.topReferrers.map((ref) => {
                  const percentage = stats.totalVisits > 0 ? Math.round((ref.count / stats.totalVisits) * 100) : 0;
                  const style = getChannelStyle(ref.name);
                  return (
                    <div key={ref.name} className="p-4 bg-zinc-950/80 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style.bg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {ref.name}
                        </span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-white mr-2">{ref.count} visits</span>
                          <span className="text-xs font-mono text-zinc-400">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device & Platform Breakdown (1 col) */}
          <div className="bg-zinc-900/60 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Device Breakdown</h2>
                  <p className="text-xs text-zinc-400">Visitor hardware form factor</p>
                </div>
              </div>

              <div className="space-y-3">
                {stats?.deviceBreakdown?.map((item) => (
                  <div key={item.name} className="p-3.5 bg-zinc-950/80 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {item.name === 'Mobile' ? (
                        <Smartphone size={16} className="text-orange-400" />
                      ) : item.name === 'Tablet' ? (
                        <Smartphone size={16} className="text-blue-400" />
                      ) : (
                        <Laptop size={16} className="text-emerald-400" />
                      )}
                      <span className="text-xs font-bold text-white">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-orange-400">{item.count}</span>
                  </div>
                )) || (
                  <div className="text-center py-6 text-xs text-zinc-500">No device records yet.</div>
                )}
              </div>
            </div>

            {/* Popular Pages Section */}
            <div className="mt-6 pt-6 border-t border-zinc-800/80">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Popular Pages Visited</h3>
              <div className="space-y-2">
                {stats?.popularPages?.slice(0, 4).map((page) => (
                  <div key={page.name} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-300 truncate max-w-[170px]">{page.name}</span>
                    <span className="text-zinc-500 font-mono">{page.count} views</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Geographic Locations & ISPs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Top Locations */}
          <div className="bg-zinc-900/60 rounded-3xl p-6 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <MapPin size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Geographic Locations</h2>
                <p className="text-xs text-zinc-400">Visitor cities and territories</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {stats?.topCities?.map((c) => (
                <div key={c.name} className="p-3 bg-zinc-950/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe2 size={14} className="text-zinc-500" />
                    <span className="text-xs font-medium text-white">{c.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-400">{c.count}</span>
                </div>
              )) || <div className="text-xs text-zinc-500 py-4 text-center">No location logs available.</div>}
            </div>
          </div>

          {/* Top ISPs / Carriers */}
          <div className="bg-zinc-900/60 rounded-3xl p-6 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <Wifi size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Telecom Providers & ISPs</h2>
                <p className="text-xs text-zinc-400">Carrier networks used by visitors</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {stats?.topIsps?.map((isp) => (
                <div key={isp.name} className="p-3 bg-zinc-950/80 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-medium text-white truncate max-w-[220px]">{isp.name}</span>
                  <span className="text-xs font-mono font-bold text-orange-400">{isp.count}</span>
                </div>
              )) || <div className="text-xs text-zinc-500 py-4 text-center">No ISP logs available.</div>}
            </div>
          </div>
        </div>

        {/* Live Visitor Activity Stream (Table) */}
        <div className="bg-zinc-900/60 rounded-3xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Live Visitor Telemetry Stream</h2>
                <p className="text-xs text-zinc-400">Chronological feed of incoming visits</p>
              </div>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">Showing latest 30 visits</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Traffic Source</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">ISP / Carrier</th>
                  <th className="py-3 px-3">Page</th>
                  <th className="py-3 px-3">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {stats?.recentLogs?.map((log) => {
                  const style = getChannelStyle(log.referrer || 'Direct');
                  return (
                    <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-3 text-zinc-400 font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${style.bg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {log.referrer || 'Direct'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-300 whitespace-nowrap">
                        {log.city ? `${log.city}, ${log.country || 'Nigeria'}` : 'Nigeria'}
                      </td>
                      <td className="py-3 px-3 text-zinc-300 truncate max-w-[150px]">
                        {log.isp || 'Mobile Network'}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-400 whitespace-nowrap">
                        {log.path || '/'}
                      </td>
                      <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                        {log.device || 'Desktop'}
                      </td>
                    </tr>
                  );
                })}
                {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      No visits recorded yet. Visits will populate here live as users arrive.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
