'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';
import { usePointerImpulse } from '@/hooks/usePointerImpulse';
import SceneCanvas from '@/components/SceneCanvas';

const DRONE_COUNT = 200;

interface Drone {
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  id: number;
}

function DroneField() {
  const { position: cursorPos, isMouseOver } = useCursorPosition();
  const { impulseRef } = usePointerImpulse();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);
  const dronesRef = useRef<Drone[]>([]);
  const formationPhaseRef = useRef(0);
  const linesRef = useRef<THREE.LineSegments | null>(null);

  // Initialize drones
  useEffect(() => {
    dronesRef.current = Array.from({ length: DRONE_COUNT }, (_, i) => ({
      id: i,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
      ),
      targetPosition: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
    }));

    // Neon color per drone (instance colors multiply with the white base material)
    const palette = ['#00ffff', '#ff00ff', '#7df9ff', '#39ff14', '#ff6ec7'];
    const c = new THREE.Color();
    [meshRef.current, glowRef.current].forEach((m) => {
      if (!m) return;
      for (let i = 0; i < DRONE_COUNT; i++) {
        c.set(palette[i % palette.length]);
        m.setColorAt(i, c);
      }
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });
  }, []);

  useFrame((state) => {
    formationPhaseRef.current += 0.001;

    const drones = dronesRef.current;
    if (!meshRef.current) return;

    const temp = new THREE.Object3D();
    const cursorVector = new THREE.Vector3(
      (cursorPos.x / window.innerWidth - 0.5) * 20,
      -(cursorPos.y / window.innerHeight - 0.5) * 20,
      0
    );

    // Cursor parallax: the camera drifts with the mouse for depth
    const nx = cursorPos.x / window.innerWidth - 0.5;
    const ny = cursorPos.y / window.innerHeight - 0.5;
    state.camera.position.x += (nx * 3 - state.camera.position.x) * 0.03;
    state.camera.position.y += (-ny * 3 - state.camera.position.y) * 0.03;
    state.camera.lookAt(0, 0, 0);

    // Click: scatter burst — the swarm explodes outward, then reforms
    const imp = impulseRef.current;
    if (imp) {
      const impVec = new THREE.Vector3(
        (imp.x / window.innerWidth - 0.5) * 20,
        -(imp.y / window.innerHeight - 0.5) * 20,
        0
      );
      drones.forEach((drone) => {
        const dist = drone.position.distanceTo(impVec);
        const dir = new THREE.Vector3().subVectors(drone.position, impVec).normalize();
        drone.velocity.addScaledVector(dir, 0.6 * Math.exp(-dist * 0.12));
      });
      impulseRef.current = null;
    }

    const positions: number[] = [];

    drones.forEach((drone, index) => {
      const phase = formationPhaseRef.current + (index / DRONE_COUNT) * Math.PI * 2;
      const angle = phase;
      const radius = 8 + Math.sin(formationPhaseRef.current * 0.5) * 3;

      drone.targetPosition.set(
        Math.cos(angle) * radius + Math.sin(phase * 0.3) * 1,
        Math.sin(angle * 0.5) * 5 + Math.cos(phase * 0.2) * 1,
        Math.sin(angle * 1.5) * radius + Math.cos(phase * 0.4) * 1
      );

      if (isMouseOver) {
        const distToCursor = drone.position.distanceTo(cursorVector);
        if (distToCursor < 6) {
          const repulsion = new THREE.Vector3()
            .subVectors(drone.position, cursorVector)
            .normalize()
            .multiplyScalar((6 - distToCursor) * 0.25);
          drone.targetPosition.add(repulsion);
        }
      }

      drone.velocity.lerpVectors(
        drone.velocity,
        new THREE.Vector3().subVectors(drone.targetPosition, drone.position).multiplyScalar(0.008),
        0.08
      );

      drone.position.add(drone.velocity);

      temp.position.copy(drone.position);
      const scale = 0.1 + Math.sin(phase + formationPhaseRef.current) * 0.06;
      temp.scale.setScalar(scale);
      temp.updateMatrix();
      meshRef.current!.setMatrixAt(index, temp.matrix);

      if (glowRef.current) {
        temp.scale.setScalar(scale * 3.4);
        temp.updateMatrix();
        glowRef.current.setMatrixAt(index, temp.matrix);
      }

      positions.push(drone.position.x, drone.position.y, drone.position.z);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (glowRef.current) glowRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={60} />

      {/* Bright unlit cores */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, DRONE_COUNT]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>

      {/* Additive halo layer around every drone */}
      <instancedMesh ref={glowRef} args={[undefined, undefined, DRONE_COUNT]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          toneMapped={false}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      <Stars radius={80} depth={40} count={3000} factor={3} saturation={0.7} fade speed={0.6} />
    </>
  );
}

export default function DroneConstellationScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="w-full h-full relative"
      style={{ background: 'radial-gradient(ellipse at 50% 35%, #0a1f4d 0%, #03071f 55%, #000000 100%)' }}
      role="region"
      aria-label="Drone Constellation Scene"
    >
      {mounted && (
        <SceneCanvas>
          <DroneField />
        </SceneCanvas>
      )}

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1
          className="text-5xl md:text-6xl font-light text-white tracking-widest text-center"
          style={{ textShadow: '0 0 18px rgba(0,255,255,0.9), 0 0 60px rgba(0,255,255,0.5), 0 0 120px rgba(255,0,255,0.4)' }}
        >
          THE SKY REMEMBERS
        </h1>
        <p className="text-sm md:text-base text-white/60 mt-8 tracking-wide max-w-md text-center">
          Every point of light has a position. Every movement has a purpose.
        </p>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-white/30 text-xs tracking-widest">
        SCROLL TO CONTINUE
      </div>
    </div>
  );
}
