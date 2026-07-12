import { useEffect, useRef } from 'react';

export interface PointerImpulse {
  x: number;
  y: number;
  time: number; // performance.now() timestamp in ms
}

/**
 * Tracks pointer clicks without re-rendering. Scenes read (and may clear)
 * impulseRef inside their frame loop; isDownRef reflects the held state.
 */
export function usePointerImpulse() {
  const impulseRef = useRef<PointerImpulse | null>(null);
  const isDownRef = useRef(false);

  useEffect(() => {
    const handleDown = (e: PointerEvent) => {
      // Ignore clicks on buttons/links so UI interaction doesn't fire scene effects
      if ((e.target as HTMLElement)?.closest('button, a')) return;
      isDownRef.current = true;
      impulseRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    };
    const handleUp = () => {
      isDownRef.current = false;
    };

    window.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);

    return () => {
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, []);

  return { impulseRef, isDownRef };
}
