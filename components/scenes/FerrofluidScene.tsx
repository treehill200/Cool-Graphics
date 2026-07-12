'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';

function FerrofluidMesh() {
  const { position: cursorPos, isMouseOver } = useCursorPosition();
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.IcosahedronGeometry>(null);
  const timeRef = useRef(0);
  const originalPositionsRef = useRef<Float32Array | null>(null);

  useFrame(() => {
    if (!meshRef.current || !geometryRef.current) return;

    timeRef.current += 0.016;

    const positionAttribute = geometryRef.current.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;

    // Store original positions on first frame
    if (!originalPositionsRef.current) {
      originalPositionsRef.current = new Float32Array(positions);
    }

    const originalPositions = originalPositionsRef.current;

    const cursorNorm = new THREE.Vector3(
      (cursorPos.x / window.innerWidth - 0.5) * 18,
      -(cursorPos.y / window.innerHeight - 0.5) * 18,
      0
    );

    for (let i = 0; i < positions.length; i += 3) {
      const ox = originalPositions[i];
      const oy = originalPositions[i + 1];
      const oz = originalPositions[i + 2];

      const vertex = new THREE.Vector3(ox, oy, oz);
      const distToCursor = vertex.distanceTo(cursorNorm);

      let px = ox;
      let py = oy;
      let pz = oz;

      // Magnetic spike effect (stronger when mouse is over)
      if (isMouseOver && distToCursor < 7) {
        const magneticForce = (7 - distToCursor) * 0.5;
        const direction = new THREE.Vector3()
          .subVectors(vertex, cursorNorm)
          .normalize();

        px += direction.x * magneticForce;
        py += direction.y * magneticForce;
        pz += direction.z * magneticForce;
      }

      // Organic wave animation
      const vertexLength = Math.sqrt(ox * ox + oy * oy + oz * oz);
      const waveAmount = Math.sin(timeRef.current * 0.6 + vertexLength * 3) * 0.4;
      const angle = Math.atan2(oy, ox);

      px += Math.cos(angle) * waveAmount * 0.5;
      py += Math.sin(angle) * waveAmount * 0.5;
      pz += Math.sin(timeRef.current * 0.4 + angle) * 0.3;

      // Smooth deformation
      px = ox + (px - ox) * 0.7;
      py = oy + (py - oy) * 0.7;
      pz = oz + (pz - oz) * 0.7;

      positions[i] = px;
      positions[i + 1] = py;
      positions[i + 2] = pz;
    }

    positionAttribute.needsUpdate = true;
    geometryRef.current.computeVertexNormals();

    // Gentle rotation
    meshRef.current.rotation.x += 0.0003;
    meshRef.current.rotation.z += 0.0002;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      <pointLight position={[12, 12, 12]} intensity={0.5} />
      <pointLight position={[-10, -10, 8]} intensity={0.3} color="#0055ff" />
      <ambientLight intensity={0.15} />

      <mesh ref={meshRef}>
        <icosahedronGeometry ref={geometryRef} args={[4, 7]} />
        <meshStandardMaterial
          color="#050510"
          emissive="#1a3a5a"
          emissiveIntensity={0.3}
          metalness={0.98}
          roughness={0.01}
          wireframe={false}
        />
      </mesh>

      <fog attach="fog" args={['#000000', 3, 50]} />
    </>
  );
}

export default function FerrofluidScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full bg-black relative" role="region" aria-label="Magnetic Ferrofluid Scene">
      {mounted && (
        <Canvas
          dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <FerrofluidMesh />
        </Canvas>
      )}

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-5xl md:text-6xl font-light text-white tracking-widest text-center">
          INVISIBLE FORCES
        </h1>
        <p className="text-sm md:text-base text-white/60 mt-8 tracking-wide max-w-md text-center">
          You cannot see what moves it. You can only see what it becomes.
        </p>
      </div>
    </div>
  );
}
