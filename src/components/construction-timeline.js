export const CONSTRUCTION_FRAME_COUNT = 336;
export const CONSTRUCTION_SHEET_COLUMNS = 2;
export const CONSTRUCTION_SHEET_ROWS = 2;
export const CONSTRUCTION_FRAMES_PER_SHEET = CONSTRUCTION_SHEET_COLUMNS * CONSTRUCTION_SHEET_ROWS;
export const CONSTRUCTION_SHEET_COUNT = Math.ceil(CONSTRUCTION_FRAME_COUNT / CONSTRUCTION_FRAMES_PER_SHEET);
// Keep the prior package intact for visitors with the earlier page still open.
export const CONSTRUCTION_ATLAS_BASE = '/assets/construction/premium-v2';
export const CONSTRUCTION_SIZES = {
  desktop: { width: 1440, height: 810 },
  mobile: { width: 768, height: 432 },
};

export const CONSTRUCTION_CHAPTERS = [
  { id: 'land', label: 'Land', target: 0, title: 'The land.', text: 'Before the first foundation.' },
  { id: 'community', label: 'Community', target: 1.5 / 7, title: 'A neighborhood takes shape.', text: 'Foundations, frames and homes across the site.' },
  { id: 'approach', label: 'Approach', target: 2.5 / 7, title: 'Come closer.', text: 'From the neighborhood to one residence.' },
  { id: 'interior', label: 'Interior', target: 3.5 / 7, title: 'Step inside.', text: 'Light, timber and the spaces within.' },
  { id: 'structure', label: 'Structure', target: 4.5 / 7, title: 'Beneath the surface.', text: 'An architectural cutaway of the same home.' },
  { id: 'reassemble', label: 'Reassembly', target: 5.5 / 7, title: 'Every layer, together.', text: 'The structure returns to its finished form.' },
  { id: 'reveal', label: 'Reveal', target: 1, title: 'Dexter Acres.', text: 'Fourteen planned homes. An architectural concept.' },
];

export function clampConstructionProgress(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value)) : 0;
}

// The camera and construction are already animated in the controlled source
// images. A linear global frame position preserves their timing and reversal.
export function getConstructionPose(value) {
  const progress = clampConstructionProgress(value);
  const position = progress * (CONSTRUCTION_FRAME_COUNT - 1);
  const frame = Math.floor(position);
  const stageIndex = Math.min(CONSTRUCTION_CHAPTERS.length - 1, Math.floor(progress * CONSTRUCTION_CHAPTERS.length));
  return {
    progress,
    frame,
    globalFrame: frame,
    upperFrame: Math.min(CONSTRUCTION_FRAME_COUNT - 1, frame + 1),
    blend: position - frame,
    stage: CONSTRUCTION_CHAPTERS[stageIndex].id,
    stageIndex,
    localProgress: clampConstructionProgress(progress * CONSTRUCTION_CHAPTERS.length - stageIndex),
  };
}

export function getConstructionFrameRect(value, width = CONSTRUCTION_SIZES.desktop.width, height = CONSTRUCTION_SIZES.desktop.height) {
  const frame = typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(CONSTRUCTION_FRAME_COUNT - 1, Math.trunc(value))) : 0;
  const frameWidth = typeof width === 'number' && Number.isFinite(width) && width > 0 ? Math.round(width) : CONSTRUCTION_SIZES.desktop.width;
  const frameHeight = typeof height === 'number' && Number.isFinite(height) && height > 0 ? Math.round(height) : CONSTRUCTION_SIZES.desktop.height;
  const local = frame % CONSTRUCTION_FRAMES_PER_SHEET;
  return {
    sheetIndex: Math.floor(frame / CONSTRUCTION_FRAMES_PER_SHEET),
    sx: (local % CONSTRUCTION_SHEET_COLUMNS) * frameWidth,
    sy: Math.floor(local / CONSTRUCTION_SHEET_COLUMNS) * frameHeight,
    width: frameWidth,
    height: frameHeight,
  };
}
