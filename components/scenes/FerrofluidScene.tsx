'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';
import SceneCanvas from '@/components/SceneCanvas';

function FerrofluidMesh() {
  const { position: cursorPos, isMouseOver } = useCursorPosition();
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const originalPositionsRef = useRef<Float32Array | null>(null);

  // One geometry shared by the solid blob and its neon wireframe skin,
  // so the deformation drives both
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(4, 7), []);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame(() => {
    if (!groupRef.current) return;

    timeRef.current += 0.016;

    const positionAttribute = geometry.getAttribute('position');
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
    geometry.computeVertexNormals();

    // Gentle rotation
    groupRef.current.rotation.x += 0.0003;
    groupRef.current.rotation.z += 0.0002;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 14]} fov={50} />
      <pointLight position={[12, 12, 12]} intensity={250} color="#ff00ff" />
      <pointLight position={[-10, -10, 8]} intensity={200} color="#00ffff" />
      <pointLight position={[0, 12, -8]} intensity={150} color="#7d2fff" />
      <ambientLight intensity={0.5} />

      <group ref={groupRef}>
        {/* Liquid metal core */}
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color="#0a0a1e"
            emissive="#3a0a8a"
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>

        {/* Electric neon wireframe skin */}
        <mesh geometry={geometry} scale={1.004}>
          <meshBasicMaterial
            color="#00eaff"
            toneMapped={false}
            wireframe
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
}

export default function FerrofluidScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="w-full h-full relative"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #1a0533 0%, #05011a 55%, #000000 100%)' }}
      role="region"
      aria-label="Magnetic Ferrofluid Scene"
    >
      {mounted && (
        <SceneCanvas>
          <FerrofluidMesh />
        </SceneCanvas>
      )}

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1
          className="text-5xl md:text-6xl font-light text-white tracking-widest text-center"
          style={{ textShadow: '0 0 18px rgba(125,47,255,0.95), 0 0 60px rgba(0,234,255,0.55), 0 0 120px rgba(255,0,255,0.45)' }}
        >
          INVISIBLE FORCES
        </h1>
        <p className="text-sm md:text-base text-white/60 mt-8 tracking-wide max-w-md text-center">
          You cannot see what moves it. You can only see what it becomes.
        </p>
      </div>
    </div>
  );
}
