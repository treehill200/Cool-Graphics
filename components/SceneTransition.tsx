'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SceneTransitionProps {
  isActive: boolean;
  direction: 'forward' | 'backward';
}

export default function SceneTransition({ isActive, direction }: SceneTransitionProps) {
  return (
    <>
      {/* Transition overlay */}
      <motion.div
        className="fixed inset-0 bg-black pointer-events-none z-40"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isActive ? 1 : 0,
        }}
        transition={{
          duration: 0.4,
          ease: 'easeInOut',
        }}
      />

      {/* Light streaks */}
      {isActive && (
        <>
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                transform: direction === 'forward' ? 'translateX(-100%)' : 'translateX(100%)',
              }}
            />
          </motion.div>

          {/* Particle burst effect */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="fixed w-1 h-1 bg-white rounded-full pointer-events-none z-40"
              initial={{
                x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
                y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
                opacity: 1,
              }}
              animate={{
                x:
                  typeof window !== 'undefined'
                    ? window.innerWidth / 2 + Math.cos((i / 12) * Math.PI * 2) * 200
                    : 0,
                y:
                  typeof window !== 'undefined'
                    ? window.innerHeight / 2 + Math.sin((i / 12) * Math.PI * 2) * 200
                    : 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}
    </>
  );
}
