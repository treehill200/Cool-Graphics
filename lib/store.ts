import { create } from 'zustand';
import { ExperienceState, SceneIndex } from './types';

interface Store extends ExperienceState {
  setCurrentScene: (scene: SceneIndex) => void;
  setIsTransitioning: (transitioning: boolean) => void;
  setScrollProgress: (progress: number) => void;
  setIsMobile: (isMobile: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  currentScene: 0,
  isTransitioning: false,
  scrollProgress: 0,
  isMobile: false,
  soundEnabled: false,
  reducedMotion: false,
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setIsTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setIsMobile: (isMobile) => set({ isMobile }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
}));
