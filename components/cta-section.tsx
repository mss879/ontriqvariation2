"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export const CTASection = memo(function CTASection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="w-full bg-white py-6 md:py-12" aria-labelledby="cta-heading">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-black px-6 py-12 md:px-12 md:py-16">
          {/* Background Glows */}
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-y-1/2 translate-x-[-20%] rounded-full bg-orange-600/20 blur-[120px]" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] translate-y-1/2 translate-x-[20%] rounded-full bg-blue-600/20 blur-[120px]" aria-hidden="true" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center">

            {/* Spinning Bubble */}
            <div className="mb-6 relative h-20 w-20 md:h-24 md:w-24" aria-hidden="true">
              <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                <Image
                  src="https://framerusercontent.com/images/VNxTg4trlyPkvi55POCdKXQ04kY.png?width=320&height=320"
                  alt=""
                  width={96}
                  height={96}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl space-y-4">
              <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                <span className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '0.1s' }}>Build</span>{' '}
                <span className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '0.2s' }}>A</span>{' '}
                <span className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '0.3s' }}>Verified,</span>{' '}
                <span className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '0.4s' }}>Trusted</span>{' '}
                <br className="hidden md:block" />
                <span className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '0.5s' }}>Workforce</span>{' '}
                <span className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '0.6s' }}>Today</span>
              </h2>

              <p className="mx-auto max-w-2xl text-lg text-gray-300 md:text-xl animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '0.8s' }}>
                Ensure workplace safety and reduce hiring risks with our comprehensive background verification services.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '1s' }}>
                {/* Primary Button */}
                <Link
                  href="/contact"
                  className="group relative flex h-12 items-center justify-center overflow-hidden rounded-xl px-8 py-2 text-white transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                >
                  {/* Blob */}
                  <div
                    className="absolute inset-0 opacity-100 blur-[3px]"
                    style={{
                      background: 'radial-gradient(50% 50%, rgb(255, 255, 255) 52.8846%, rgb(140, 54, 2) 100%)',
                      transformOrigin: '50% 50%',
                    }}
                    aria-hidden="true"
                  />
                  {/* Blur */}
                  <div
                    className="absolute inset-0 opacity-60 blur-[10px]"
                    style={{ backgroundColor: 'rgb(218, 78, 36)' }}
                    aria-hidden="true"
                  />
                  {/* Gradient */}
                  <div
                    className="absolute inset-0 opacity-100"
                    style={{
                      background: 'linear-gradient(163deg, rgb(255, 137, 24) 28%, rgb(162, 41, 4) 54%, rgb(0, 0, 0) 68%, rgb(0, 152, 243) 100%)',
                    }}
                    aria-hidden="true"
                  />
                  {/* Fill */}
                  <div
                    className="absolute inset-[1px] rounded-[11px] bg-black opacity-100 transition-opacity group-hover:opacity-90"
                    aria-hidden="true"
                  />

                  <span className="relative z-10 font-medium">Get Started</span>
                </Link>

                {/* Secondary Button */}
                <Link
                  href="/services"
                  className="group relative flex h-12 items-center justify-center rounded-xl border border-white/20 px-8 py-2 text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                >
                  <span className="font-medium">View Services</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
