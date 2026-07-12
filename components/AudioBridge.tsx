'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { ambientAudio } from '@/lib/ambientAudio';

/** Connects the sound toggle and scene changes to the ambient audio engine. */
export default function AudioBridge() {
  const soundEnabled = useStore((s) => s.soundEnabled);
  const currentScene = useStore((s) => s.currentScene);

  useEffect(() => {
    if (soundEnabled) {
      ambientAudio.enable();
    } else {
      ambientAudio.disable();
    }
  }, [soundEnabled]);

  useEffect(() => {
    ambientAudio.setScene(currentScene);
  }, [currentScene]);

  // M toggles sound
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        const { soundEnabled: on, setSoundEnabled } = useStore.getState();
        setSoundEnabled(!on);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Soft synth blip on scene clicks (skipped for UI buttons)
  useEffect(() => {
    if (!soundEnabled) return;
    const handleDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest('button, a')) return;
      ambientAudio.blip();
    };
    window.addEventListener('pointerdown', handleDown);
    return () => window.removeEventListener('pointerdown', handleDown);
  }, [soundEnabled]);

  return null;
}
