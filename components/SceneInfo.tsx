'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SceneIndex, SCENE_CONFIGS } from '@/lib/types';

interface SceneInfoProps {
  currentScene: SceneIndex;
}

const SCENE_DETAILS = {
  0: {
    objects: '150+ drones',
    particles: '3D formations',
    tech: 'Instanced meshes',
  },
  1: {
    objects: '10,000+ particles',
    particles: 'Reflective glitter',
    tech: 'Physics simulation',
  },
  2: {
    objects: '1 deformable mesh',
    particles: 'Liquid surface',
    tech: 'Vertex deformation',
  },
  3: {
    objects: '200+ strands',
    particles: '6,000+ line segments',
    tech: 'Line rendering',
  },
  4: {
    objects: '20+ glass elements',
    particles: 'Floating architecture',
    tech: 'Complex geometry',
  },
};

export default function SceneInfo({ currentScene }: SceneInfoProps) {
  const config = SCENE_CONFIGS[currentScene];
  const details = SCENE_DETAILS[currentScene as keyof typeof SCENE_DETAILS];

  return (
    <motion.div
      key={`scene-info-${currentScene}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="fixed top-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none"
    >
      <div className="text-center">
        <motion.div
          className="text-xs font-light text-white/40 tracking-widest mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          CHAPTER {config.chapter} • {config.name.toUpperCase()}
        </motion.div>

        <motion.h2
          className="text-2xl md:text-3xl font-light text-white tracking-widest mb-2"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {config.headline}
        </motion.h2>

        <motion.div
          className="hidden md:flex justify-center gap-6 text-xs text-white/40 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col items-center">
            <div className="text-white/60 mb-1">{details.objects}</div>
            <div>Objects</div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <div className="text-white/60 mb-1">{details.particles}</div>
            <div>Elements</div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <div className="text-white/60 mb-1">{details.tech}</div>
            <div>Technique</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
