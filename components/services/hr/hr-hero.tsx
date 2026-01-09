'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface HrHeroProps {
  serviceNumber: string;
  title: string;
  subtitle?: string;
  description: string;
}

export function HrHero({ serviceNumber, title, subtitle, description }: HrHeroProps) {
  return (
    <section className="relative bg-white pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-16">
          
          {/* Top Row: Number & Title */}
          <div className="grid md:grid-cols-12 gap-8 border-b border-slate-200 pb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="md:col-span-1 text-sm font-medium text-slate-500 font-mono pt-2"
            >
              /{serviceNumber}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-11"
            >
              <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-slate-900 leading-[0.9]">
                {title}
                <br />
                <span className="text-slate-300">{subtitle}</span>
              </h1>
            </motion.div>
          </div>

          {/* Bottom Row: Description & Stats/Tags */}
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4 lg:col-span-5 overflow-hidden rounded-2xl">
              <Image 
                src="/Hr services.png" 
                alt="HR Services" 
                width={600}
                height={400}
                className="w-full h-auto scale-105"
                priority
                quality={85}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 500px"
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-8 lg:col-span-7 flex flex-col justify-between gap-8"
            >
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light">
                {description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                {['Productive', 'Compliant', 'Engaged'].map((tag, i) => (
                  <span key={i} className="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
