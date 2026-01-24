'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Globe, Sparkles } from 'lucide-react';

export default function HeroPromptBar() {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const phrases = [
    'Background Verification (BGV)',
    'Human Resource Management',
    'Talent Acquisition & Recruitment',
    'Payroll Processing & Administration',
    'Business Formation & Regulatory Setup',
    'Startup Support Services',
    'Director Services'
  ];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 100);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, phrases]);

  return (
    <div className="relative w-full max-w-4xl overflow-hidden rounded-[20px] p-[2px]">
      <div 
        className="absolute inset-[-200%] animate-[spin_4s_linear_infinite]" 
        style={{
          background: 'conic-gradient(from 0deg, rgb(159, 78, 0) 0%, rgb(162, 41, 4) 40%, rgb(0, 0, 0) 50%, rgb(0, 152, 243) 60%, rgb(159, 78, 0) 100%)'
        }}
      />

      <div className="relative h-full w-full rounded-[19px] bg-black p-1">
        <div className="rounded-xl bg-black p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm transition-all hover:bg-white/10">
                <Sparkles className="h-4 w-4 text-white/50" />
                <span className="text-sm font-medium text-white/80">Ontriq</span>
                <ChevronDown className="h-4 w-4 text-white" />
              </button>

              <button className="rounded-lg border border-white/10 bg-white/5 p-2 backdrop-blur-sm transition-all hover:bg-white/10">
                <Globe className="h-4 w-4 text-white/50" />
              </button>
            </div>
          </div>

          <div className="mb-4 h-[90px] overflow-hidden rounded-lg border border-white/10 bg-black/50 px-4 py-4 backdrop-blur-sm">
            <p className="text-lg font-medium text-white/80">
              {text}
              <span className="animate-blink">|</span>
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div 
              className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button className="shrink-0 whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/10">
                BGV
              </button>
              <button className="shrink-0 whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/10">
                HR Solutions
              </button>
              <button className="shrink-0 whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/10">
                Payroll
              </button>
            </div>

            <button className="shrink-0 group relative overflow-hidden rounded-lg p-[1px]">
              <div 
                className="absolute inset-0" 
                style={{
                  background: 'linear-gradient(163deg, rgb(255, 137, 24) 28%, rgb(162, 41, 4) 54%, rgb(0, 0, 0) 68%, rgb(0, 152, 243) 100%)'
                }}
              />
              <div className="absolute inset-0 bg-orange-500 opacity-60 blur-md" />
              <div className="relative flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 transition-all group-hover:bg-black/90">
                <img
                  src="https://framerusercontent.com/images/sVkwweGRCRcQUW2eM3O9WXUNw4w.png"
                  alt="Send"
                  className="h-5 w-5"
                />
                <span className="hidden sm:inline text-sm font-medium text-white">Send</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
