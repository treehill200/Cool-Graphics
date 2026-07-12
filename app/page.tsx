'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';

const ExperienceShell = dynamic(() => import('@/components/ExperienceShell'), {
  ssr: false,
  loading: () => <div className="w-screen h-screen bg-black" />,
});

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!isLoaded ? (
        <LoadingScreen key="loading" onComplete={() => setIsLoaded(true)} />
      ) : (
        <ExperienceShell key="experience" />
      )}
    </AnimatePresence>
  );
}
