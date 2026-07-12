'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';

const THREAD_COUNT = 200;
const POINTS_PER_THREAD = 32;

interface Thread {
  points: THREE.Vector3[];
  targetPoints: THREE.Vector3[];
  color: THREE.Color;
  id: number;
}

function ThreadForest() {
  const { position: cursorPos, isMouseOver } = useCursorPosition();
  const linesRef = useRef<THREE.LineSegments[]>([]);
  const threadsRef = useRef<Thread[]>([]);
  const timeRef = useRef(0);
  const containerRef = useRef<THREE.Group>(null);

  // Initialize threads
  useEffect(() => {
    const threads: Thread[] = [];

    for (let t = 0; t < THREAD_COUNT; t++) {
      const baseX = (Math.random() - 0.5) * 30;
      const baseZ = (Math.random() - 0.5) * 30;
      const baseY = -8;

      const points: THREE.Vector3[] = [];
      const targetPoints: THREE.Vector3[] = [];

      for (let p = 0; p < POINTS_PER_THREAD; p++) {
        const y = baseY + (p / POINTS_PER_THREAD) * 16;
        const wave = Math.sin((baseX + baseZ + t) * 0.1 + p * 0.3) * 0.5;

        const point = new THREE.Vector3(
          baseX + wave,
          y,
          baseZ + Math.cos((baseX + baseZ + t) * 0.1 + p * 0.3) * 0.5
        );

        points.push(point.clone());
        targetPoints.push(point.clone());
      }

      const colors = [
        new THREE.Color(0x00d9ff),
        new THREE.Color(0x6600ff),
        new THREE.Color(0x00ff88),
        new THREE.Color(0xff00ff),
      ];

      threads.push({
        points,
        targetPoints,
        color: colors[t % colors.length],
        id: t,
      });
    }

    threadsRef.current = threads;
  }, []);

  // Create line meshes
  useEffect(() => {
    if (!containerRef.current) return;

    threadsRef.current.forEach((thread) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(thread.points.length * 3);
      const colors = new Float32Array(thread.points.length * 3);

      thread.points.forEach((point, i) => {
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;

        colors[i * 3] = thread.color.r;
        colors[i * 3 + 1] = thread.color.g;
        colors[i * 3 + 2] = thread.color.b;
      });

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        fog: false,
        linewidth: 1,
      });

      const line = new THREE.LineSegments(geometry, material);
      containerRef.current?.add(line);
      linesRef.current.push(line);
    });

    return () => {
      linesRef.current.forEach((line) => containerRef.current?.remove(line));
    };
  }, []);

  useFrame(() => {
    timeRef.current += 0.016;

    const cursorNorm = new THREE.Vector3(
      (cursorPos.x / window.innerWidth - 0.5) * 30,
      -(cursorPos.y / window.innerHeight - 0.5) * 20,
      0
    );

    threadsRef.current.forEach((thread, threadIdx) => {
      thread.points.forEach((point, pointIdx) => {
        const baseTarget = thread.targetPoints[pointIdx];

        // Apply cursor interaction
        if (isMouseOver) {
          const distToCursor = point.distanceTo(cursorNorm);
          if (distToCursor < 5) {
            const pushback = new THREE.Vector3()
              .subVectors(point, cursorNorm)
              .normalize()
              .multiplyScalar((5 - distToCursor) * 0.2);
            point.add(pushback);
          }
        }

        // Gentle sway
        const sway = Math.sin(
          timeRef.current * 0.5 + threadIdx * 0.1 + pointIdx * 0.2
        ) * 0.3;

        point.x = baseTarget.x + sway;
        point.y = baseTarget.y;
        point.z = baseTarget.z + Math.cos(timeRef.current * 0.6 + threadIdx * 0.1) * 0.2;

        // Smoothly return
        point.lerp(baseTarget, 0.05);
      });

      // Update geometry
      const line = linesRef.current[threadIdx];
      if (line) {
        const positionAttribute = line.geometry.getAttribute('position');
        const positions = positionAttribute.array as Float32Array;

        thread.points.forEach((point, i) => {
          positions[i * 3] = point.x;
          positions[i * 3 + 1] = point.y;
          positions[i * 3 + 2] = point.z;
        });

        positionAttribute.needsUpdate = true;
      }
    });
  });

  return (
    <>
      <perspectiveCamera makeDefault position={[0, 4, 18]} />
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
