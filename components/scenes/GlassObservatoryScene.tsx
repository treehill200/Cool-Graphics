'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';

function GlassArchitecture() {
  const { position: cursorPos } = useCursorPosition();
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const meshesRef = useRef<THREE.Mesh[]>([]);

  // Create glass elements
  useEffect(() => {
    if (!groupRef.current) return;

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.15,
      metalness: 0.9,
      roughness: 0.05,
      envMapIntensity: 1,
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: '#88ccff',
      transparent: true,
      opacity: 0.3,
      metalness: 0.7,
      roughness: 0.2,
      emissive: '#0088ff',
      emissiveIntensity: 0.3,
    });

    // Central sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(3, 4);
    const sphere = new THREE.Mesh(sphereGeometry, glassMaterial.clone());
    sphere.castShadow = true;
    groupRef.current.add(sphere);
    meshesRef.current.push(sphere);

    // Floating platforms
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 3;

      const platformGeometry = new THREE.BoxGeometry(2, 0.3, 3);
      const platform = new THREE.Mesh(platformGeometry, glassMaterial.clone());
      platform.position.set(x, y, z);
      platform.rotation.y = angle;
      platform.castShadow = true;
      groupRef.current.add(platform);
      meshesRef.current.push(platform);
    }

    // Floating rings
    for (let i = 0; i < 4; i++) {
      const scale = 1 + i * 0.7;
      const ringGeometry = new THREE.TorusGeometry(4 * scale, 0.2, 16, 100);
      const ring = new THREE.Mesh(ringGeometry, edgeMaterial.clone());
      ring.rotation.x = Math.PI / 3 + i * 0.3;
      ring.rotation.y = i * Math.PI / 4;
      ring.castShadow = true;
      groupRef.current.add(ring);
      meshesRef.current.push(ring);
    }

    // Floating lenses
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const lensGeometry = new THREE.IcosahedronGeometry(1.5, 3);
      const lens = new THREE.Mesh(lensGeometry, edgeMaterial.clone());
      lens.position.set(
        Math.cos(angle) * 10,
        Math.sin(angle) * 8,
        Math.cos(angle * 0.7) * 6
      );
      lens.castShadow = true;
      groupRef.current.add(lens);
      meshesRef.current.push(lens);
    }
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    timeRef.current += 0.016;

    const cursorNorm = new THREE.Vector3(
      (cursorPos.x / window.innerWidth - 0.5) * 20,
      -(cursorPos.y / window.innerHeight - 0.5) * 20,
      0
    );

    // Rotate entire structure
    groupRef.current.rotation.x += 0.0002;
    groupRef.current.rotation.y += 0.0005;

    // Gentle bobbing and orbital motion
    meshesRef.current.forEach((mesh, idx) => {
      if (mesh instanceof THREE.Mesh) {
        const originalPosition = mesh.position.clone();
        const distance = originalPosition.length();

        mesh.position.y += Math.sin(timeRef.current * 0.3 + idx) * 0.01;

        // Subtle rotation
        mesh.rotation.x += 0.0002;
        mesh.rotation.y += 0.0003;

        // Glow pulsation
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (material.emissive) {
          const pulsation = Math.sin(timeRef.current * 0.8 + idx * 0.5) * 0.2 + 0.1;
          (material.emissive as THREE.Color).setHSL(0.55, 0.8, pulsation);
        }
      }
    });
  });

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vViewDir = normalize(-position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      float fresnel = pow(1.0 - dot(vNormal, vViewDir), 3.0);
      vec3 color = mix(vec3(0.1, 0.2, 0.3), vec3(0.8, 0.9, 1.0), fresnel);
      gl_FragColor = vec4(color, 0.2 + fresnel * 0.3);
    }
  `;

  return (
    <>
      <perspectiveCamera makeDefault position={[0, 8, 20]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-15, 10, -15]} intensity={0.6} color="#00ffff" />
      <pointLight position={[0, -10, 0]} intensity={0.4} color="#ff00ff" />

      <group ref={groupRef} />

      <fog attach="fog" args={['#000000', 5, 60]} />
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
        <Canvas
          dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <GlassArchitecture />
        </Canvas>
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
