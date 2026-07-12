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

// The swarm cycles through these formations, morphing between them
type FormationFn = (i: number, n: number, t: number, out: THREE.Vector3) => void;

const FORMATIONS: FormationFn[] = [
  // Orbiting nebula helix
  (i, n, t, out) => {
    const phase = t * 0.06 + (i / n) * Math.PI * 2;
    const radius = 8 + Math.sin(t * 0.03) * 3;
    out.set(
      Math.cos(phase) * radius + Math.sin(phase * 0.3),
      Math.sin(phase * 0.5) * 5 + Math.cos(phase * 0.2),
      Math.sin(phase * 1.5) * radius + Math.cos(phase * 0.4)
    );
  },
  // Fibonacci sphere, slowly rotating
  (i, n, t, out) => {
    const golden = Math.PI * (3 - Math.sqrt(5));
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i + t * 0.15;
    out.set(Math.cos(theta) * r * 9, y * 9, Math.sin(theta) * r * 9);
  },
  // Great torus ring
  (i, n, t, out) => {
    const u = (i / n) * Math.PI * 16 + t * 0.12;
    const v = (i / n) * Math.PI * 2 + t * 0.05;
    out.set(
      (9 + 2.5 * Math.cos(u)) * Math.cos(v),
      2.5 * Math.sin(u),
      (9 + 2.5 * Math.cos(u)) * Math.sin(v)
    );
  },
  // Rippling wave grid
  (i, n, t, out) => {
    const cols = 20;
    const x = (i % cols) - cols / 2 + 0.5;
    const z = Math.floor(i / cols) - n / cols / 2 + 0.5;
    out.set(
      x * 1.1,
      Math.sin(x * 0.5 + t * 0.6) * 2.2 + Math.cos(z * 0.6 + t * 0.45) * 2.2,
      z * 1.6
    );
  },
];

const FORMATION_CYCLE_SECONDS = 11;

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

    // Cursor parallax plus a slow idle drift so the scene breathes untouched
    const drift = state.clock.elapsedTime;
    const nx = cursorPos.x / window.innerWidth - 0.5;
    const ny = cursorPos.y / window.innerHeight - 0.5;
    state.camera.position.x += (nx * 3 + Math.sin(drift * 0.12) * 1.4 - state.camera.position.x) * 0.03;
    state.camera.position.y += (-ny * 3 + Math.cos(drift * 0.09) * 1.0 - state.camera.position.y) * 0.03;
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

    // Morph between formations: hold each one, then blend into the next
    const t = state.clock.elapsedTime;
    const cyclePos = t / FORMATION_CYCLE_SECONDS;
    const fromIdx = Math.floor(cyclePos) % FORMATIONS.length;
    const toIdx = (fromIdx + 1) % FORMATIONS.length;
    const frac = cyclePos % 1;
    const rawBlend = Math.min(Math.max((frac - 0.65) / 0.35, 0), 1);
    const blend = rawBlend * rawBlend * (3 - 2 * rawBlend); // smoothstep

    const fromTarget = new THREE.Vector3();
    const toTarget = new THREE.Vector3();

    drones.forEach((drone, index) => {
      const phase = formationPhaseRef.current + (index / DRONE_COUNT) * Math.PI * 2;

      FORMATIONS[fromIdx](index, DRONE_COUNT, t, fromTarget);
      if (blend > 0) {
        FORMATIONS[toIdx](index, DRONE_COUNT, t, toTarget);
        fromTarget.lerp(toTarget, blend);
      }
      drone.targetPosition.copy(fromTarget);

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
        new THREE.Vector3().subVectors(drone.targetPosition, drone.position).multiplyScalar(0.014),
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
      <instancedMesh ref={meshRef} args={[undefined, undefined, DRONE_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>

      {/* Additive halo layer around every drone */}
      <instancedMesh ref={glowRef} args={[undefined, undefined, DRONE_COUNT]} frustumCulled={false}>
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
