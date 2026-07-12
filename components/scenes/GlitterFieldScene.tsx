'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';

const PARTICLE_COUNT = 10000;

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  mass: number;
  life: number;
  baseTarget: THREE.Vector3;
}

function GlitterField() {
  const { position: cursorPos, isMouseOver } = useCursorPosition();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const baseTarget = new THREE.Vector3(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 4
      );
      return {
        position: baseTarget.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
        targetPosition: baseTarget.clone(),
        baseTarget,
        mass: 0.3 + Math.random() * 0.7,
        life: Math.random(),
      };
    });
  }, []);

  useFrame(() => {
    timeRef.current += 0.016;

    if (!meshRef.current) return;

    const temp = new THREE.Object3D();
    const cursorNorm = new THREE.Vector3(
      (cursorPos.x / window.innerWidth - 0.5) * 24,
      -(cursorPos.y / window.innerHeight - 0.5) * 24,
      0
    );

    const particles = particlesRef.current;
    particles.forEach((particle, index) => {
      // Wind effect
      const windX = Math.sin(timeRef.current * 0.2 + particle.life * 15) * 0.02;
      const windY = Math.cos(timeRef.current * 0.15 + particle.life * 12) * 0.015;

      particle.targetPosition.copy(particle.baseTarget);
      particle.targetPosition.x += windX;
      particle.targetPosition.y += windY;

      // Cursor attraction/repulsion
      if (isMouseOver) {
        const distToCursor = particle.position.distanceTo(cursorNorm);
        if (distToCursor < 7) {
          const pull = new THREE.Vector3()
            .subVectors(cursorNorm, particle.position)
            .normalize()
            .multiplyScalar((7 - distToCursor) * 0.12 * particle.mass);
          particle.velocity.add(pull);
        }
      }

      // Physics
      particle.velocity.multiplyScalar(0.94);
      particle.position.lerp(particle.targetPosition, 0.015);
      particle.position.add(particle.velocity);

      // Floating effect
      const floatAmount = Math.sin(timeRef.current * 0.6 + particle.life * 25) * 0.003;
      particle.position.y += floatAmount;

      // Update matrix
      temp.position.copy(particle.position);
      const scale = 0.018 + Math.sin(timeRef.current * 2 + particle.life * 100) * 0.012;
      temp.scale.setScalar(scale);
      temp.rotation.z = Math.atan2(particle.velocity.y, particle.velocity.x) + timeRef.current;

      temp.updateMatrix();
      meshRef.current.setMatrixAt(index, temp.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <perspectiveCamera makeDefault position={[0, 0, 15]} fov={55} />
      <pointLight position={[8, 8, 12]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-8, -8, 10]} intensity={0.5} color="#ff88dd" />
      <ambientLight intensity={0.15} />

      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <planeGeometry args={[0.04, 0.04]} />
        <meshStandardMaterial
          color="#d4c5b9"
          emissive="#ffffee"
          emissiveIntensity={0.5}
          metalness={0.85}
          roughness={0.08}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      <fog attach="fog" args={['#000000', 2, 60]} />
    </>
  );
}

export default function GlitterFieldScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full bg-black relative" role="region" aria-label="Glitter Field Scene">
      {mounted && (
        <Canvas
          dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <GlitterField />
        </Canvas>
      )}

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-5xl md:text-6xl font-light text-white tracking-widest text-center">
          TOUCH THE UNTOUCHABLE
        </h1>
        <p className="text-sm md:text-base text-white/60 mt-8 tracking-wide max-w-md text-center">
          A surface made from a million moments of reflected light.
        </p>
      </div>
    </div>
  );
}
