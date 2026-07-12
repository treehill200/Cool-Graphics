'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useCursorPosition } from '@/hooks/useCursorPosition';
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
  const meshRef = useRef<THREE.InstancedMesh>(null);
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
  }, []);

  useFrame(() => {
    formationPhaseRef.current += 0.001;

    const drones = dronesRef.current;
    if (!meshRef.current) return;

    const temp = new THREE.Object3D();
    const cursorVector = new THREE.Vector3(
      (cursorPos.x / window.innerWidth - 0.5) * 20,
      -(cursorPos.y / window.innerHeight - 0.5) * 20,
      0
    );

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

      positions.push(drone.position.x, drone.position.y, drone.position.z);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={60} />
      <pointLight position={[15, 15, 15]} intensity={0.6} />
      <pointLight position={[-12, -12, 8]} intensity={0.4} color="#4488ff" />
      <ambientLight intensity={0.2} />

      <instancedMesh ref={meshRef} args={[undefined, undefined, DRONE_COUNT]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#88ccff"
          emissiveIntensity={0.7}
          metalness={0.95}
          roughness={0.05}
          wireframe={false}
        />
      </instancedMesh>

      <fog attach="fog" args={['#000000', 2, 60]} />
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
        <SceneCanvas>
          <DroneField />
        </SceneCanvas>
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
