'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, PointLight } from '@react-three/drei';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';

const DRONE_COUNT = 150;

interface Drone {
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  id: number;
}

function DroneField() {
  const { position: cursorPos, isMouseOver } = useCursorPosition();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dronesRef = useRef<Drone[]>([]);
  const formationPhaseRef = useRef(0);

  // Initialize drones
  useEffect(() => {
    dronesRef.current = Array.from({ length: DRONE_COUNT }, (_, i) => ({
      id: i,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ),
      targetPosition: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
    }));
  }, []);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      formationPhaseRef.current += 0.001;

      const drones = dronesRef.current;
      if (!meshRef.current) return;

      const temp = new THREE.Object3D();
      const cursorVector = new THREE.Vector3(cursorPos.x - window.innerWidth / 2, window.innerHeight / 2 - cursorPos.y, 0).normalize().multiplyScalar(8);

      drones.forEach((drone, index) => {
        // Calculate formation target based on phase
        const phase = formationPhaseRef.current + (index / DRONE_COUNT) * Math.PI * 2;
        const angle = phase;
        const radius = 8 + Math.sin(formationPhaseRef.current * 0.5) * 2;

        drone.targetPosition.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 0.5) * 4,
          Math.sin(angle * 1.5) * radius
        );

        // Apply cursor repulsion
        if (isMouseOver) {
          const distToCursor = drone.position.distanceTo(cursorVector);
          if (distToCursor < 5) {
            const repulsion = new THREE.Vector3()
              .subVectors(drone.position, cursorVector)
              .normalize()
              .multiplyScalar((5 - distToCursor) * 0.2);
            drone.targetPosition.add(repulsion);
          }
        }

        // Smooth movement
        drone.velocity.lerpVectors(
          drone.velocity,
          new THREE.Vector3().subVectors(drone.targetPosition, drone.position).multiplyScalar(0.01),
          0.1
        );

        drone.position.add(drone.velocity);

        // Update instanced mesh
        temp.position.copy(drone.position);
        temp.scale.setScalar(0.1 + Math.sin(phase) * 0.05);
        temp.updateMatrix();
        meshRef.current.setMatrixAt(index, temp.matrix);
      });

      meshRef.current.instanceMatrix.needsUpdate = true;
    }, 16);

    return () => clearInterval(interval);
  }, [cursorPos, isMouseOver]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, 5]} intensity={0.3} color="#4488ff" />

      <instancedMesh ref={meshRef} args={[undefined, undefined, DRONE_COUNT]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#88ccff"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </instancedMesh>

      {/* Atmospheric fog */}
      <fog attach="fog" args={['#000000', 1, 40]} />
    </>
  );
}

export default function DroneConstellationScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full bg-black relative" role="region" aria-label="Drone Constellation Scene">
      {mounted && (
        <Canvas
          dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <DroneField />
        </Canvas>
      )}

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-5xl md:text-6xl font-light text-white tracking-widest text-center">
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
