'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';
import SceneCanvas from '@/components/SceneCanvas';

interface ArchElement {
  mesh: THREE.Mesh;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
}

function GlassArchitecture() {
  const { position: cursorPos } = useCursorPosition();
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const elementsRef = useRef<ArchElement[]>([]);

  // Create glass elements
  useEffect(() => {
    if (!groupRef.current) return;

    elementsRef.current = [];

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.12,
      metalness: 0.95,
      roughness: 0.03,
      envMapIntensity: 1,
      side: THREE.DoubleSide,
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: '#88ccff',
      transparent: true,
      opacity: 0.25,
      metalness: 0.85,
      roughness: 0.1,
      emissive: '#0088ff',
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide,
    });

    // Central sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(3, 5);
    const sphere = new THREE.Mesh(sphereGeometry, glassMaterial.clone());
    groupRef.current.add(sphere);
    elementsRef.current.push({
      mesh: sphere,
      basePosition: new THREE.Vector3(0, 0, 0),
      baseRotation: new THREE.Euler(0, 0, 0),
    });

    // Floating platforms
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 9;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 4;

      const platformGeometry = new THREE.BoxGeometry(2.5, 0.25, 3);
      const platform = new THREE.Mesh(platformGeometry, glassMaterial.clone());
      platform.position.set(x, y, z);
      platform.rotation.y = angle;
      groupRef.current.add(platform);
      elementsRef.current.push({
        mesh: platform,
        basePosition: new THREE.Vector3(x, y, z),
        baseRotation: new THREE.Euler(0, angle, 0),
      });
    }

    // Floating rings
    for (let i = 0; i < 5; i++) {
      const scale = 1 + i * 0.6;
      const ringGeometry = new THREE.TorusGeometry(4 * scale, 0.18, 32, 200);
      const ring = new THREE.Mesh(ringGeometry, edgeMaterial.clone());
      ring.rotation.x = Math.PI / 3 + i * 0.25;
      ring.rotation.y = i * Math.PI / 5;
      groupRef.current.add(ring);
      elementsRef.current.push({
        mesh: ring,
        basePosition: new THREE.Vector3(0, 0, 0),
        baseRotation: ring.rotation.clone(),
      });
    }

    // Floating lenses
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const lensGeometry = new THREE.IcosahedronGeometry(1.5, 4);
      const lens = new THREE.Mesh(lensGeometry, edgeMaterial.clone());
      lens.position.set(
        Math.cos(angle) * 11,
        Math.sin(angle * 0.6) * 7,
        Math.cos(angle * 0.7) * 8
      );
      groupRef.current.add(lens);
      elementsRef.current.push({
        mesh: lens,
        basePosition: lens.position.clone(),
        baseRotation: lens.rotation.clone(),
      });
    }
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    timeRef.current += 0.016;

    // Rotate entire structure smoothly
    groupRef.current.rotation.x += 0.00015;
    groupRef.current.rotation.y += 0.0003;
    groupRef.current.rotation.z += 0.00005;

    // Animate individual elements
    elementsRef.current.forEach((element, idx) => {
      const mesh = element.mesh;
      const basePos = element.basePosition;

      // Gentle orbital motion and bobbing
      const offset = Math.sin(timeRef.current * 0.3 + idx * 0.4) * 0.15;
      mesh.position.y = basePos.y + offset;

      // Subtle rotation
      mesh.rotation.x += 0.00015;
      mesh.rotation.y += 0.00025;
      mesh.rotation.z += 0.0001;

      // Pulsating glow
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.emissive) {
        const glow = Math.sin(timeRef.current * 0.7 + idx * 0.6) * 0.15 + 0.1;
        const hue = (0.55 + idx * 0.05) % 1;
        (mat.emissive as THREE.Color).setHSL(hue, 0.8, Math.max(0.02, glow));
        mat.emissiveIntensity = Math.sin(timeRef.current * 0.8 + idx) * 0.2 + 0.2;
      }
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 25]} fov={45} />
      <ambientLight intensity={0.3} />
      <pointLight position={[18, 18, 18]} intensity={0.7} color="#ffffff" />
      <pointLight position={[-15, 12, -15]} intensity={0.5} color="#00ffdd" />
      <pointLight position={[10, -12, 10]} intensity={0.3} color="#ff00ff" />

      <group ref={groupRef} />

      <fog attach="fog" args={['#000000', 8, 80]} />
    </>
  );
}

export default function GlassObservatoryScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full bg-black relative" role="region" aria-label="Glass Observatory Scene">
      {mounted && (
        <SceneCanvas>
          <GlassArchitecture />
        </SceneCanvas>
      )}

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-5xl md:text-6xl font-light text-white tracking-widest text-center">
          YOU HAVE REACHED THE OTHER SIDE
        </h1>
        <p className="text-sm md:text-base text-white/60 mt-8 tracking-wide max-w-md text-center">
          Five worlds. One continuous transformation.
        </p>
      </div>

      {/* Reset button */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => window.scrollTo(0, 0)}
          className="px-6 py-2 text-xs tracking-widest text-white/60 border border-white/30 hover:border-white/60 hover:text-white transition-all duration-300"
          aria-label="Return to the beginning"
        >
          BEGIN AGAIN
        </button>
      </div>
    </div>
  );
}
