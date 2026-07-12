'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SceneIndex, SCENE_CONFIGS } from '@/lib/types';

interface SceneNavigationProps {
  currentScene: SceneIndex;
  onSceneChange: (scene: SceneIndex) => void;
}

export default function SceneNavigation({
  currentScene,
  onSceneChange,
}: SceneNavigationProps) {
  return (
    <>
      {/* Chapter Navigation - Bottom Center */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex gap-3">
        {SCENE_CONFIGS.map((config) => (
          <motion.button
            key={config.id}
            onClick={() => onSceneChange(config.id)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentScene === config.id
                ? 'bg-white w-8 h-2'
                : 'bg-white/30 hover:bg-white/60'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Go to Chapter ${config.chapter}: ${config.name}`}
            aria-current={currentScene === config.id ? 'page' : undefined}
          />
        ))}
      </div>

      {/* Arrow Navigation - Desktop */}
      <div className="fixed left-8 top-1/2 transform -translate-y-1/2 z-50 hidden md:flex flex-col gap-4">
        <motion.button
          onClick={() => onSceneChange(((currentScene - 1 + 5) % 5) as SceneIndex)}
          className="p-2 text-white/50 hover:text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Previous scene"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </motion.button>
      </div>

      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 hidden md:flex flex-col gap-4">
        <motion.button
          onClick={() => onSceneChange(((currentScene + 1) % 5) as SceneIndex)}
          className="p-2 text-white/50 hover:text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Next scene"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </motion.button>
      </div>

      {/* Chapter Label - Top Right */}
      <motion.div
        key={`label-${currentScene}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="fixed top-8 right-8 z-40"
      >
        <div className="text-right">
          <div className="text-xs font-light text-white/40 tracking-widest">
            CHAPTER {SCENE_CONFIGS[currentScene].chapter}
          </div>
          <div className="text-sm font-light text-white/60 tracking-wide mt-1">
            {SCENE_CONFIGS[currentScene].name}
          </div>
        </div>
      </motion.div>

      {/* Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Now on page {currentScene + 1} of 5: {SCENE_CONFIGS[currentScene].headline}
      </div>
    </>
  );
}
