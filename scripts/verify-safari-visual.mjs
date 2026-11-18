// Actual Apple Safari coverage runs only on an isolated GitHub macOS runner.
// Never enable or launch WebDriver on a developer's/user's computer.
// Apple documents this native driver and its W3C HTTP interface:
// https://developer.apple.com/documentation/webkit/testing-with-webdriver-in-safari
// https://developer.apple.com/documentation/webkit/macos-webdriver-commands-for-safari-12-and-later
import assert from 'node:assert/strict';
import { openSync, closeSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { resolvePublicAnimationUrl } from './verify-windows-animation.mjs';
import { CONSTRUCTION_FRAME_COUNT, CONSTRUCTION_SHEET_COUNT } from '../src/components/construction-timeline.js';

const stages = ['land', 'community', 'approach', 'interior', 'structure', 'reassemble', 'reveal'];
const output = resolve(process.env.ANIMATION_EVIDENCE_DIR || join(os.tmpdir(), 'grama-actual-safari'));
const localOrigin = 'http://127.0.0.1:5193';
const driverOrigin = 'http://127.0.0.1:5194';
const keyValues = { PageDown: '\uE00F', PageUp: '\uE00E', ArrowDown: '\uE015', ArrowUp: '\uE013', Escape: '\uE00C' };
const paletteNames = ['paper', 'limestone', 'ink', 'charcoal', 'muted', 'bronze', 'on-dark', 'on-dark-muted'];
const report = {
  startedAt: new Date().toISOString(), commit: process.env.CANDIDATE_SHA || null,
  browserIdentity: 'Installed Apple Safari, driven by the Apple-provided /usr/bin/safaridriver; not Playwright WebKit',
  environment: { platform: process.platform, release: os.release(), version: os.version(), architecture: process.arch,
    runnerOS: process.env.RUNNER_OS || null, imageOS: process.env.ImageOS || null, imageVersion: process.env.ImageVersion || null, node: process.version },
  scope: 'Isolated CI desktop Safari, native WebDriver keyboard scrolling without Play, local and public staging; requested narrow native window records its actual viewport and is not an iOS-device test.',
  targets: [], visualChecks: [], passed: false,
};
let sessionId;
let driver;
let server;
const descriptors = [];

function errorDetails(error) { return { message: error.message, stack: error.stack }; }
async function webdriver(method, path, body, timeout = 45000) {
  const response = await fetch(driverOrigin + path, { method,
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(timeout) });
  const result = await response.json();
  if (!response.ok || result.value?.error) throw new Error(`Safari WebDriver ${method} ${path}: ${result.value?.error || response.status}: ${result.value?.message || 'Command failed'}`);
  return result.value;
}
const command = (method, path, body) => webdriver(method, `/session/${sessionId}${path}`, body);
const evaluate = (source, args = []) => command('POST', '/execute/sync', { script: typeof source === 'function' ? `return (${source.toString()})(...arguments);` : source, args });

async function until(description, callback, timeout = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const value = await callback();
    if (value) return value;
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  throw new Error(`Timed out waiting for ${description}`);
}
async function screenshot(name) {
  const encoded = await command('GET', '/screenshot');
  const bytes = Buffer.from(encoded, 'base64');
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG', 'Safari must return a real PNG screenshot');
  await writeFile(join(output, name), bytes);
  return bytes;
}
async function navigate(url) {
  await command('POST', '/url', { url });
  await until('document and fonts', () => evaluate(() => document.readyState === 'complete' && document.fonts.status === 'loaded'));
  await evaluate(() => {
    window.__gramaSafariErrors = [];
    addEventListener('error', event => window.__gramaSafariErrors.push(String(event.message || 'error')));
    addEventListener('unhandledrejection', event => window.__gramaSafariErrors.push(String(event.reason?.message || event.reason)));
  });
}
async function click(selector) {
  const element = await command('POST', '/element', { using: 'css selector', value: selector });
  const id = element['element-6066-11e4-a52e-4f735466cecf'];
  assert.ok(id, `Safari must resolve ${selector}`);
  await command('POST', `/element/${id}/click`, {});
}
async function pressKey(name) {
  const value = keyValues[name];
  assert.ok(value, 'Only the declared native navigation keys are used');
  await command('POST', '/actions', { actions: [{ type: 'key', id: 'native-keyboard', actions: [
    { type: 'keyDown', value }, { type: 'keyUp', value },
  ] }] });
}
async function canvasState() {
  return evaluate(() => {
    const canvas = document.querySelector('.ae-construction-sequence');
    const stage = document.querySelector('.ae-stage');
    const track = document.querySelector('.ae-scroll-track');
    if (!canvas || !stage || !track) return null;
    const style = getComputedStyle(canvas);
    const rect = canvas.getBoundingClientRect();
    let effectiveOpacity = 1;
    for (let node = canvas; node; node = node.parentElement) {
      const computed = getComputedStyle(node);
      if (computed.display === 'none' || computed.visibility !== 'visible') effectiveOpacity = 0;
      effectiveOpacity *= Number(computed.opacity);
    }
    // Sample a detached copy so repeated diagnostic readbacks cannot change
    // the live scene canvas's GPU/software rendering strategy under test.
    const diagnostic = document.createElement('canvas');
    diagnostic.width = canvas.width; diagnostic.height = canvas.height;
    const diagnosticContext = diagnostic.getContext('2d', { alpha: false, willReadFrequently: true });
    if (canvas.width && canvas.height) diagnosticContext.drawImage(canvas, 0, 0);
    const pixels = canvas.width && canvas.height ? diagnosticContext.getImageData(0, 0, canvas.width, canvas.height).data : [];
    let hash = 2166136261;
    let sum = 0;
    let squares = 0;
    let count = 0;
    for (let i = 0; i < pixels.length; i += 64) {
      const value = .2126 * pixels[i] + .7152 * pixels[i + 1] + .0722 * pixels[i + 2];
      sum += value; squares += value * value; count++;
      for (let channel = 0; channel < 3; channel++) hash = Math.imul(hash ^ pixels[i + channel], 16777619);
    }
    return { stage: canvas.dataset.stage, frame: Number(canvas.dataset.globalFrame), progress: Number(stage.dataset.progress),
      sequenceStatus: canvas.dataset.status, settled: canvas.dataset.settled === 'true', blend: Number(canvas.dataset.frameBlend || 0),
      decodedSheets: Number(canvas.dataset.decodedSheets), pendingSheets: Number(canvas.dataset.pendingSheets),
      visible: style.visibility === 'visible' && effectiveOpacity > .9 && rect.width > 0 && rect.height > 0,
      effectiveOpacity, visibleHeight: Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top)),
      width: canvas.width, height: canvas.height, sampledPixelSignature: (hash >>> 0).toString(16),
      canvasReadback: 'Detached diagnostic canvas; the live scene canvas is never read with getImageData',
      pixelVariance: count ? squares / count - (sum / count) ** 2 : 0,
      scrollY, trackEnd: track.getBoundingClientRect().top + scrollY + track.offsetHeight - innerHeight,
      viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
      userAgent: navigator.userAgent, prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      mode: document.querySelector('.animated-experience')?.dataset.mode,
      dialogs: document.querySelectorAll('dialog[open]').length,
      mp4Resources: performance.getEntriesByType('resource').filter(resource => /\.mp4(?:[?#]|$)/i.test(resource.name)).map(resource => resource.name),
      observedErrorsAfterHydration: window.__gramaSafariErrors || [],
    };
  });
}
async function readyCanvas() {
  return until('settled visible construction canvas', async () => {
    const state = await canvasState();
    return state?.sequenceStatus === 'ready' && state.settled && state.visible ? state : false;
  });
}
function assertCanvas(state) {
  assert.equal(state.mode, 'scroll', 'Safari must start in scroll mode without clicking Play');
  assert.equal(state.dialogs, 0);
  assert.equal(state.mp4Resources.length, 0, 'Natural Safari scrolling must not load an MP4');
  assert.equal(state.overflow, 0);
  assert.equal(state.blend, 0, 'A stopped camera must settle onto one authored frame');
  assert.ok(state.effectiveOpacity > .9 && state.visibleHeight > state.viewport.height * .7,
    'The actual Safari viewport must show the construction canvas, not only offscreen pixels');
  assert.ok(state.pixelVariance > 1, 'The Safari canvas must contain visible scene detail');
  assert.ok(stages.includes(state.stage) && state.frame >= 0 && state.frame < CONSTRUCTION_FRAME_COUNT);
  assert.ok(state.pendingSheets <= 2 && state.decodedSheets + state.pendingSheets <= 4);
  assert.deepEqual(state.observedErrorsAfterHydration, []);
}
async function scrollKey(name) {
  const before = await evaluate(() => scrollY);
  await pressKey(name);
  await until(`native ${name} document scroll`, () => evaluate(previous => Math.abs(scrollY - previous) > .5, [before]), 6000);
  return readyCanvas();
}
async function pixelsForComparison(bytes) {
  const { width, height } = await sharp(bytes).metadata();
  return sharp(bytes).extract({ left: Math.floor(width * .1), top: Math.floor(height * .2), width: Math.floor(width * .8), height: Math.floor(height * .53) }).removeAlpha().raw().toBuffer();
}
async function verifyAnimation(target) {
  const result = { ...target, captures: [], nativeInput: 'W3C keyboard PageDown/ArrowDown and PageUp/ArrowUp; no JavaScript scrolling or Play activation', passed: false };
  report.targets.push(result);
  try {
    await command('POST', '/window/rect', { x: 0, y: 0, width: 1440, height: 1000 });
    const manifestResponse = await fetch(new URL('/assets/construction/premium-v2/manifest.json', target.url));
    assert.ok(manifestResponse.ok, 'Safari target must serve the new versioned construction manifest');
    const manifest = await manifestResponse.json();
    assert.equal(manifest.frameCount, CONSTRUCTION_FRAME_COUNT);
    assert.equal(manifest.sheets, CONSTRUCTION_SHEET_COUNT);
    assert.equal(manifest.sourceFrameCount, 672);
    result.sampleManifest = { browserSamples: manifest.frameCount, sheetsPerVariant: manifest.sheets, nativeFrames: manifest.sourceFrameCount };
    await navigate(target.url);
    await until('construction scroll mode', () => evaluate(() => document.querySelector('.animated-experience')?.dataset.mode === 'scroll'));
    let state = await readyCanvas();
    assert.equal(state.frame, 0);
    assertCanvas(state);
    const initialPixels = await pixelsForComparison(await screenshot(`${target.name}-initial.png`));
    result.captures.push({ name: 'initial', ...state, screenshot: `${target.name}-initial.png` });
    const forward = new Set(['land']);
    for (let count = 0; state.frame < CONSTRUCTION_FRAME_COUNT - 1 && count < 100; count++) {
      const previous = state;
      state = await scrollKey(state.progress >= .85 ? 'ArrowDown' : 'PageDown');
      assertCanvas(state);
      assert.ok(state.frame >= previous.frame, 'Forward native keys must not reverse the scene');
      if (!forward.has(state.stage)) {
        forward.add(state.stage);
        const name = `${target.name}-forward-${state.stage}.png`;
        await screenshot(name);
        result.captures.push({ name: `forward-${state.stage}`, ...state, screenshot: name });
        assert.notEqual(state.sampledPixelSignature, previous.sampledPixelSignature, 'A new Safari chapter must change painted pixels');
      }
    }
    assert.equal(state.frame, CONSTRUCTION_FRAME_COUNT - 1, 'Native Safari scrolling must reach the completed final frame');
    assert.deepEqual([...forward], stages, 'Safari must visit every stage in order');
    const reverse = new Set(['reveal']);
    for (let count = 0; state.scrollY > 0 && count < 120; count++) {
      const previous = state;
      state = await scrollKey(state.progress < .15 ? 'ArrowUp' : 'PageUp');
      assertCanvas(state);
      assert.ok(state.frame <= previous.frame, 'Reverse native keys must not advance the scene');
      if (!reverse.has(state.stage)) {
        reverse.add(state.stage);
        const name = `${target.name}-reverse-${state.stage}.png`;
        await screenshot(name);
        result.captures.push({ name: `reverse-${state.stage}`, ...state, screenshot: name });
      }
    }
    assert.equal(state.scrollY, 0);
    assert.equal(state.frame, 0);
    assert.deepEqual([...reverse], [...stages].reverse(), 'Safari must reverse through every stage');
    const returned = await screenshot(`${target.name}-reverse-origin.png`);
    const returnedPixels = await pixelsForComparison(returned);
    assert.equal(returnedPixels.length, initialPixels.length);
    let maximum = 0;
    for (let i = 0; i < initialPixels.length; i++) maximum = Math.max(maximum, Math.abs(initialPixels[i] - returnedPixels[i]));
    result.reverseOriginMaximumChannelDifference = maximum;
    assert.ok(maximum <= 1, 'Native reverse scroll must restore each scene pixel within one 8-bit raster level');
    result.captures.push({ name: 'reverse-origin', ...state, screenshot: `${target.name}-reverse-origin.png` });
    result.observedViewport = state.viewport;
    result.userAgent = state.userAgent;
    result.prefersReducedMotion = state.prefersReducedMotion;
    await click('.ae-film-link');
    result.film = await until('actual Safari 1080p playback', () => evaluate(() => {
      const video = document.querySelector('.ae-film-dialog[open] video');
      if (video?.error) throw new Error(`Safari media decode error ${video.error.code}`);
      return video && video.readyState >= 2 && !video.paused && video.currentTime > 0
        ? { width: video.videoWidth, height: video.videoHeight, duration: video.duration, readyState: video.readyState, currentTime: video.currentTime, muted: video.muted, controls: video.controls, source: video.currentSrc } : null;
    }));
    assert.equal(result.film.width, 1920);
    assert.equal(result.film.height, 1080);
    assert.ok(Math.abs(result.film.duration - 28) < .2 && result.film.muted && result.film.controls);
    assert.match(result.film.source, /\/assets\/construction\/premium-v2\/construction-film\.mp4(?:[?#]|$)/);
    const seek = await evaluate(() => {
      const video = document.querySelector('.ae-film-dialog video');
      const targetTime = video.duration * .6;
      video.currentTime = targetTime;
      return targetTime;
    });
    result.film.seek = await until('Safari HTML media seek', () => evaluate(targetTime => {
      const video = document.querySelector('.ae-film-dialog video');
      return video && !video.error && !video.seeking && video.readyState >= 2 && Math.abs(video.currentTime - targetTime) < 1.5 ? { targetTime, actual: video.currentTime, method: 'HTMLMediaElement.currentTime; separate from native-keyboard scrolling' } : false;
    }, [seek]));
    await screenshot(`${target.name}-native-film.png`);
    await pressKey('Escape');
    await until('Safari film close and focus return', () => evaluate(() => !document.querySelector('.ae-film-dialog') && document.activeElement?.matches('.ae-film-link')));
    result.film.focusReturned = true;
    result.passed = true;
  } catch (error) {
    result.error = errorDetails(error);
    await screenshot(`${target.name}-failure.png`).catch(() => {});
  }
  console.log(JSON.stringify({ target: target.name, browser: 'actual-apple-safari', passed: result.passed, error: result.error?.message }));
}

function contrast(first, second) {
  function luminance(color) {
    let channels;
    if (/^#[\da-f]{6}$/i.test(color)) channels = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16));
    else {
      const match = color.match(/^rgb\(\s*(\d+)[, ]+(\d+)[, ]+(\d+)\s*\)$/);
      assert.ok(match, `Expected an opaque sRGB palette color: ${color}`);
      channels = match.slice(1).map(Number);
    }
    const linear = channels.map(channel => { const value = channel / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; });
    return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
  }
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
}
async function verifyLeadership(target, route, layout) {
  const url = new URL(route, target.url).href;
  const name = `${target.name}-${route === '/' ? 'home' : 'about'}-${layout.name}`;
  const result = { name, url, requestedWindow: layout.window,
    imageGeometry: 'visibleImage measures the overflow-clipped image intersection; image records the raw transformed image bounds.',
    viewportType: layout.name === 'narrow' ? 'Narrow native desktop Safari window; actual width recorded, not iOS emulation' : 'Native desktop Safari', passed: false };
  report.visualChecks.push(result);
  try {
    result.window = await command('POST', '/window/rect', layout.window);
    await navigate(url);
    await until('both leadership portraits loaded', () => evaluate(() => {
      const portraits = [...document.querySelectorAll('.family-portrait-frame img')];
      // Trigger lazy image loading as a separate layout inspection. The primary
      // animation tests above exclusively use native keyboard scrolling.
      document.querySelector('.family-section')?.scrollIntoView({ block: 'start', behavior: 'instant' });
      return portraits.length === 2 && portraits.every(image => image.complete && image.naturalWidth > 0);
    }));
    result.measurements = await evaluate(names => {
      const rect = element => { const bounds = element.getBoundingClientRect(); return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }; };
      const textStyle = element => { const style = getComputedStyle(element); return { family: style.fontFamily, size: style.fontSize, weight: style.fontWeight, lineHeight: style.lineHeight, color: style.color }; };
      const root = getComputedStyle(document.documentElement);
      return {
        viewport: { width: innerWidth, height: innerHeight, devicePixelRatio }, overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        palette: Object.fromEntries(names.map(name => [name, root.getPropertyValue(`--site-${name}`).trim()])),
        portraits: [...document.querySelectorAll('.family-portrait')].map(figure => {
          const frame = figure.querySelector('.family-portrait-frame'); const image = frame.querySelector('img'); const caption = figure.querySelector('.family-caption');
          const frameBounds = rect(frame); const imageBounds = rect(image);
          const frameStyle = getComputedStyle(frame); const imageStyle = getComputedStyle(image);
          const visibleX = Math.max(frameBounds.x, imageBounds.x); const visibleY = Math.max(frameBounds.y, imageBounds.y);
          return { frame: frameBounds, image: imageBounds,
            visibleImage: { x: visibleX, y: visibleY,
              width: Math.max(0, Math.min(frameBounds.x + frameBounds.width, imageBounds.x + imageBounds.width) - visibleX),
              height: Math.max(0, Math.min(frameBounds.y + frameBounds.height, imageBounds.y + imageBounds.height) - visibleY) },
            frameOverflow: { x: frameStyle.overflowX, y: frameStyle.overflowY },
            caption: rect(caption), source: image.getAttribute('src'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
            complete: image.complete, objectPosition: imageStyle.objectPosition, transform: imageStyle.transform, transformOrigin: imageStyle.transformOrigin,
            name: textStyle(caption.children[0]), role: textStyle(caption.children[1]), objectFit: imageStyle.objectFit };
        }),
      };
    }, [paletteNames]);
    const { portraits, palette } = result.measurements;
    assert.equal(result.measurements.overflow, 0);
    assert.equal(portraits.length, 2);
    for (const property of ['width', 'height']) {
      assert.ok(Math.abs(portraits[0].frame[property] - portraits[1].frame[property]) <= 1 && portraits[0].frame[property] > 0);
      assert.ok(Math.abs(portraits[0].visibleImage[property] - portraits[1].visibleImage[property]) <= 1);
      assert.ok(portraits.every(portrait => Math.abs(portrait.frame[property] - portrait.visibleImage[property]) <= 1));
    }
    for (const portrait of portraits) {
      assert.ok(['hidden', 'clip'].includes(portrait.frameOverflow.x) && ['hidden', 'clip'].includes(portrait.frameOverflow.y));
      assert.ok(portrait.image.x <= portrait.frame.x + 1 && portrait.image.y <= portrait.frame.y + 1
        && portrait.image.x + portrait.image.width >= portrait.frame.x + portrait.frame.width - 1
        && portrait.image.y + portrait.image.height >= portrait.frame.y + portrait.frame.height - 1,
      'The original portrait must cover every clipped frame edge');
      assert.ok(Math.abs(portrait.visibleImage.x - portrait.frame.x) <= 1 && Math.abs(portrait.visibleImage.y - portrait.frame.y) <= 1);
    }
    assert.ok(Math.abs(portraits[0].visibleImage.width / portraits[0].visibleImage.height - portraits[1].visibleImage.width / portraits[1].visibleImage.height) <= .005);
    if (Math.abs(portraits[0].frame.y - portraits[1].frame.y) < portraits[0].frame.height / 2) {
      assert.ok(Math.abs(portraits[0].frame.y - portraits[1].frame.y) <= 1);
      assert.ok(Math.abs(portraits[0].caption.y - portraits[1].caption.y) <= 1);
    } else assert.ok(Math.abs(portraits[0].frame.x - portraits[1].frame.x) <= 1);
    assert.ok(Math.abs(portraits[0].caption.width - portraits[1].caption.width) <= 1);
    assert.deepEqual(portraits[0].name, portraits[1].name);
    assert.deepEqual(portraits[0].role, portraits[1].role);
    assert.equal(portraits[0].source, '/assets/tony-grama.webp');
    assert.equal(portraits[1].source, route === '/about' ? '/assets/photo/alina-realtor.jpg' : '/assets/photo/alina-portrait.jpg');
    assert.ok(portraits.every(portrait => portrait.complete && portrait.objectFit === 'cover' && portrait.naturalWidth > 0 && portrait.naturalHeight > 0));
    assert.ok(paletteNames.every(name => palette[name]));
    const reference = report.visualChecks.find(check => check.passed)?.measurements.palette;
    if (reference) assert.deepEqual(palette, reference, 'Local/public Safari pages must share the same palette');
    result.contrast = [['ink', 'paper'], ['muted', 'paper'], ['bronze', 'paper'], ['muted', 'limestone'], ['on-dark', 'charcoal'], ['on-dark-muted', 'charcoal']].map(([foreground, background]) => ({ foreground, background, ratio: contrast(palette[foreground], palette[background]) }));
    assert.ok(result.contrast.every(pair => pair.ratio >= 4.5));
    result.narrowWindow = layout.name === 'narrow' ? { requestedOuterWidth: layout.window.width, measuredInnerWidth: result.measurements.viewport.width,
      requestMet: result.measurements.viewport.width <= layout.window.width, limitation: result.measurements.viewport.width > layout.window.width ? 'Safari/macOS minimum native window width; actual viewport retained in evidence' : null } : null;
    result.screenshot = `${name}.png`;
    await evaluate(() => document.querySelector('.family-portraits').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await screenshot(result.screenshot);
    result.passed = true;
  } catch (error) {
    result.error = errorDetails(error);
    await screenshot(`${name}-failure.png`).catch(() => {});
  }
  console.log(JSON.stringify({ visual: name, browser: 'actual-apple-safari', passed: result.passed, error: result.error?.message }));
}

async function main() {
  assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Actual Safari automation is CI-only; use CUA on the user computer');
  assert.equal(process.platform, 'darwin');
  assert.equal(process.env.RUNNER_OS, 'macOS');
  await mkdir(output, { recursive: true });
  try {
    const serverLog = openSync(join(output, 'local-server.log'), 'w'); descriptors.push(serverLog);
    const driverLog = openSync(join(output, 'safaridriver.log'), 'w'); descriptors.push(driverLog);
    server = spawn(process.execPath, ['scripts/serve-website.mjs'], { env: { ...process.env, PORT: '5193' }, stdio: ['ignore', serverLog, serverLog] });
    await until('local Safari test server', async () => {
      if (server.exitCode !== null) throw new Error(`Local server exited ${server.exitCode}`);
      try { return (await fetch(localOrigin + '/healthz')).ok; } catch { return false; }
    });
    driver = spawn('/usr/bin/safaridriver', ['-p', '5194'], { stdio: ['ignore', driverLog, driverLog] });
    await until('Apple safaridriver', async () => {
      if (driver.exitCode !== null) throw new Error(`Apple safaridriver exited ${driver.exitCode}`);
      try { return (await webdriver('GET', '/status')).ready !== false; } catch { return false; }
    });
    const session = await webdriver('POST', '/session', { capabilities: { alwaysMatch: { browserName: 'safari', acceptInsecureCerts: false } } }, 90000);
    sessionId = session.sessionId;
    assert.ok(sessionId, 'Apple driver must create a Safari session');
    report.capabilities = session.capabilities;
    assert.equal(String(session.capabilities.browserName).toLowerCase(), 'safari');
    assert.ok(session.capabilities.browserVersion, 'Actual Safari version must be reported');
    await command('POST', '/timeouts', { implicit: 0, pageLoad: 45000, script: 30000 });
    const targets = [
      { name: 'local-candidate', url: localOrigin + '/animated-experience' },
      { name: 'public-staging', url: resolvePublicAnimationUrl(process.env.PUBLIC_ANIMATION_URL) },
    ];
    for (const target of targets) await verifyAnimation(target);
    const layouts = [{ name: 'desktop', window: { x: 0, y: 0, width: 1440, height: 1000 } }, { name: 'narrow', window: { x: 0, y: 0, width: 390, height: 1000 } }];
    for (const target of targets) for (const route of ['/', '/about']) for (const layout of layouts) await verifyLeadership(target, route, layout);
    report.passed = report.targets.length === 2 && report.targets.every(target => target.passed)
      && report.visualChecks.length === 8 && report.visualChecks.every(check => check.passed);
  } catch (error) {
    report.error = errorDetails(error);
  } finally {
    if (sessionId) await webdriver('DELETE', `/session/${sessionId}`).catch(error => { report.cleanupError = error.message; });
    driver?.kill(); server?.kill();
    descriptors.forEach(descriptor => closeSync(descriptor));
    report.finishedAt = new Date().toISOString();
    await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ browser: 'actual-apple-safari', version: report.capabilities?.browserVersion, passed: report.passed, report: join(output, 'report.json'), error: report.error?.message }));
    if (!report.passed) process.exitCode = 1;
  }
}

await main();
