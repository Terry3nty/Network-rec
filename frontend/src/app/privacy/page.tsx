'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Eye, Database, Globe, UserCheck, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="bg-zinc-955 text-zinc-150 py-12 px-4 sm:px-6 lg:px-8 min-h-[85vh]">
      <div className="mx-auto max-w-4xl">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={11} />
          <span className="font-bold text-orange-500">Privacy Policy</span>
        </nav>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-500 mb-3 border-0">
            <Shield size={13} />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-500 mt-2 font-mono">
            Last Updated: September 12, 2026 &bull; Compliant with NDPA 2023
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-base text-zinc-400 mb-10 leading-relaxed"
        >
          Welcome to <strong className="text-white">NetworkWise</strong>. We value your privacy and are committed to transparency in our telemetry, speed testing, and geographic evaluation operations. This Privacy Policy details the exact data we collect, why we process it, and how your information is safeguarded in accordance with the <strong className="text-orange-450">Nigeria Data Protection Act 2023 (NDPA)</strong>.
        </motion.p>

        {/* Section 1: Data We Collect */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <Eye size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">1. Information We Collect</h2>
          </div>

          <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
            <div className="p-4.5 bg-zinc-950/80 rounded-2xl border-0 shadow-inner">
              <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Hardware Geolocation Data
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When you click <strong className="text-zinc-200">&quot;Find the Best Network Near Me&quot;</strong> or <strong className="text-zinc-200">&quot;Locate Me&quot;</strong>, the application requests access to your physical coordinates via your browser’s HTML5 Geolocation API (<code className="text-orange-400 font-mono text-[11px]">navigator.geolocation</code>). We receive latitude and longitude solely to calculate local signal benchmarks and render regional map pins. We do not access location in the background.
              </p>
            </div>

            <div className="p-4.5 bg-zinc-950/80 rounded-2xl border-0 shadow-inner">
              <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Diagnostic SpeedTest Telemetry
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When running the speed test diagnostics tool, we record network throughput metrics: download speed (Mbps), upload speed (Mbps), latency round-trip time (ping in ms), packet reliability, and detected Internet Service Provider (ISP).
              </p>
            </div>

            <div className="p-4.5 bg-zinc-950/80 rounded-2xl border-0 shadow-inner">
              <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Technical Server & Traffic Logs
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Our backend server logs visitor metadata (<code className="text-orange-400 font-mono text-[11px]">ip</code>, <code className="text-orange-400 font-mono text-[11px]">isp</code>, <code className="text-orange-400 font-mono text-[11px]">city</code>, <code className="text-orange-400 font-mono text-[11px]">userAgent</code>) to monitor system performance, detect distributed denial of service (DDoS) attempts, and compute aggregate regional demand metrics.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 2: How Data is Used */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <Database size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">2. How We Use This Information</h2>
          </div>

          <ul className="space-y-3.5 text-sm text-zinc-300">
            <li className="flex gap-2.5">
              <span className="text-orange-500 font-bold">&bull;</span>
              <span><strong>Computing Dynamic Rankings:</strong> Generating multi-metric telecom scores (50% Speed, 25% Coverage, 15% Latency, 10% Reliability) for your exact location.</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-orange-500 font-bold">&bull;</span>
              <span><strong>Reverse Geocoding:</strong> Translating coordinate pairs into human-readable locations (e.g., <em>&quot;Osiele, Ogun State&quot;</em> or <em>&quot;Ikeja, Lagos&quot;</em>).</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-orange-500 font-bold">&bull;</span>
              <span><strong>Crowdsourced Telemetry:</strong> Aggregating verified speed records into our benchmark datasets to continually refine carrier scoring models.</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-orange-500 font-bold">&bull;</span>
              <span><strong>Platform Security:</strong> Mitigating automated scraping and bandwidth abuse on test endpoints.</span>
            </li>
          </ul>
        </motion.div>

        {/* Section 3: Third Parties */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <Globe size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">3. Third-Party Integrations</h2>
          </div>

          <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
            NetworkWise integrates with selected external open data and infrastructure providers:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-zinc-950/80 rounded-2xl border-0">
              <strong className="text-white block text-sm mb-1">OpenStreetMap & Nominatim</strong>
              <p className="text-zinc-400">Used for reverse geocoding and search suggestions. Transmits coordinates and search queries with identifying user-agent headers.</p>
            </div>
            <div className="p-4 bg-zinc-950/80 rounded-2xl border-0">
              <strong className="text-white block text-sm mb-1">CartoDB Voyager</strong>
              <p className="text-zinc-400">Delivers high-contrast map tiles for our interactive Leaflet visualizer.</p>
            </div>
            <div className="p-4 bg-zinc-950/80 rounded-2xl border-0">
              <strong className="text-white block text-sm mb-1">ipapi.co</strong>
              <p className="text-zinc-400">Used on page load to detect your current public IP address and ISP name displayed in the dashboard header.</p>
            </div>
            <div className="p-4 bg-zinc-950/80 rounded-2xl border-0">
              <strong className="text-white block text-sm mb-1">Vercel & Cloud Hosting</strong>
              <p className="text-zinc-400">Powers edge content delivery and encrypted transit under SSL/TLS certificates.</p>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <UserCheck size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">4. Your Rights (NDPA 2023)</h2>
          </div>

          <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
            Under the Nigeria Data Protection Act 2023, you retain fundamental rights regarding your data:
          </p>

          <ul className="space-y-2 text-sm text-zinc-300">
            <li>&bull; <strong>Consent Revocation:</strong> You can refuse or disable browser location permissions at any time.</li>
            <li>&bull; <strong>Right to Erasure:</strong> You may request the deletion of server logs linked to your IP address.</li>
            <li>&bull; <strong>Data Inquiries:</strong> You can contact our team to request information on stored telemetry records.</li>
          </ul>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-base font-bold text-white mb-1">Questions about our Privacy Policy?</h3>
            <p className="text-xs text-zinc-400">Reach our engineering and privacy team directly for data requests or legal questions.</p>
          </div>
          <a
            href="mailto:privacy@networkwise.app"
            className="flex items-center gap-2 rounded-xl bg-orange-655 px-4.5 py-2.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors shrink-0 shadow-md"
          >
            <Mail size={14} />
            <span>Contact Privacy Officer</span>
          </a>
        </motion.div>

      </div>
    </div>
  );
}
