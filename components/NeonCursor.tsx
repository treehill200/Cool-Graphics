'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';

const SCENE_ACCENTS = ['#00ffff', '#ff71ce', '#7d2fff', '#39ff14', '#ff2fd6'];

/**
 * Custom neon cursor: a bright dot that tracks the pointer exactly and a
 * glowing ring that trails behind it. Disabled on touch devices.
 */
export default function NeonCursor() {
  const currentScene = useStore((s) => s.currentScene);
  const [active, setActive] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const pressed = useRef(false);

  useEffect(() => {
    // Only take over the cursor for fine pointers (mouse/trackpad)
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setActive(true);

    const handleMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };
    const handleDown = () => {
      pressed.current = true;
    };
    const handleUp = () => {
      pressed.current = false;
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);

    let raf = 0;
    const tick = () => {
      ring.current.x += (target.current.x - ring.current.x) * 0.18;
      ring.current.y += (target.current.y - ring.current.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        const scale = pressed.current ? 0.6 : 1;
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%) scale(${scale})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    document.documentElement.classList.add('neon-cursor-active');
    return () => document.documentElement.classList.remove('neon-cursor-active');
  }, [active]);

  if (!active) return null;

  const accent = SCENE_ACCENTS[currentScene] ?? SCENE_ACCENTS[0];

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="fixed top-0 left-0 z-[100] pointer-events-none rounded-full"
        style={{
          width: 8,
          height: 8,
          background: accent,
          boxShadow: `0 0 10px ${accent}, 0 0 28px ${accent}`,
          transition: 'background 0.5s, box-shadow 0.5s',
        }}
      />
      <div
        ref={ringRef}
        aria-hidden
        className="fixed top-0 left-0 z-[100] pointer-events-none rounded-full"
        style={{
          width: 38,
          height: 38,
          border: `1.5px solid ${accent}`,
          boxShadow: `0 0 14px ${accent}55 inset, 0 0 14px ${accent}55`,
          opacity: 0.7,
          transition: 'border-color 0.5s, box-shadow 0.5s, transform 0.12s ease-out',
        }}
      />
    </>
  );
}
