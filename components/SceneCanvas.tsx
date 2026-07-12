'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Bloom from './Bloom';

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

function WebGLFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-black to-purple-950/30">
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-md text-center px-6">
        <p className="text-white/40 text-xs tracking-widest leading-relaxed">
          3D GRAPHICS UNAVAILABLE — YOUR BROWSER COULD NOT CREATE A WEBGL
          CONTEXT. ENABLE HARDWARE ACCELERATION (BROWSER SETTINGS → SYSTEM) AND
          RELOAD TO SEE THE FULL EXPERIENCE.
        </p>
      </div>
    </div>
  );
}

interface BoundaryProps {
  children: React.ReactNode;
}

class CanvasErrorBoundary extends React.Component<BoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <WebGLFallback />;
    return this.props.children;
  }
}

export default function SceneCanvas({ children }: { children: React.ReactNode }) {
  // null = not yet checked (also covers SSR), so we never render Canvas on the server
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglAvailable(detectWebGL());
  }, []);

  if (webglAvailable === null) return null;
  if (!webglAvailable) return <WebGLFallback />;

  return (
    <CanvasErrorBoundary>
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        }}
      >
        {children}
        <Bloom />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
