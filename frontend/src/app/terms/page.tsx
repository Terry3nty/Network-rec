'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, AlertTriangle, ShieldCheck, Home, Zap, Scale, Mail } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="bg-zinc-955 text-zinc-150 py-12 px-4 sm:px-6 lg:px-8 min-h-[85vh]">
      <div className="mx-auto max-w-4xl">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={11} />
          <span className="font-bold text-orange-500">Terms of Service</span>
        </nav>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-500 mb-3 border-0">
            <FileText size={13} />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-zinc-500 mt-2 font-mono">
            Last Updated: September 12, 2026 &bull; Governing Law: Federal Republic of Nigeria
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-base text-zinc-400 mb-10 leading-relaxed"
        >
          Please read these Terms of Service carefully before accessing or using <strong className="text-white">NetworkWise</strong>. By browsing, using our recommendation dashboard, executing our speed tests, or integrating our telemetry data, you agree to be bound by these terms and conditions.
        </motion.p>

        {/* Section 1: Nature of Service */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <Zap size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">1. Nature of the Service</h2>
          </div>

          <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
            NetworkWise is an independent software tool providing algorithmic evaluations, multi-metric rankings, and diagnostic performance insights for mobile cellular carriers (MTN, Airtel, Globacom, 9mobile) and Internet Service Providers (Starlink, FiberOne, Spectranet, Smile) operating in Nigeria.
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            We are not affiliated with, sponsored by, or an agent of the Nigerian Communications Commission (NCC) or any telecommunications carrier. All brand names, trade names, and logos are the intellectual property of their respective owners.
          </p>
        </motion.div>

        {/* Section 2: Telecom & Environmental Disclaimers */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <AlertTriangle size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">2. Performance & Advisory Disclaimers</h2>
          </div>

          <div className="space-y-3.5 text-sm text-zinc-400 leading-relaxed">
            <div className="p-4 bg-zinc-950/80 rounded-2xl border-0">
              <strong className="text-white block text-sm mb-1">Advisory & Estimative Purpose</strong>
              <p className="text-xs text-zinc-400">Scores are computed from statistical algorithms, geographic proximity models, and crowdsourced logs. They do not constitute an official service level agreement (SLA) or guarantee of service from any provider.</p>
            </div>
            <div className="p-4 bg-zinc-950/80 rounded-2xl border-0">
              <strong className="text-white block text-sm mb-1">Environmental Attenuation & Indoor Variations</strong>
              <p className="text-xs text-zinc-400">Radio frequency propagation fluctuates with reinforced concrete building structures, metal roofing, elevator shafts, terrain shielding, atmospheric conditions, and real-time carrier cell tower congestion. Indoor signal strengths may differ substantially from exterior readings.</p>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Real Estate & Commercial Use Notice */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <Home size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">3. Real Estate & Property Transactions</h2>
          </div>

          <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
            NetworkWise connectivity ratings are frequently referenced by real estate companies, property developers, diaspora investors, short-let operators, and prospective tenants evaluating homes or commercial office leases.
          </p>

          <div className="p-4 bg-orange-500/5 border border-orange-500/15 rounded-2xl text-xs text-zinc-300 leading-relaxed">
            <strong className="text-orange-400 block font-bold mb-1">Mandatory Verification Notice:</strong>
            NetworkWise ratings are auxiliary guides. Users must physically verify carrier reception and broadband connectivity on-site using active SIM cards and hardware modems prior to signing leases, concluding property purchases, or committing capital. NetworkWise assumes no liability for leasing, purchasing, or commercial investment decisions.
          </div>
        </motion.div>

        {/* Section 4: Acceptable Use */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <ShieldCheck size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">4. Acceptable Use Policy</h2>
          </div>

          <p className="text-sm text-zinc-400 mb-4">By accessing the platform, you agree not to:</p>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            <li className="flex gap-2">
              <span className="text-orange-500 font-bold">&bull;</span>
              <span>Abuse or repeatedly flood our speed test endpoints (<code className="text-orange-400 font-mono text-[10px]">/speedtest/download</code> or <code className="text-orange-400 font-mono text-[10px]">/speedtest/ping</code>) to consume server resources or orchestrate denial-of-service (DoS) attacks.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500 font-bold">&bull;</span>
              <span>Systematically scrape, crawl, or harvest telemetry records without written authorization.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500 font-bold">&bull;</span>
              <span>Attempt to reverse engineer, decompile, or compromise backend database infrastructure.</span>
            </li>
          </ul>
        </motion.div>

        {/* Section 5: Governing Law */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border-0">
              <Scale size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">5. Governing Law & Jurisdiction</h2>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed">
            These Terms of Service shall be governed by and interpreted in accordance with the laws of the <strong className="text-white">Federal Republic of Nigeria</strong>. Any disputes arising in connection with the Service shall be subject to the exclusive jurisdiction of the competent courts of Nigeria.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-3xl bg-zinc-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md border-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-base font-bold text-white mb-1">Legal or Licensing Inquiries?</h3>
            <p className="text-xs text-zinc-400">Reach our legal team regarding enterprise terms, IP acquisition, or B2B contracts.</p>
          </div>
          <a
            href="mailto:legal@networkwise.app"
            className="flex items-center gap-2 rounded-xl bg-orange-655 px-4.5 py-2.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors shrink-0 shadow-md"
          >
            <Mail size={14} />
            <span>Contact Legal Team</span>
          </a>
        </motion.div>

      </div>
    </div>
  );
}
