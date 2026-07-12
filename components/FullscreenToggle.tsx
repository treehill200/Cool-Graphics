'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {
            // Fullscreen not available
          });
          setIsFullscreen(true);
        } else {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyPress);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <motion.button
      onClick={() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {
            // Fullscreen not available
          });
          setIsFullscreen(true);
        } else {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }}
      className="fixed top-8 right-24 z-40 p-2 text-white/50 hover:text-white transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title="Press F for fullscreen"
      aria-label="Toggle fullscreen"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {isFullscreen ? (
          <>
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </>
        ) : (
          <>
            <path d="M8 3v4m0 4v4M3 8h4m4 0h4M16 3v4m0 4v4m5-8h-4m-4 0h-4M8 16v4m0-4v4m8 0v-4" />
            <path d="M3 3l6 0v6M21 3l-6 0v6M3 21l6 0v-6M21 21l-6 0v-6" strokeLinecap="round" />
          </>
        )}
      </svg>
    </motion.button>
  );
}
