export type SceneIndex = 0 | 1 | 2 | 3 | 4;

export interface ExperienceState {
  currentScene: SceneIndex;
  isTransitioning: boolean;
  scrollProgress: number;
  isMobile: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface SceneConfig {
  id: SceneIndex;
  name: string;
  chapter: string;
  headline: string;
  subheadline: string;
}

export const SCENE_CONFIGS: SceneConfig[] = [
  {
    id: 0,
    name: 'Constellation',
    chapter: 'I',
    headline: 'THE SKY REMEMBERS',
    subheadline: 'Every point of light has a position. Every movement has a purpose.',
  },
  {
    id: 1,
    name: 'Reflection',
    chapter: 'II',
    headline: 'TOUCH THE UNTOUCHABLE',
    subheadline: 'A surface made from a million moments of reflected light.',
  },
  {
    id: 2,
    name: 'Magnetism',
    chapter: 'III',
    headline: 'INVISIBLE FORCES',
    subheadline: 'You cannot see what moves it. You can only see what it becomes.',
  },
  {
    id: 3,
    name: 'Signal',
    chapter: 'IV',
    headline: 'EVERYTHING IS CONNECTED',
    subheadline: 'One signal travels farther than the hand that created it.',
  },
  {
    id: 4,
    name: 'Refraction',
    chapter: 'V',
    headline: 'YOU HAVE REACHED THE OTHER SIDE',
    subheadline: 'Five worlds. One continuous transformation.',
  },
];
