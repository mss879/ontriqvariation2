'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
// import { 
//   Zap, 
//   Rocket, 
//   ArrowUpRight, 
//   Star, 
//   MessageCircle 
// } from 'lucide-react';
import { cn } from '@/lib/utils';

const BentoGrid = memo(function BentoGrid() {
  return (
    <section id="who-we-are" className="relative overflow-hidden bg-white py-24 text-slate-900 md:py-28" aria-labelledby="who-we-are-heading">
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-4 md:px-6 lg:gap-20">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            <span className="h-1 w-8 rounded-full bg-[#F75834]" aria-hidden="true"></span>
            <span className="text-slate-900">001</span>
            <span>Who We Are</span>
          </div>
          <div className="space-y-4">
            <h2 id="who-we-are-heading" className="text-[44px] font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              <span className="text-slate-900">Empowering </span>
              <span className="text-slate-400">Business Excellence.</span>
            </h2>
            <p className="max-w-[800px] text-base text-slate-500 md:text-lg leading-relaxed">
              Established in 2025, Ontriq(PVT) LTD is a proud subsidiary of Konnect BPO Technologies (PVT) LTD, Sri Lanka’s leading business process outsourcing provider. We are committed to delivering uninterrupted, high-quality services and customized solutions that empower our clients to excel in today’s competitive business landscape.
            </p>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6">
          
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* Card 1: Core Services (Large) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-10 lg:col-span-8 group"
            >
              <div className="absolute inset-0 opacity-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="relative flex h-full flex-col justify-between gap-10">
                <div className="max-w-2xl space-y-4">
                  <h3 className="text-3xl font-semibold md:text-[36px] text-slate-900">Our Core Services</h3>
                  <p className="text-base text-slate-500 md:text-lg leading-relaxed">
                    Our broad range of services enables both local and international companies to streamline operations by outsourcing non-core functions. With a focus on precision, confidentiality, and efficiency, Ontriq helps businesses reduce administrative overhead, boost operational efficiency, and redirect focus toward strategic initiatives and core business activities.
                  </p>
                </div>

                {/* Marquee Section - Text Only */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm">
                  <div className="flex min-w-max gap-8 animate-whyUsMarquee" aria-hidden="true">
                    {[
                      'Background Verification (BGV) Services',
                      'Human Resource Solutions',
                      'Talent Recruitment',
                      'Payroll Management',
                      'Business Formation and Setup',
                      'Background Verification (BGV) Services',
                      'Human Resource Solutions',
                      'Talent Recruitment',
                      'Payroll Management',
                      'Business Formation and Setup',
                    ].map((service, idx) => (
                      <div key={idx} className="flex items-center gap-2 shrink-0">
                        <span className="text-lg font-medium text-slate-700 uppercase tracking-wide">{service}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mx-4"></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Satisfaction / Global (Small) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 lg:col-span-4"
            >
              <div className="absolute inset-0">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/50 to-orange-50/50"></div>
              </div>
              <div className="relative flex h-full flex-col justify-between gap-6 p-8 sm:p-10">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-500">
                  <span>Global Reach</span>
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                </div>
                <div>
                  <div className="text-6xl font-semibold leading-tight sm:text-[70px] text-slate-900">Global</div>
                  <p className="mt-3 max-w-xs text-base text-slate-500">Serving clients worldwide.</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-1">
                    {/* {[1, 2, 3, 4, 5].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))} */}
                    <span className="ml-2 text-sm font-medium text-slate-900">5.0</span>
                  </div>
                  <span className="text-sm text-slate-500">Trusted Partner</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:auto-rows-[minmax(0,1fr)]">
            
            {/* Card 3: Why Choose Ontriq (Large) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative overflow-hidden rounded-3xl border border-slate-200 lg:col-span-4 text-white"
            >
              {/* Background Image with Blur */}
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop" 
                  alt=""
                  className="h-full w-full object-cover blur-[2px]"
                />
                <div className="absolute inset-0 bg-slate-900/70"></div>
              </div>
              <div className="relative flex h-full flex-col justify-between gap-8 p-10">
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                    <span className="text-orange-500">*</span> Reliable Extension
                  </p>
                  <div className="max-w-[420px] space-y-3">
                    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-300">
                      Why Choose Us
                      <span className="h-1 w-6 rounded-full bg-orange-500"></span>
                    </div>
                    <h3 className="text-4xl font-semibold uppercase leading-tight sm:text-[42px]">Why Choose<br/>Ontriq?</h3>
                    <p className="text-base text-white md:text-lg leading-relaxed">
                      Partnering with Ontriq means gaining a reliable extension of your team—one that understands your challenges and delivers results. Our experienced professionals work hand-in-hand with clients to design scalable, cost-effective solutions that support sustainable growth.
                    </p>
                  </div>
                </div>
                <a href="/contact" className="group inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.35em] text-white">
                  Get started
                  <span className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-1" style={{ background: '#ff502e' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right h-5 w-5" aria-hidden="true">
                      <path d="M7 7h10v10"></path>
                      <path d="M7 17 17 7"></path>
                    </svg>
                  </span>
                </a>
              </div>
            </motion.div>

            {/* Card 4: Speed & Scale (Stacked) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col gap-6 lg:col-span-4 lg:h-full"
            >
              
              {/* Speed */}
              <div className="flex h-full flex-1 flex-col rounded-3xl border border-slate-200 bg-slate-50 p-8">
                <div className="flex items-center gap-3 mb-auto">
                  <span className="hidden h-px flex-1 bg-slate-200 sm:block"></span>
                </div>
                <div className="space-y-2 my-4">
                  <h3 className="text-2xl font-semibold md:text-3xl text-slate-900 min-h-[72px] flex items-start">Speed with<br />Accuracy</h3>
                  <p className="text-base text-slate-500 min-h-[48px]">Industry-leading turnaround time of 7 working days for complete BGV reports.</p>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-400 mt-auto">
                  <span className="h-1 w-8 rounded-full bg-orange-500"></span>
                  <span>Speed</span>
                </div>
              </div>

              {/* Scale */}
              <div className="flex h-full flex-1 flex-col rounded-3xl border border-slate-200 bg-slate-50 p-8">
                <div className="flex items-center gap-3 mb-auto">
                  <span className="hidden h-px flex-1 bg-slate-200 sm:block"></span>
                </div>
                <div className="space-y-2 my-4">
                  <h3 className="text-2xl font-semibold md:text-3xl text-slate-900 min-h-[72px] flex items-start">Tailored<br />Solutions</h3>
                  <p className="text-base text-slate-500 min-h-[48px]">Customized for BPO, financial, healthcare, and IT sectors.</p>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-400 mt-auto">
                  <span className="h-1 w-8 rounded-full bg-blue-600"></span>
                  <span>Growth</span>
                </div>
              </div>
            </motion.div>

            {/* Card 5: Checks & Integrity (Stacked) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col gap-6 lg:col-span-4 lg:h-full"
            >
              
              {/* Comprehensive Checks */}
              <div className="flex h-full flex-1 flex-col rounded-3xl border border-slate-200 bg-slate-50 p-8">
                <div className="flex items-center gap-3 mb-auto">
                  <span className="hidden h-px flex-1 bg-slate-200 sm:block"></span>
                </div>
                <div className="space-y-2 my-4">
                  <h3 className="text-2xl font-semibold md:text-3xl text-slate-900 min-h-[72px] flex items-start">Comprehensive Multi-Level Checks</h3>
                  <p className="text-base text-slate-500 min-h-[48px]">Employment, education, criminal, address, identity, and references.</p>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-400 mt-auto">
                  <span className="h-1 w-8 rounded-full bg-blue-600"></span>
                  <span>Security</span>
                </div>
              </div>

              {/* Data Integrity */}
              <div className="flex h-full flex-1 flex-col rounded-3xl border border-slate-200 bg-slate-50 p-8">
                <div className="flex items-center gap-3 mb-auto">
                  <span className="hidden h-px flex-1 bg-slate-200 sm:block"></span>
                </div>
                <div className="space-y-2 my-4">
                  <h3 className="text-2xl font-semibold md:text-3xl text-slate-900 min-h-[72px] flex items-start">Data Integrity & Confidentiality</h3>
                  <p className="text-base text-slate-500 min-h-[48px]">Full compliance with privacy and data protection regulations.</p>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-400 mt-auto">
                  <span className="h-1 w-8 rounded-full bg-orange-500"></span>
                  <span>Privacy</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
});

export default BentoGrid;
