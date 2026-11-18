import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, lstat, mkdir, open, rename, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultManifest = resolve(root, 'media/construction-premium-v2/manifest.json');
const defaultOutput = resolve(root, 'public/assets/construction/premium-v2/construction-film.mp4');
const defaultRuntimeManifest = resolve(root, 'public/assets/construction/premium-v2/manifest.json');
const partLimit = 2 * 1024 * 1024;
const digestPattern = /^[a-f0-9]{64}$/;

async function hashFile(filename) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filename, { highWaterMark: 64 * 1024 })) hash.update(chunk);
  return hash.digest('hex');
}
function validateManifest(manifest) {
  assert.equal(manifest.version, 1, 'Unsupported film-parts manifest version');
  assert.equal(manifest.file, 'construction-film.mp4', 'Unexpected assembled film name');
  assert.ok(Number.isSafeInteger(manifest.bytes) && manifest.bytes > 0, 'Invalid assembled film byte length');
  assert.match(manifest.sha256, digestPattern, 'Invalid assembled film SHA256');
  assert.ok(Array.isArray(manifest.parts) && manifest.parts.length > 0 && manifest.parts.length <= 999, 'Invalid film part inventory');
  let bytes = 0;
  for (const [index, part] of manifest.parts.entries()) {
    assert.equal(part.file, `part-${String(index).padStart(3, '0')}.bin`, 'Film parts must have consecutive safe filenames');
    assert.ok(Number.isSafeInteger(part.bytes) && part.bytes > 0 && part.bytes <= partLimit, `Invalid length for film part ${part.file}`);
    assert.match(part.sha256, digestPattern, `Invalid SHA256 for film part ${part.file}`);
    bytes += part.bytes;
  }
  assert.equal(bytes, manifest.bytes, 'Film part byte lengths do not match the complete film');
}
async function verifyPart(directory, part) {
  const filename = resolve(directory, part.file);
  let info;
  try { info = await lstat(filename); }
  catch (error) { if (error.code === 'ENOENT') throw new Error(`Missing film part: ${part.file}`); throw error; }
  assert.ok(info.isFile() && !info.isSymbolicLink(), `Film part must be a regular file: ${part.file}`);
  assert.equal(info.size, part.bytes, `Film part length mismatch: ${part.file}`);
  assert.equal(await hashFile(filename), part.sha256, `Film part SHA256 mismatch: ${part.file}`);
}
async function writeAll(file, chunk) {
  let offset = 0;
  while (offset < chunk.length) {
    const { bytesWritten } = await file.write(chunk, offset, chunk.length - offset);
    assert.ok(bytesWritten > 0, 'Assembled film write made no progress');
    offset += bytesWritten;
  }
}

export async function assembleConstructionFilm({ manifestPath = defaultManifest, outputPath = defaultOutput,
  runtimeManifestPath = defaultRuntimeManifest } = {}) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  validateManifest(manifest);
  const runtime = JSON.parse(await readFile(runtimeManifestPath, 'utf8'));
  const film = runtime.files?.find(record => record.file === manifest.file);
  assert.ok(film, 'Runtime manifest must describe the assembled film');
  assert.equal(film.bytes, manifest.bytes, 'Parts and runtime manifests disagree on film byte length');
  assert.equal(film.sha256, manifest.sha256, 'Parts and runtime manifests disagree on the exact film SHA256');
  const directory = dirname(resolve(manifestPath));
  // Always verify committed parts, even when a valid local film already exists.
  // A cached output must not hide an incomplete or corrupt clean-build input.
  for (const part of manifest.parts) await verifyPart(directory, part);

  let existing;
  try { existing = await lstat(outputPath); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (existing) {
    assert.ok(existing.isFile() && !existing.isSymbolicLink(), 'Assembled film target must be a regular file');
    if (existing.size === manifest.bytes && await hashFile(outputPath) === manifest.sha256) {
      return { status: 'already-valid', bytes: manifest.bytes, sha256: manifest.sha256, parts: manifest.parts.length };
    }
  }
  await mkdir(dirname(outputPath), { recursive: true });
  const temporary = resolve(dirname(outputPath), `.construction-film-${randomUUID()}.tmp`);
  let handle;
  let committed = false;
  try {
    handle = await open(temporary, 'wx', 0o644);
    const totalHash = createHash('sha256');
    let totalBytes = 0;
    for (const part of manifest.parts) {
      const partHash = createHash('sha256');
      let partBytes = 0;
      for await (const chunk of createReadStream(resolve(directory, part.file), { highWaterMark: 64 * 1024 })) {
        partBytes += chunk.length;
        totalBytes += chunk.length;
        partHash.update(chunk);
        totalHash.update(chunk);
        await writeAll(handle, chunk);
      }
      assert.equal(partBytes, part.bytes, `Film part changed during assembly: ${part.file}`);
      assert.equal(partHash.digest('hex'), part.sha256, `Film part SHA256 changed during assembly: ${part.file}`);
    }
    assert.equal(totalBytes, manifest.bytes, 'Assembled film byte length mismatch');
    assert.equal(totalHash.digest('hex'), manifest.sha256, 'Assembled film SHA256 mismatch');
    await handle.sync();
    await handle.close();
    handle = undefined;
    // Same-directory rename is atomic: existing playback never sees a partial file.
    await rename(temporary, outputPath);
    committed = true;
    return { status: 'assembled', bytes: totalBytes, sha256: manifest.sha256, parts: manifest.parts.length };
  } finally {
    await handle?.close().catch(() => {});
    if (!committed) await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  assembleConstructionFilm().then(result => console.log(`Construction film ${result.status}: ${result.bytes} bytes; SHA256 ${result.sha256}; ${result.parts} verified parts.`))
    .catch(error => { console.error(`Unable to prepare construction film: ${error.message}`); process.exitCode = 1; });
}
