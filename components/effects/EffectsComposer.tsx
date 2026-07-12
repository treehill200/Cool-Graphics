'use client';

import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function useBloomEffect() {
  const { gl, scene, camera } = useThree();
  const composerRef = useRef<any>(null);

  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render();
    } else {
      gl.render(scene, camera);
    }
  });

  return composerRef;
}

// Enhanced lighting setup for all scenes
export function EnhancedLighting() {
  return (
    <>
      {/* Main light */}
      <pointLight position={[20, 20, 20]} intensity={1} color="#ffffff" />

      {/* Fill lights */}
      <pointLight position={[-20, 10, -20]} intensity={0.6} color="#4488ff" />
      <pointLight position={[10, -15, 15]} intensity={0.4} color="#ff44ff" />

      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.2} color="#ffffff" />

      {/* Rim light */}
      <directionalLight position={[0, 1, 1]} intensity={0.3} />
    </>
  );
}

// Glow layer for highlights
export function GlowLayer() {
  return (
    <>
      <fog attach="fog" args={['#000000', 5, 100]} />
    </>
  );
}
