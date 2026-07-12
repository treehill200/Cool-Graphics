'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';
import { usePointerImpulse } from '@/hooks/usePointerImpulse';
import SceneCanvas from '@/components/SceneCanvas';

interface ArchElement {
  mesh: THREE.Mesh;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
}

function GlassArchitecture() {
  const { position: cursorPos } = useCursorPosition();
  const { impulseRef } = usePointerImpulse();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const spinBoostRef = useRef(0);
  const flareRef = useRef(0);
  const elementsRef = useRef<ArchElement[]>([]);

  // Create glass elements
  useEffect(() => {
    if (!groupRef.current) return;

    elementsRef.current = [];

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: '#aaddff',
      transparent: true,
      opacity: 0.28,
      metalness: 0.6,
      roughness: 0.05,
      emissive: '#2266ff',
      emissiveIntensity: 0.6,
      envMapIntensity: 1,
      side: THREE.DoubleSide,
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: '#88ccff',
      transparent: true,
      opacity: 0.75,
      metalness: 0.4,
      roughness: 0.1,
      emissive: '#00aaff',
      emissiveIntensity: 1.6,
      side: THREE.DoubleSide,
    });
    edgeMaterial.toneMapped = false;

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

  useFrame((state) => {
    if (!groupRef.current) return;

    timeRef.current += 0.016;

    // Cursor parallax
    const nx = cursorPos.x / window.innerWidth - 0.5;
    const ny = cursorPos.y / window.innerHeight - 0.5;
    state.camera.position.x += (nx * 4 - state.camera.position.x) * 0.03;
    state.camera.position.y += (8 - ny * 3 - state.camera.position.y) * 0.03;
    state.camera.lookAt(0, 0, 0);

    // Click: kick the whole observatory into a spin and flare the core
    if (impulseRef.current) {
      spinBoostRef.current += 0.012;
      flareRef.current = 1;
      impulseRef.current = null;
    }
    spinBoostRef.current *= 0.96;
    flareRef.current *= 0.94;

    // Rotate entire structure smoothly
    groupRef.current.rotation.x += 0.00015;
    groupRef.current.rotation.y += 0.0003 + spinBoostRef.current;
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

      // Pulsating neon glow cycling through the spectrum
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.emissive) {
        const glow = Math.sin(timeRef.current * 0.7 + idx * 0.6) * 0.2 + 0.55;
        const hue = (0.5 + idx * 0.09 + timeRef.current * 0.02) % 1;
        (mat.emissive as THREE.Color).setHSL(hue, 1, glow);
        mat.emissiveIntensity = Math.sin(timeRef.current * 0.8 + idx) * 0.6 + 1.3;
      }
    });

    // Pulse the blazing core (clicks flare it up)
    if (coreRef.current) {
      const s = 1 + Math.sin(timeRef.current * 1.4) * 0.12 + flareRef.current * 0.9;
      coreRef.current.scale.setScalar(s);
    }
    if (haloRef.current) {
      const s = 1 + Math.sin(timeRef.current * 1.4 + 0.6) * 0.18 + flareRef.current * 1.4;
      haloRef.current.scale.setScalar(s);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 25]} fov={45} />
      <ambientLight intensity={0.8} />
      <pointLight position={[18, 18, 18]} intensity={600} color="#ffffff" />
      <pointLight position={[-15, 12, -15]} intensity={500} color="#00ffdd" />
      <pointLight position={[10, -12, 10]} intensity={400} color="#ff00ff" />

      <group ref={groupRef}>
        {/* Blazing core at the heart of the observatory */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.4, 3]} />
          <meshBasicMaterial color="#ff2fd6" toneMapped={false} />
        </mesh>
        <mesh ref={haloRef}>
          <icosahedronGeometry args={[2.1, 3]} />
          <meshBasicMaterial
            color="#ff6ec7"
            toneMapped={false}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      <Stars radius={90} depth={50} count={4000} factor={3.5} saturation={0.8} fade speed={0.8} />
    </>
  );
}

export default function GlassObservatoryScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="w-full h-full relative"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #0a2144 0%, #040a26 55%, #000000 100%)' }}
      role="region"
      aria-label="Glass Observatory Scene"
    >
      {mounted && (
        <SceneCanvas>
          <GlassArchitecture />
        </SceneCanvas>
      )}

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1
          className="text-5xl md:text-6xl font-light text-white tracking-widest text-center"
          style={{ textShadow: '0 0 18px rgba(255,47,214,0.85), 0 0 60px rgba(0,170,255,0.6), 0 0 120px rgba(0,255,221,0.4)' }}
        >
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
