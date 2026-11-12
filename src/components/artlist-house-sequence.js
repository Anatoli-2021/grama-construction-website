export const ARTLIST_SHEET_COLUMNS = 2;
export const ARTLIST_SHEET_ROWS = 5;
export const ARTLIST_SHEET_COUNT = 4;
export const ARTLIST_FRAME_COUNT = ARTLIST_SHEET_COLUMNS * ARTLIST_SHEET_ROWS * ARTLIST_SHEET_COUNT;
export const ARTLIST_FRAME_BASE = '/assets/animated/artlist-house';

export function clampSequenceProgress(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value)) : 0;
}

function smooth(value) {
  const t = clampSequenceProgress(value);
  return t * t * (3 - 2 * t);
}

// Native page progress -> forward take, held open view, reverse assembly.
export function getHouseClipProgress(value) {
  const progress = clampSequenceProgress(value);
  if (progress <= 0.08) return 0;
  if (progress < 0.42) return smooth((progress - 0.08) / 0.34);
  if (progress <= 0.75) return 1;
  if (progress < 0.87) return 1 - smooth((progress - 0.75) / 0.12);
  return 0;
}

export function getFrameBlend(value, count = ARTLIST_FRAME_COUNT) {
  const length = Number.isInteger(count) && count > 0 ? count : 1;
  const position = clampSequenceProgress(value) * (length - 1);
  const lower = Math.floor(position);
  return { lower, upper: Math.min(length - 1, lower + 1), blend: position - lower };
}

export function getFrameRect(index, width, height) {
  const frame = typeof index === 'number' && Number.isFinite(index)
    ? Math.max(0, Math.min(ARTLIST_FRAME_COUNT - 1, Math.trunc(index))) : 0;
  const perSheet = ARTLIST_SHEET_COLUMNS * ARTLIST_SHEET_ROWS;
  const local = frame % perSheet;
  return {
    sheetIndex: Math.floor(frame / perSheet),
    sx: (local % ARTLIST_SHEET_COLUMNS) * width,
    sy: Math.floor(local / ARTLIST_SHEET_COLUMNS) * height,
    width, height,
  };
}
