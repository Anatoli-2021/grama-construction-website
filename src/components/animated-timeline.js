export const SOURCE_WIDTH = 1672;
export const SOURCE_HEIGHT = 941;

export const EXPERIENCE_CHAPTERS = [
  { id: 'house', label: 'House', target: 0 },
  { id: 'layers', label: 'Layers', target: 0.4 },
  { id: 'inside', label: 'Inside the frame', target: 0.66 },
  { id: 'neighborhood', label: 'Neighborhood', target: 0.96 },
];

export function clampProgress(value) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

const smooth = value => {
  const t = clampProgress(value);
  return t * t * (3 - 2 * t);
};
const transition = (value, start, end) => smooth((value - start) / (end - start));
const mix = (from, to, amount) => from + (to - from) * amount;

// Layer offsets use the original 1672 × 941 canvas, so every viewport keeps
// the same assembled alignment. Camera values describe a layered illustration.
const keyframes = [
  { at: 0, roofY: 0, facadeLeftX: 0, facadeRightX: 0, modelScale: 1, modelYaw: -3, modelX: 0, modelY: 0 },
  { at: 0.13, roofY: 0, facadeLeftX: 0, facadeRightX: 0, modelScale: 1.025, modelYaw: 1, modelX: 0, modelY: 0 },
  { at: 0.37, roofY: -180, facadeLeftX: -72, facadeRightX: 86, modelScale: 0.87, modelYaw: -5, modelX: 0, modelY: 24 },
  { at: 0.49, roofY: -180, facadeLeftX: -72, facadeRightX: 86, modelScale: 0.9, modelYaw: 4, modelX: -12, modelY: 16 },
  { at: 0.67, roofY: -160, facadeLeftX: -82, facadeRightX: 96, modelScale: 1.16, modelYaw: 6, modelX: -26, modelY: 4 },
  { at: 0.77, roofY: -140, facadeLeftX: -68, facadeRightX: 84, modelScale: 1.12, modelYaw: 2, modelX: -20, modelY: 4 },
  { at: 0.87, roofY: 0, facadeLeftX: 0, facadeRightX: 0, modelScale: 0.78, modelYaw: -2, modelX: 0, modelY: 0 },
  { at: 1, roofY: 0, facadeLeftX: 0, facadeRightX: 0, modelScale: 0.68, modelYaw: 0, modelX: 0, modelY: 0 },
];

export function getAnimatedPose(value) {
  const progress = clampProgress(value);
  const rightIndex = keyframes.findIndex(frame => frame.at >= progress);
  const to = keyframes[Math.max(1, rightIndex)];
  const from = keyframes[Math.max(0, rightIndex - 1)];
  const amount = smooth((progress - from.at) / (to.at - from.at));
  const pose = {};
  for (const key of Object.keys(from)) {
    if (key !== 'at') pose[key] = mix(from[key], to[key], amount);
  }
  const first = transition(progress, 0.18, 0.25);
  const second = transition(progress, 0.53, 0.6);
  const third = transition(progress, 0.79, 0.86);
  const aerial = transition(progress, 0.81, 0.92);
  return {
    ...pose,
    progress,
    chapterIndex: progress < 0.215 ? 0 : progress < 0.565 ? 1 : progress < 0.825 ? 2 : 3,
    modelOpacity: 1 - aerial,
    coverOpacity: Math.max(1 - transition(progress, 0.13, 0.21), transition(progress, 0.865, 0.88)),
    aerialOpacity: aerial,
    aerialScale: mix(1.16, 1, transition(progress, 0.81, 1)),
    detailOpacity: transition(progress, 0.55, 0.65) * (1 - transition(progress, 0.75, 0.82)),
    copyOpacity: [1 - first, first * (1 - second), second * (1 - third), third],
  };
}

export function poseStyles(pose) {
  return {
    '--ae-roof-y': `${pose.roofY / SOURCE_HEIGHT * 100}%`,
    '--ae-facade-left-x': `${pose.facadeLeftX / SOURCE_WIDTH * 100}%`,
    '--ae-facade-right-x': `${pose.facadeRightX / SOURCE_WIDTH * 100}%`,
    '--ae-model-scale': String(pose.modelScale),
    '--ae-yaw': `${pose.modelYaw}deg`,
    '--ae-model-x': `${pose.modelX / SOURCE_WIDTH * 100}%`,
    '--ae-model-y': `${pose.modelY / SOURCE_HEIGHT * 100}%`,
    '--ae-model-opacity': String(pose.modelOpacity),
    '--ae-cover-opacity': String(pose.coverOpacity),
    '--ae-aerial-opacity': String(pose.aerialOpacity),
    '--ae-aerial-scale': String(pose.aerialScale),
    '--ae-detail-opacity': String(pose.detailOpacity),
    '--ae-progress': String(pose.progress),
    ...Object.fromEntries(pose.copyOpacity.map((opacity, index) => [`--ae-copy-${index}`, String(opacity)])),
  };
}
