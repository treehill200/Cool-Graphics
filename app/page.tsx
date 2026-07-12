'use client';

import dynamic from 'next/dynamic';

const ExperienceShell = dynamic(() => import('@/components/ExperienceShell'), {
  ssr: false,
  loading: () => <div className="w-screen h-screen bg-black" />,
});

export default function Home() {
  return <ExperienceShell />;
}
