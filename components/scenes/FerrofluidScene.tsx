'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';

function FerrofluidMesh() {
  const { position: cursorPos } = useCursorPosition();
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.IcosahedronGeometry>(null);
  const timeRef = useRef(0);
  const { camera } = useThree();

  useFrame(() => {
    if (!meshRef.current || !geometryRef.current) return;

    timeRef.current += 0.016;

    // Update vertices with magnetic effect
    const positionAttribute = geometryRef.current.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    const originalPositions = geometryRef.current.attributes.position.array as Float32Array;

    const cursorNorm = new THREE.Vector3(
      (cursorPos.x / window.innerWidth - 0.5) * 20,
      -(cursorPos.y / window.innerHeight - 0.5) * 20,
      0
    );

    for (let i = 0; i < positions.length; i += 3) {
      const x = originalPositions[i];
      const y = originalPositions[i + 1];
      const z = originalPositions[i + 2];

      const vertex = new THREE.Vector3(x, y, z);
      const distToCursor = vertex.distanceTo(cursorNorm);

      let px = x;
      let py = y;
      let pz = z;

      // Magnetic spike effect
      if (distToCursor < 8) {
        const magneticForce = (8 - distToCursor) * 0.4;
        const direction = new THREE.Vector3()
          .subVectors(vertex, cursorNorm)
          .normalize();

        px += direction.x * magneticForce;
        py += direction.y * magneticForce;
        pz += direction.z * magneticForce;
      }

      // Wave animation
      const waveAmount = Math.sin(timeRef.current * 0.8 + vertex.length() * 10) * 0.5;
      const angle = Math.atan2(vertex.y, vertex.x);
      const radius = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y + vertex.z * vertex.z);

      px += Math.cos(angle) * waveAmount;
      py += Math.sin(angle) * waveAmount;
      pz += Math.sin(timeRef.current * 0.5 + angle) * 0.2;

      positions[i] = px;
      positions[i + 1] = py;
      positions[i + 2] = pz;
    }

    positionAttribute.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
  });

  return (
    <>
      <perspectiveCamera makeDefault position={[0, 0, 8]} />
      <pointLight position={[10, 10, 10]} intensity={0.4} />
      <pointLight position={[-8, -8, 6]} intensity={0.2} color="#0066ff" />

      <mesh ref={meshRef}>
        <icosahedronGeometry ref={geometryRef} args={[4, 6]} />
        <meshStandardMaterial
          color="#0a0a12"
          emissive="#1a2a4a"
          emissiveIntensity={0.4}
          metalness={0.95}
          roughness={0.02}
          envMapIntensity={1}
        />
      </mesh>

      <fog attach="fog" args={['#000000', 3, 30]} />
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
