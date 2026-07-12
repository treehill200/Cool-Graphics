'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedHeadlineProps {
  text: string;
  subtitle?: string;
  accent: string;
}

/**
 * Headline that materializes letter by letter — each character rises out of
 * a blur with a stagger, then the subtitle fades in underneath. Word-level
 * wrapping is preserved by keeping each word in a no-wrap span.
 */
export default function AnimatedHeadline({ text, subtitle, accent }: AnimatedHeadlineProps) {
  const words = text.split(' ');
  const totalLetters = text.replace(/ /g, '').length;
  let letterIndex = 0;

  const glow = `0 0 18px ${accent}e6, 0 0 60px ${accent}88, 0 0 120px ${accent}44`;

  return (
    <div className="text-center px-4">
      <h1
        className="text-5xl md:text-6xl font-light text-white tracking-widest"
        style={{ textShadow: glow }}
        aria-label={text}
      >
        {words.map((word, wi) => (
          <span key={wi} aria-hidden className="inline-block whitespace-nowrap mx-[0.18em]">
            {word.split('').map((ch, ci) => {
              const idx = letterIndex++;
              return (
                <motion.span
                  key={ci}
                  className="inline-block"
                  initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.7,
                    delay: 0.35 + idx * 0.03,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
        ))}
      </h1>

      {subtitle && (
        <motion.p
          className="text-sm md:text-base text-white/60 mt-8 tracking-wide max-w-md mx-auto"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.5 + totalLetters * 0.03,
            ease: 'easeOut',
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
