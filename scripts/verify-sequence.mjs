import assert from 'node:assert/strict';
import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
await mkdir(new URL('../evidence/', import.meta.url), { recursive: true });
const directory = new URL('../public/assets/sequence/', import.meta.url);
const base = process.env.VERIFY_URL || 'http://localhost:5173';
const manifest = JSON.parse(await readFile(new URL('manifest.json', directory), 'utf8'));
assert.equal(manifest.frameCount, 32);
assert.equal(new Set(manifest.frames).size, 32);
let bytes = 0;
for (let offset = 0; offset < manifest.frames.length; offset += 8) {
  await Promise.all(manifest.frames.slice(offset, offset + 8).map(async file => {
    const [metadata, fileStat, response] = await Promise.all([
      sharp(await readFile(new URL(file, directory))).metadata(),
      stat(new URL(file, directory)),
      fetch(base + '/assets/sequence/' + file, { method: 'HEAD' }),
    ]);
    assert.equal(metadata.width, 1024);
    assert.equal(metadata.format, 'webp');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/webp');
    bytes += fileStat.size;
  }));
}
assert.equal(bytes, manifest.totalBytes);
const detail = await sharp(await readFile(new URL('detail.webp', directory))).metadata();
assert.equal(detail.width, 1600);
const result = { testedAt: new Date().toISOString(), passed: true, frames: 32, sequenceBytes: bytes, detailWidth: detail.width, checks: ['All 32 unique WebP frames decode and serve', 'Manifest byte count matches files', 'High-resolution material detail frame decodes'] };
await writeFile(new URL('../evidence/sequence-verification.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
