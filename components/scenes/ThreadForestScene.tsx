'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';

const THREAD_COUNT = 250;
const POINTS_PER_THREAD = 40;

interface Thread {
  points: THREE.Vector3[];
  basePoints: THREE.Vector3[];
  color: THREE.Color;
  id: number;
  geometry: THREE.BufferGeometry;
  line: THREE.Line;
}

function ThreadForest() {
  const { position: cursorPos, isMouseOver } = useCursorPosition();
  const threadsRef = useRef<Thread[]>([]);
  const timeRef = useRef(0);
  const containerRef = useRef<THREE.Group>(null);

  // Initialize threads
  useEffect(() => {
    if (!containerRef.current) return;

    const threads: Thread[] = [];

    const colors = [
      0x00d9ff,
      0x6600ff,
      0x00ff88,
      0xff00ff,
      0x00ffdd,
      0x8844ff,
    ];

    for (let t = 0; t < THREAD_COUNT; t++) {
      const baseX = (Math.random() - 0.5) * 35;
      const baseZ = (Math.random() - 0.5) * 35;
      const baseY = -10;

      const points: THREE.Vector3[] = [];
      const basePoints: THREE.Vector3[] = [];

      for (let p = 0; p < POINTS_PER_THREAD; p++) {
        const y = baseY + (p / POINTS_PER_THREAD) * 20;
        const angle = (baseX + baseZ + t) * 0.05 + p * 0.25;
        const waveAmount = Math.sin(angle) * 0.6;

        const point = new THREE.Vector3(
          baseX + waveAmount,
          y,
          baseZ + Math.cos(angle) * 0.6
        );

        points.push(point.clone());
        basePoints.push(point.clone());
      }

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(points.length * 3);
      const colors_array = new Float32Array(points.length * 3);

      points.forEach((point, i) => {
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;

        const c = new THREE.Color(colors[t % colors.length]);
        colors_array[i * 3] = c.r;
        colors_array[i * 3 + 1] = c.g;
        colors_array[i * 3 + 2] = c.b;
      });

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors_array, 3));

      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        fog: false,
        linewidth: 2,
      });

      const line = new THREE.Line(geometry, material);
      containerRef.current.add(line);

      threads.push({
        points,
        basePoints,
        color: new THREE.Color(colors[t % colors.length]),
        id: t,
        geometry,
        line,
      });
    }

    threadsRef.current = threads;

    return () => {
      threads.forEach((t) => containerRef.current?.remove(t.line));
    };
  }, []);

  useFrame(() => {
    timeRef.current += 0.016;

    const cursorNorm = new THREE.Vector3(
      (cursorPos.x / window.innerWidth - 0.5) * 35,
      -(cursorPos.y / window.innerHeight - 0.5) * 25,
      0
    );

    threadsRef.current.forEach((thread, threadIdx) => {
      const positionAttribute = thread.geometry.getAttribute('position');
      const positions = positionAttribute.array as Float32Array;

      thread.points.forEach((point, pointIdx) => {
        const basePoint = thread.basePoints[pointIdx];

        // Cursor interaction
        if (isMouseOver) {
          const distToCursor = point.distanceTo(cursorNorm);
          if (distToCursor < 6) {
            const push = new THREE.Vector3()
              .subVectors(point, cursorNorm)
              .normalize()
              .multiplyScalar((6 - distToCursor) * 0.22);
            point.add(push);
          }
        }

        // Organic sway
        const swayX = Math.sin(timeRef.current * 0.4 + threadIdx * 0.15 + pointIdx * 0.2) * 0.4;
        const swayZ = Math.cos(timeRef.current * 0.5 + threadIdx * 0.12 + pointIdx * 0.25) * 0.35;

        point.x = basePoint.x + swayX;
        point.y = basePoint.y;
        point.z = basePoint.z + swayZ;

        // Smooth return to base with damping
        point.lerp(basePoint, 0.08);

        positions[pointIdx * 3] = point.x;
        positions[pointIdx * 3 + 1] = point.y;
        positions[pointIdx * 3 + 2] = point.z;
      });

      positionAttribute.needsUpdate = true;
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 18]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 15]} intensity={0.8} color="#00d9ff" />
      <pointLight position={[-10, 5, -10]} intensity={0.4} color="#6600ff" />

      <group ref={containerRef} />

      <fog attach="fog" args={['#000000', 5, 50]} />
    </>
  );
}

export default function ThreadForestScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full bg-black relative" role="region" aria-label="Bioluminescent Thread Forest Scene">
      {mounted && (
        <Canvas
          dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <ThreadForest />
        </Canvas>
      )}

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-5xl md:text-6xl font-light text-white tracking-widest text-center">
          EVERYTHING IS CONNECTED
        </h1>
        <p className="text-sm md:text-base text-white/60 mt-8 tracking-wide max-w-md text-center">
          One signal travels farther than the hand that created it.
        </p>
      </div>
    </div>
  );
}
