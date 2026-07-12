'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Help button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle help"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </motion.button>

      {/* Help panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 right-24 z-40 bg-black/90 border border-white/30 rounded-lg p-6 w-80 backdrop-blur-sm"
          >
            <h3 className="text-white font-light text-lg mb-4">Navigation Guide</h3>

            <div className="space-y-3 text-sm text-white/70">
              <div className="flex gap-3">
                <div className="text-blue-400 min-w-fit">⬆️ ⬇️ Arrows</div>
                <div>Navigate between worlds</div>
              </div>

              <div className="flex gap-3">
                <div className="text-blue-400 min-w-fit">🖱️ Scroll</div>
                <div>Move to next world</div>
              </div>

              <div className="flex gap-3">
                <div className="text-blue-400 min-w-fit">🖱️ Move</div>
                <div>Interact with elements</div>
              </div>

              <div className="flex gap-3">
                <div className="text-blue-400 min-w-fit">👆 Swipe</div>
                <div>Navigate on mobile</div>
              </div>

              <div className="flex gap-3">
                <div className="text-blue-400 min-w-fit">🔘 Dots</div>
                <div>Jump to specific world</div>
              </div>

              <div className="flex gap-3">
                <div className="text-blue-400 min-w-fit">P</div>
                <div>Show FPS monitor</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/50">
                Explore each world. Move your cursor to interact with the environment.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
