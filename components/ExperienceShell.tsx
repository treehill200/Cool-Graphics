'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { SceneIndex } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

import DroneConstellationScene from './scenes/DroneConstellationScene';
import GlitterFieldScene from './scenes/GlitterFieldScene';
import FerrofluidScene from './scenes/FerrofluidScene';
import ThreadForestScene from './scenes/ThreadForestScene';
import GlassObservatoryScene from './scenes/GlassObservatoryScene';

import SceneNavigation from './SceneNavigation';
import SoundController from './SoundController';
import SceneTransition from './SceneTransition';
import PerformanceMonitor from './PerformanceMonitor';
import HelpPanel from './HelpPanel';
import FullscreenToggle from './FullscreenToggle';

const SCENES = [
  DroneConstellationScene,
  GlitterFieldScene,
  FerrofluidScene,
  ThreadForestScene,
  GlassObservatoryScene,
];

export default function ExperienceShell() {
  const {
    currentScene,
    setCurrentScene,
    setIsTransitioning,
    setIsMobile,
    reducedMotion,
  } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const [touchStartY, setTouchStartY] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const prevSceneRef = useRef(currentScene);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      useStore.setState({ reducedMotion: e.matches });
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, [setIsMobile]);

  const goToScene = useCallback((sceneIndex: SceneIndex) => {
    if (sceneIndex === currentScene || sceneIndex < 0 || sceneIndex > 4) return;

    const direction = sceneIndex > currentScene ? 'forward' : 'backward';
    setTransitionDirection(direction);
    setIsTransitioning(true);

    setTimeout(() => {
      prevSceneRef.current = sceneIndex;
      setCurrentScene(sceneIndex);
      setIsTransitioning(false);
    }, 600);
  }, [currentScene, setCurrentScene, setIsTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToScene(((currentScene + 1) % 5) as SceneIndex);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToScene(((currentScene - 1 + 5) % 5) as SceneIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScene, goToScene]);

  // Scroll wheel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      if (Math.abs(e.deltaY) > 5) {
        if (e.deltaY > 0) {
          goToScene(((currentScene + 1) % 5) as SceneIndex);
        } else {
          goToScene(((currentScene - 1 + 5) % 5) as SceneIndex);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentScene, goToScene]);

  // Touch swipe navigation
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToScene(((currentScene + 1) % 5) as SceneIndex);
        } else {
          goToScene(((currentScene - 1 + 5) % 5) as SceneIndex);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentScene, goToScene, touchStartY]);

  const CurrentScene = SCENES[currentScene];

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black"
      role="main"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`scene-${currentScene}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
          transition={{
            duration: reducedMotion ? 0.3 : 0.6,
            ease: 'easeInOut',
          }}
          className="w-full h-full"
        >
          <CurrentScene />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <SceneNavigation currentScene={currentScene} onSceneChange={goToScene} />

      {/* Sound Control */}
      <SoundController />

      {/* Fullscreen Toggle */}
      <FullscreenToggle />

      {/* Help Panel */}
      <HelpPanel />

      {/* Transition Effect */}
      <SceneTransition isActive={isTransitioning} direction={transitionDirection} />

      {/* Performance Monitor (Press P to toggle) */}
      <PerformanceMonitor />

      {/* Skip to main navigation message for screen readers */}
      <a href="#main-content" className="sr-only">
        Skip to main content
      </a>
    </div>
  );
}
