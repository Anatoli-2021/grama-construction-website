import { spawnSync } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile, stat, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(resolve(root, 'evidence'), { recursive: true });
const source = resolve(root, 'public/assets/residence-film.mp4');
const output = resolve(root, 'public/assets/sequence');
async function prepareDetail() {
  const target = resolve(output, 'detail.webp');
  try { await stat(target); return; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const masterPath = resolve(root, 'evidence/higgsfield-film-source.mp4');
  const master = await stat(masterPath).then(() => masterPath).catch(() => source);
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-ss', '4.9', '-i', master, '-frames:v', '1', '-vf', 'scale=1600:-2', '-c:v', 'libwebp', '-quality', '82', '-f', 'image2', target], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('High-resolution detail frame preparation failed.');
}
const sourceHash = createHash('sha256').update(await readFile(source)).digest('hex');
await mkdir(output, { recursive: true });
const existing = await readdir(output);
if (existing.includes('manifest.json')) {
  const manifest = JSON.parse(await readFile(resolve(output, 'manifest.json'), 'utf8'));
  if (manifest.sourceSha256 === sourceHash && manifest.frameCount === 32 && manifest.frames.every(file => existing.includes(file))) {
    await prepareDetail();
    console.log('Reusing the verified 32-frame architectural sequence.');
    process.exit(0);
  }
  throw new Error('A different sequence exists. Use a versioned output directory.');
}
if (existing.length) throw new Error('A partial sequence exists; inspect it before preparing a replacement.');
const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', source, '-vf', 'fps=6.4,scale=1024:-2', '-frames:v', '32', '-c:v', 'libwebp', '-quality', '66', '-compression_level', '5', '-f', 'image2', resolve(output, 'house-%03d.webp')], { stdio: 'inherit' });
if (result.status !== 0) throw new Error('Frame preparation failed.');
const frames = (await readdir(output)).filter(file => /^house-\d{3}\.webp$/.test(file)).sort();
if (frames.length !== 32) throw new Error('Expected exactly 32 frames; found ' + frames.length);
const bytes = (await Promise.all(frames.map(file => stat(resolve(output, file))))).reduce((sum, file) => sum + file.size, 0);
await prepareDetail();
const manifest = { frameCount: frames.length, width: 1024, sourceSha256: sourceHash, source: 'Existing five-second Higgsfield architectural concept film', provenance: 'AI-animated concept rendering; not construction footage', frames, totalBytes: bytes };
await writeFile(resolve(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(resolve(root, 'evidence', 'sequence-source.json'), JSON.stringify({ ...manifest, preparation: 'FFmpeg: fps=6.4, 1024px width, WebP quality66, 32 frames', sourceFile: 'public/assets/residence-film.mp4', paidGeneration: false, animationReference: 'https://royal-pop-website.vercel.app/' }, null, 2) + '\n');
console.log(JSON.stringify({ frameCount: frames.length, totalBytes: bytes, additionalPaidGeneration: false }));
