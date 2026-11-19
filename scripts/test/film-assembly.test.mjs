import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assembleConstructionFilm } from '../assemble-construction-film.mjs';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'grama-film-assembly-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const partsDirectory = join(directory, 'media');
  const publicDirectory = join(directory, 'public');
  await mkdir(partsDirectory);
  await mkdir(publicDirectory);
  const chunks = [Buffer.from('first native bytes\0'), Buffer.from([0, 255, 17, 12, 19, 28]), Buffer.from('final bytes, no encoding')];
  const film = Buffer.concat(chunks);
  const manifest = { version: 1, file: 'construction-film.mp4', bytes: film.length, sha256: sha256(film), parts: [] };
  for (const [index, bytes] of chunks.entries()) {
    const file = `part-${String(index).padStart(3, '0')}.bin`;
    await writeFile(join(partsDirectory, file), bytes);
    manifest.parts.push({ file, bytes: bytes.length, sha256: sha256(bytes) });
  }
  const manifestPath = join(partsDirectory, 'manifest.json');
  const runtimeManifestPath = join(publicDirectory, 'manifest.json');
  const outputPath = join(publicDirectory, 'construction-film.mp4');
  async function save() {
    await writeFile(manifestPath, JSON.stringify(manifest));
    await writeFile(runtimeManifestPath, JSON.stringify({ files: [{ file: manifest.file, bytes: manifest.bytes, sha256: manifest.sha256 }] }));
  }
  await save();
  return { partsDirectory, publicDirectory, manifest, film, save, options: { manifestPath, runtimeManifestPath, outputPath } };
}
async function noTemporaryFiles(fixture) {
  assert.ok((await readdir(fixture.publicDirectory)).every(name => !name.endsWith('.tmp')), 'Failed assembly must not leave a partial public file');
}

test('film parts reconstruct the exact original bytes and complete SHA256', async t => {
  const f = await fixture(t);
  const result = await assembleConstructionFilm(f.options);
  assert.equal(result.status, 'assembled');
  assert.equal(result.sha256, sha256(f.film));
  assert.deepEqual(await readFile(f.options.outputPath), f.film);
  await noTemporaryFiles(f);
});

test('a valid existing film is verified and retained without replacement', async t => {
  const f = await fixture(t);
  await writeFile(f.options.outputPath, f.film);
  const before = await stat(f.options.outputPath);
  const result = await assembleConstructionFilm(f.options);
  const after = await stat(f.options.outputPath);
  assert.equal(result.status, 'already-valid');
  assert.equal(after.ino, before.ino);
  assert.equal(after.mtimeMs, before.mtimeMs);
  assert.deepEqual(await readFile(f.options.outputPath), f.film);
});

test('corrupt committed parts fail even when a valid existing film could mask them', async t => {
  const f = await fixture(t);
  await writeFile(f.options.outputPath, f.film);
  const part = f.manifest.parts[1];
  await writeFile(join(f.partsDirectory, part.file), Buffer.alloc(part.bytes, 7));
  await assert.rejects(assembleConstructionFilm(f.options), /Film part SHA256 mismatch: part-001\.bin/);
  assert.deepEqual(await readFile(f.options.outputPath), f.film);
  await noTemporaryFiles(f);
});

test('missing parts fail with their filename and do not create partial output', async t => {
  const f = await fixture(t);
  await rm(join(f.partsDirectory, 'part-001.bin'));
  await assert.rejects(assembleConstructionFilm(f.options), /Missing film part: part-001\.bin/);
  assert.ok(!(await readdir(f.publicDirectory)).includes('construction-film.mp4'));
  await noTemporaryFiles(f);
});

test('a final hash mismatch cleans the temporary file and preserves existing output atomically', async t => {
  const f = await fixture(t);
  const previous = Buffer.from('previous complete version');
  await writeFile(f.options.outputPath, previous);
  f.manifest.sha256 = '0'.repeat(64);
  await f.save();
  await assert.rejects(assembleConstructionFilm(f.options), /Assembled film SHA256 mismatch/);
  assert.deepEqual(await readFile(f.options.outputPath), previous);
  await noTemporaryFiles(f);
});

test('an invalid cached film is replaced only after successful exact assembly', async t => {
  const f = await fixture(t);
  await writeFile(f.options.outputPath, Buffer.alloc(f.film.length, 0));
  const result = await assembleConstructionFilm(f.options);
  assert.equal(result.status, 'assembled');
  assert.deepEqual(await readFile(f.options.outputPath), f.film);
  await noTemporaryFiles(f);
});

test('runtime and parts manifests must agree before any public output changes', async t => {
  const f = await fixture(t);
  await writeFile(f.options.runtimeManifestPath, JSON.stringify({ files: [{ file: f.manifest.file, bytes: f.manifest.bytes, sha256: '0'.repeat(64) }] }));
  await assert.rejects(assembleConstructionFilm(f.options), /Parts and runtime manifests disagree/);
  assert.ok(!(await readdir(f.publicDirectory)).includes('construction-film.mp4'));
  await noTemporaryFiles(f);
});
