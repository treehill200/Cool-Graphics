'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';
import { usePointerImpulse } from '@/hooks/usePointerImpulse';
import SceneCanvas from '@/components/SceneCanvas';
import AnimatedHeadline from '@/components/AnimatedHeadline';

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

const SPARK_COUNT = 600;

function ThreadForest() {
  const { position: cursorPos, isMouseOver } = useCursorPosition();
  const { impulseRef } = usePointerImpulse();
  const threadsRef = useRef<Thread[]>([]);
  const timeRef = useRef(0);
  const containerRef = useRef<THREE.Group>(null);
  const sparksRef = useRef<THREE.Points>(null);

  // Floating firefly sparks drifting between the strands
  const sparkGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(SPARK_COUNT * 3);
    const colors = new Float32Array(SPARK_COUNT * 3);
    const palette = ['#00ffdd', '#39ff14', '#00d9ff', '#ff00ff', '#8844ff'].map(
      (h) => new THREE.Color(h)
    );
    for (let i = 0; i < SPARK_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  useEffect(() => {
    return () => sparkGeometry.dispose();
  }, [sparkGeometry]);

  // Initialize threads
  useEffect(() => {
    if (!containerRef.current) return;

    // Fewer strands on small screens to hold 60fps
    const threadCount = window.innerWidth < 768 ? 120 : THREAD_COUNT;
    const threads: Thread[] = [];

    const colors = [
      0x00d9ff,
      0x6600ff,
      0x00ff88,
      0xff00ff,
      0x00ffdd,
      0x8844ff,
    ];

    for (let t = 0; t < threadCount; t++) {
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
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        fog: false,
        linewidth: 2,
      });

      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false;
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

  useFrame((state) => {
    timeRef.current += 0.016;

    const cursorNorm = new THREE.Vector3(
      (cursorPos.x / window.innerWidth - 0.5) * 35,
      -(cursorPos.y / window.innerHeight - 0.5) * 25,
      0
    );

    // Cursor parallax plus idle drift
    const drift = state.clock.elapsedTime;
    const nx = cursorPos.x / window.innerWidth - 0.5;
    const ny = cursorPos.y / window.innerHeight - 0.5;
    state.camera.position.x += (nx * 3 + Math.sin(drift * 0.07) * 1.6 - state.camera.position.x) * 0.03;
    state.camera.position.y += (4 - ny * 2 + Math.cos(drift * 0.1) * 0.7 - state.camera.position.y) * 0.03;
    state.camera.lookAt(0, 2, 0);

    // Click pulse: an expanding ring of displacement travels through the forest
    let pulseVec: THREE.Vector3 | null = null;
    let pulseRadius = 0;
    let pulseStrength = 0;
    const imp = impulseRef.current;
    if (imp) {
      const age = (performance.now() - imp.time) / 1000;
      if (age < 2.2) {
        pulseVec = new THREE.Vector3(
          (imp.x / window.innerWidth - 0.5) * 35,
          -(imp.y / window.innerHeight - 0.5) * 25,
          0
        );
        pulseRadius = age * 16;
        pulseStrength = 1 - age / 2.2;
      } else {
        impulseRef.current = null;
      }
    }

    threadsRef.current.forEach((thread, threadIdx) => {
      const positionAttribute = thread.geometry.getAttribute('position');
      const positions = positionAttribute.array as Float32Array;

      thread.points.forEach((point, pointIdx) => {
        const basePoint = thread.basePoints[pointIdx];

        // Organic sway (absolute position each frame, so effects stack after it)
        const swayX = Math.sin(timeRef.current * 0.4 + threadIdx * 0.15 + pointIdx * 0.2) * 0.4;
        const swayZ = Math.cos(timeRef.current * 0.5 + threadIdx * 0.12 + pointIdx * 0.25) * 0.35;

        point.x = basePoint.x + swayX;
        point.y = basePoint.y;
        point.z = basePoint.z + swayZ;

        // Cursor pushes strands aside
        if (isMouseOver) {
          const distToCursor = point.distanceTo(cursorNorm);
          if (distToCursor < 6) {
            const push = new THREE.Vector3()
              .subVectors(point, cursorNorm)
              .normalize()
              .multiplyScalar((6 - distToCursor) * 0.35);
            point.add(push);
          }
        }

        // Traveling pulse ring displaces strands as it passes
        if (pulseVec) {
          const distToPulse = point.distanceTo(pulseVec);
          const ring =
            Math.exp(-((distToPulse - pulseRadius) ** 2) * 0.2) * pulseStrength;
          if (ring > 0.001) {
            const dir = new THREE.Vector3().subVectors(point, pulseVec).normalize();
            point.addScaledVector(dir, ring * 2.4);
          }
        }

        positions[pointIdx * 3] = point.x;
        positions[pointIdx * 3 + 1] = point.y;
        positions[pointIdx * 3 + 2] = point.z;
      });

      positionAttribute.needsUpdate = true;
    });

    if (sparksRef.current) {
      sparksRef.current.rotation.y += 0.0006;
      sparksRef.current.position.y = Math.sin(timeRef.current * 0.25) * 1.2;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 18]} />

      <group ref={containerRef} />

      <points ref={sparksRef} geometry={sparkGeometry} frustumCulled={false}>
        <pointsMaterial
          size={0.22}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
          toneMapped={false}
        />
      </points>
    </>
  );
}

export default function ThreadForestScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="w-full h-full relative"
      style={{ background: 'radial-gradient(ellipse at 50% 70%, #042f22 0%, #01130e 55%, #000000 100%)' }}
      role="region"
      aria-label="Bioluminescent Thread Forest Scene"
    >
      {mounted && (
        <SceneCanvas>
          <ThreadForest />
        </SceneCanvas>
      )}

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <AnimatedHeadline
          text="EVERYTHING IS CONNECTED"
          subtitle="One signal travels farther than the hand that created it."
          accent="#39ff14"
        />
      </div>
    </div>
  );
}
