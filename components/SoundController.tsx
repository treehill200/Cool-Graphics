'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

export default function SoundController() {
  const { soundEnabled, setSoundEnabled } = useStore();
  const [showVolume, setShowVolume] = useState(false);

  return (
    <div className="fixed top-8 left-8 z-50">
      <motion.button
        onClick={() => setSoundEnabled(!soundEnabled)}
        onHoverStart={() => setShowVolume(true)}
        onHoverEnd={() => setShowVolume(false)}
        className={`p-2 transition-colors ${
          soundEnabled ? 'text-white' : 'text-white/40'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
        aria-pressed={soundEnabled}
      >
        <AnimatePresence>
          {soundEnabled ? (
            <motion.svg
              key="sound-on"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sound-off"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M16.6 15.6L13.4 12.4l3.2-3.2c.2-.2.2-.5 0-.7-.2-.2-.5-.2-.7 0L12.7 11.7 9.5 8.5c-.2-.2-.5-.2-.7 0-.2.2-.2.5 0 .7l3.2 3.2-3.2 3.2c-.2.2-.2.5 0 .7.1.1.2.1.35.1.15 0 .25 0 .35-.1l3.2-3.2 3.2 3.2c.1.1.2.1.35.1.15 0 .25 0 .35-.1.2-.2.2-.5 0-.7z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
