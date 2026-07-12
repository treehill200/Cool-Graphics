'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFrame = (currentTime: number) => {
      frameCount++;
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measureFrame);
    };

    animationId = requestAnimationFrame(measureFrame);

    // Toggle visibility with 'P' key
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const getColor = () => {
    if (fps >= 50) return '#00ff00';
    if (fps >= 30) return '#ffff00';
    return '#ff0000';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-20 left-8 z-50 bg-black/80 border border-white/20 rounded px-3 py-2 backdrop-blur-sm pointer-events-none"
      style={{ display: isVisible ? 'block' : 'none' }}
    >
      <div className="text-xs font-mono text-white/80 whitespace-nowrap">
        <div style={{ color: getColor() }}>
          FPS: <span className="font-bold">{fps}</span>
        </div>
        <div className="text-white/50 text-xs mt-1">Press P to toggle</div>
      </div>
    </motion.div>
  );
}
