'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';

const PARTICLE_COUNT = 8000;

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  mass: number;
  life: number;
}

function GlitterField() {
  const { position: cursorPos, isMouseOver } = useCursorPosition();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const { viewport } = useThree();

  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 5
      ),
      velocity: new THREE.Vector3(0, 0, 0),
      targetPosition: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 5
      ),
      mass: 0.5 + Math.random() * 0.5,
      life: Math.random(),
    }));
  }, []);

  useFrame(() => {
    timeRef.current += 0.016;

    if (!meshRef.current) return;

    const temp = new THREE.Object3D();
    const cursorNorm = new THREE.Vector3(
      (cursorPos.x / window.innerWidth - 0.5) * 20,
      -(cursorPos.y / window.innerHeight - 0.5) * 20,
      0
    );

    const particles = particlesRef.current;
    particles.forEach((particle, index) => {
      // Apply wind effect
      particle.targetPosition.x += Math.sin(timeRef.current * 0.3 + particle.life * 10) * 0.01;
      particle.targetPosition.y += Math.cos(timeRef.current * 0.25 + particle.life * 10) * 0.01;

      // Apply cursor attraction
      if (isMouseOver) {
        const distToCursor = particle.position.distanceTo(cursorNorm);
        if (distToCursor < 8) {
          const pull = new THREE.Vector3()
            .subVectors(cursorNorm, particle.position)
            .normalize()
            .multiplyScalar((8 - distToCursor) * 0.15);
          particle.velocity.add(pull);
        }
      }

      // Smooth movement
      particle.velocity.multiplyScalar(0.96);
      particle.position.lerp(particle.targetPosition, 0.02);
      particle.position.add(particle.velocity);

      // Oscillate Y based on time
      particle.position.y += Math.sin(timeRef.current * 0.5 + particle.life * 20) * 0.002;

      // Create trails
      const trailOffset = Math.sin(timeRef.current * 2 + index) * 0.05;

      temp.position.copy(particle.position);
      temp.position.addScaledVector(particle.velocity, trailOffset);
      temp.scale.setScalar(0.02 + Math.sin(timeRef.current + particle.life * 100) * 0.01);
      temp.rotation.z = Math.atan2(particle.velocity.y, particle.velocity.x);

      // Fade alpha over time
      temp.userData.alpha = Math.sin(timeRef.current * 0.5 + particle.life * 10) * 0.5 + 0.5;

      temp.updateMatrix();
      meshRef.current.setMatrixAt(index, temp.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <perspectiveCamera makeDefault position={[0, 0, 12]} />
      <pointLight position={[5, 5, 10]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-5, -5, 8]} intensity={0.4} color="#dd88ff" />

      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <planeGeometry args={[0.05, 0.05]} />
        <meshStandardMaterial
          color="#e0d5c7"
          emissive="#ffffff"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      <fog attach="fog" args={['#000000', 2, 40]} />
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
