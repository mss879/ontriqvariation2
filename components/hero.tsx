'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import non-critical hero components
const HeroCTA = dynamic(() => import('./hero-cta'), { ssr: true });
const HeroPromptBar = dynamic(() => import('./hero-prompt-bar'), { 
  ssr: false,
  loading: () => <div className="mx-auto w-full max-w-4xl h-[180px] rounded-[20px] bg-black/20 animate-pulse" />
});

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="relative min-h-screen w-full overflow-hidden bg-black" role="banner">
      <div className="absolute inset-0 z-0">
        <video
          src="https://framerusercontent.com/assets/Bax1SXv4b9QI33bMvkicABKnI.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          loading="lazy"
          className="h-full w-full object-cover lg:blur-none blur-sm"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 flex w-full px-6 md:px-12 lg:px-16 pt-52 pb-20 lg:pt-72 lg:pb-32">
        <div className="w-full">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl xl:text-7xl">
                <span className="inline-block animate-word-fade" style={{ animationDelay: '0.3s' }}>Your</span>{' '}
                <span className="inline-block animate-word-fade" style={{ animationDelay: '0.4s' }}>Complete</span>{' '}
                <span className="inline-block animate-word-fade" style={{ animationDelay: '0.5s' }}>Workforce</span>{' '}
                <span className="inline-block animate-word-fade" style={{ animationDelay: '0.6s' }}>and</span>
                <br />
                <span className="inline-block animate-word-fade" style={{ animationDelay: '0.7s' }}>Business</span>{' '}
                <span className="inline-block animate-word-fade" style={{ animationDelay: '0.8s' }}>Partner</span>
              </h1>
            </div>

            <div className="mb-10 max-w-3xl animate-fade-in" style={{ animationDelay: '1s', opacity: 0, animationFillMode: 'forwards' }}>
              <p className="text-lg leading-relaxed text-white/80 md:text-xl lg:text-2xl">
                Streamline operations with expert Background Verification, HR, Recruitment, Payroll, and Business Setup solutions.
              </p>
            </div>

            <div className="mb-16 animate-fade-in" style={{ animationDelay: '1.1s', opacity: 0, animationFillMode: 'forwards' }}>
              <HeroCTA />
            </div>

            <div className="mx-auto w-full max-w-4xl animate-fade-in" style={{ animationDelay: '1.2s', opacity: 0, animationFillMode: 'forwards' }}>
              <HeroPromptBar />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-24 bg-gradient-to-t from-white via-white/40 to-transparent" aria-hidden="true" />
    </header>
  );
}
