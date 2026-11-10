// Stable IDs prevent whitespace-only identities and broken exported row keys.
export function normalizeProjectId(value) {
  const id = String(value ?? '').trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(id)) {
    throw new Error('Use a Project ID of 1–80 letters, numbers, hyphens or underscores, starting with a letter or number.');
  }
  return id;
}
