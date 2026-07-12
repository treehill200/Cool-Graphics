'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';
import { usePointerImpulse } from '@/hooks/usePointerImpulse';
import SceneCanvas from '@/components/SceneCanvas';

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
  const { impulseRef } = usePointerImpulse();
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

    // Iridescent neon instance colors
    const palette = ['#ff71ce', '#01cdfe', '#05ffa1', '#b967ff', '#fffb96', '#00ffff'];
    const c = new THREE.Color();
    if (meshRef.current) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        c.set(palette[i % palette.length]);
        meshRef.current.setColorAt(i, c);
      }
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  }, []);

  useFrame((state) => {
    timeRef.current += 0.016;

    const mesh = meshRef.current;
    if (!mesh) return;

    const temp = new THREE.Object3D();
    const cursorNorm = new THREE.Vector3(
      (cursorPos.x / window.innerWidth - 0.5) * 24,
      -(cursorPos.y / window.innerHeight - 0.5) * 24,
      0
    );

    // Cursor parallax
    const nx = cursorPos.x / window.innerWidth - 0.5;
    const ny = cursorPos.y / window.innerHeight - 0.5;
    state.camera.position.x += (nx * 2 - state.camera.position.x) * 0.03;
    state.camera.position.y += (-ny * 2 - state.camera.position.y) * 0.03;
    state.camera.lookAt(0, 0, 0);

    // Click: glitter shockwave radiating from the click point
    const imp = impulseRef.current;
    let impVec: THREE.Vector3 | null = null;
    if (imp) {
      impVec = new THREE.Vector3(
        (imp.x / window.innerWidth - 0.5) * 24,
        -(imp.y / window.innerHeight - 0.5) * 24,
        0
      );
      impulseRef.current = null;
    }

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

      // Shockwave impulse
      if (impVec) {
        const distToBlast = particle.position.distanceTo(impVec);
        const dir = new THREE.Vector3().subVectors(particle.position, impVec).normalize();
        particle.velocity.addScaledVector(dir, 1.4 * Math.exp(-distToBlast * 0.22) * particle.mass);
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
      const scale = 1.1 + Math.sin(timeRef.current * 2 + particle.life * 100) * 0.7;
      temp.scale.setScalar(scale);
      temp.rotation.z = Math.atan2(particle.velocity.y, particle.velocity.x) + timeRef.current;

      temp.updateMatrix();
      mesh.setMatrixAt(index, temp.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={55} />

      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <planeGeometry args={[0.04, 0.04]} />
        <meshBasicMaterial
          color="#ffffff"
          toneMapped={false}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </>
  );
}

export default function GlitterFieldScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="w-full h-full relative"
      style={{ background: 'radial-gradient(ellipse at 50% 60%, #3d0a4d 0%, #12041f 55%, #000000 100%)' }}
      role="region"
      aria-label="Glitter Field Scene"
    >
      {mounted && (
        <SceneCanvas>
          <GlitterField />
        </SceneCanvas>
      )}

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1
          className="text-5xl md:text-6xl font-light text-white tracking-widest text-center"
          style={{ textShadow: '0 0 18px rgba(255,113,206,0.9), 0 0 60px rgba(185,103,255,0.6), 0 0 120px rgba(1,205,254,0.4)' }}
        >
          TOUCH THE UNTOUCHABLE
        </h1>
        <p className="text-sm md:text-base text-white/60 mt-8 tracking-wide max-w-md text-center">
          A surface made from a million moments of reflected light.
        </p>
      </div>
    </div>
  );
}
