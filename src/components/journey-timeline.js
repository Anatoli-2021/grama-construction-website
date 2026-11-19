import { clampSequenceProgress } from './artlist-house-sequence.js';

export const JOURNEY_SCENES = [
  { id: 'arrival', atlasBase: '/assets/film/arrival', poster: '/assets/animated/house-complete.webp' },
  { id: 'interior', atlasBase: '/assets/film/interior', poster: '/assets/film/interior-poster.webp' },
  { id: 'structure', atlasBase: '/assets/animated/artlist-house', poster: '/assets/animated/house-structure.webp' },
];

export const JOURNEY_CHAPTERS = [
  { id: 'arrival', label: 'Arrival', target: 0, title: 'The residence.', text: 'Gabled rooflines, light masonry and timber.' },
  { id: 'entrance', label: 'Entrance', target: 0.22, title: 'The entrance.', text: 'From the sheltered porch into the home.' },
  { id: 'interior', label: 'Interior', target: 0.48, title: 'The interior.', text: 'Living, dining and kitchen spaces.' },
  { id: 'structure', label: 'Structure', target: 0.76, title: 'The structure.', text: 'The house concept opens to reveal its frame.' },
  { id: 'overview', label: 'Overview', target: 0.98, title: 'Dexter Acres.', text: 'A proposed fourteen-home neighborhood in Des Plaines.' },
];

const smooth = value => { const t = clampSequenceProgress(value); return t * t * (3 - 2 * t); };
const opening = value => { const t = clampSequenceProgress(value); return 1 - (1 - t) ** 2; };

export function getJourneyPose(value) {
  const progress = clampSequenceProgress(value);
  const sceneIndex = progress < 0.36 ? 0 : progress < 0.62 ? 1 : 2;
  const start = [0, 0.36, 0.62][sceneIndex];
  const end = [0.36, 0.62, 0.86][sceneIndex];
  const local = clampSequenceProgress((progress - start) / (end - start));
  const localProgress = sceneIndex === 1 ? local : opening(local);
  const chapterIndex = progress < 0.14 ? 0 : progress < 0.36 ? 1 : progress < 0.62 ? 2 : progress < 0.86 ? 3 : 4;
  return {
    progress,
    sceneIndex,
    localProgress,
    transition: sceneIndex === 0 ? 1 : smooth((progress - start) / 0.035),
    overview: smooth((progress - 0.86) / 0.1),
    introduction: 1 - smooth(progress / 0.1),
    chapterIndex,
    phase: JOURNEY_CHAPTERS[chapterIndex].id,
    globalFrame: sceneIndex * 40 + Math.floor(localProgress * 39),
  };
}
