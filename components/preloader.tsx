'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PreloaderProps = {
  onDone?: () => void;
};

const text = "Welcome to Your Complete Workforce and Business Partner";
const HERO_VIDEO_URL = "https://framerusercontent.com/assets/Bax1SXv4b9QI33bMvkicABKnI.mp4";

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // 1. Minimum animation time (typing + hold)
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3500);

    // 2. Preload the video
    const params = {
      videoSrc: HERO_VIDEO_URL,
    };
    
    // Create a hidden video element to force preload
    const video = document.createElement('video');
    video.src = params.videoSrc;
    video.preload = 'metadata'; // Changed from 'auto' to reduce initial load
    
    // "canplaythrough" or "canplay" is usually enough for smooth playback start
    const onVideoReady = () => {
      setVideoLoaded(true);
    };
    
    // Sometimes 'canplaythrough' doesn't fire on mobile if data saver is on, 
    // or if the browser decides not to buffer.  
    video.addEventListener('canplaythrough', onVideoReady);
    video.addEventListener('canplay', onVideoReady);
    
    // Start loading
    video.load();

    // Fallback: If video takes too long, just proceed after 5 seconds max (reduced from 7)
    const maxWait = setTimeout(() => {
      setVideoLoaded(true);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(maxWait);
      video.removeEventListener('canplaythrough', onVideoReady);
      video.removeEventListener('canplay', onVideoReady);
      video.remove(); // Cleanup
    };
  }, []);

  // When both conditions are met, dismiss
  useEffect(() => {
    if (minTimeElapsed && videoLoaded) {
       setIsVisible(false);
    }
  }, [minTimeElapsed, videoLoaded]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="preloader"
          initial={{ clipPath: "circle(150% at 50% 50%)" }}
          exit={{ 
            clipPath: "circle(0% at 50% 50%)",
            transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground px-4"
        >
          <div className="flex flex-col items-center gap-8 text-center">
            <motion.h1
              className="text-3xl md:text-5xl font-bold tracking-tighter max-w-5xl leading-tight"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
            >
              {text.split("").map((char, index) => (
                <motion.span key={index} variants={letterVariants}>
                  {char}
                </motion.span>
              ))}
            </motion.h1>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
