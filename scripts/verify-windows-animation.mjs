import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { openSync, closeSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { CONSTRUCTION_FRAME_COUNT, CONSTRUCTION_SHEET_COUNT } from '../src/components/construction-timeline.js';

// Runs only in remote CI during agent verification. Browser tools stay under
// RUNNER_TEMP; they are not website dependencies or public runtime assets.
const output = resolve(process.env.ANIMATION_EVIDENCE_DIR || join(os.tmpdir(), 'grama-animation'));
const channel = process.env.BROWSER_CHANNEL;
const viewport = { width: 1440, height: 900 };
const canvasSelector = '.ae-construction-sequence, .ae-artlist-sequence';
const constructionStages = ['land', 'community', 'approach', 'interior', 'structure', 'reassemble', 'reveal'];
const constructionCheckpoints = [23, 37, 51, 66, 80, 98];
const previousCheckpoints = [25, 40, 66, 80, 98];
const atlasRequest = /\/assets\/(?:construction(?:\/premium-v2)?|film\/(?:arrival|interior)|animated\/artlist-house)\/(?:desktop|mobile)\/sheet-\d+\.webp(?:[?#]|$)/;
const defaultPublicUrl = 'https://gramadevelopment.com/animated-experience';

export function resolvePublicAnimationUrl(value = defaultPublicUrl) {
  const url = new URL(value.trim() || defaultPublicUrl);
  const companyHost = ['gramadevelopment.com', 'www.gramadevelopment.com', 'gramaconstruction.com', 'www.gramaconstruction.com'].includes(url.hostname);
  const railwayHost = /^[a-z0-9][a-z0-9-]*\.up\.railway\.app$/i.test(url.hostname);
  assert.equal(url.protocol, 'https:', 'Public animation target must use HTTPS');
  assert.ok(companyHost || railwayHost, 'Public animation target must be a Grama domain or Railway public preview');
  assert.ok(!url.username && !url.password && !url.port && !url.search && !url.hash, 'Public animation URL must not contain credentials, a custom port, query parameters or a fragment');
  assert.ok(['/', '/animated-experience', '/animated-experience/'].includes(url.pathname), 'Public animation URL must point to the site root or Animated Experience page');
  url.pathname = '/animated-experience';
  return url.href;
}

export function resolvePublicAnimationSchema(value = 'auto') {
  const schema = value.trim() || 'auto';
  assert.ok(['auto', 'construction', 'journey', 'legacy'].includes(schema), 'Public animation schema must be auto, construction, journey or legacy');
  return schema;
}

export function resolveBrowserConfiguration(value, platform = process.platform) {
  assert.ok(['chrome', 'msedge', 'chrome-macos', 'webkit', 'firefox'].includes(value), 'BROWSER_CHANNEL must choose Windows Chrome/Edge or macOS Chrome/WebKit/Firefox');
  const windowsChannel = ['chrome', 'msedge'].includes(value);
  const engine = ['chrome', 'msedge', 'chrome-macos'].includes(value) ? 'chromium' : value;
  const requiredPlatform = windowsChannel ? 'win32' : 'darwin';
  assert.equal(platform, requiredPlatform, windowsChannel ? 'Chrome/Edge verification requires an actual Windows runner' : 'macOS browser verification requires an actual macOS runner');
  return {
    engine,
    launchChannel: value === 'chrome-macos' ? 'chrome' : windowsChannel ? value : null,
    headless: !windowsChannel,
    requiredPlatform,
    browserIdentity: value === 'chrome-macos' ? 'Installed Google Chrome stable channel on macOS, launched headless'
      : value === 'webkit' ? 'Playwright WebKit on macOS, launched headless; not the installed Apple Safari application'
        : value === 'firefox' ? 'Playwright Firefox on macOS, launched headless'
          : `Installed ${value} channel on Windows, launched headed`,
  };
}

// Pure evidence validation is importable without starting a browser.
export function assertSequenceCaptures(captures, schema) {
  if (schema !== 'construction') return assertPreviousSequenceCaptures(captures, schema);
  const byName = new Map(captures.map(capture => [capture.name, capture]));
  function sample(name) {
    const value = byName.get(name);
    assert.ok(value, `Missing native-wheel capture: ${name}`);
    assert.ok(Number.isInteger(value.globalFrame) && value.globalFrame >= 0 && value.globalFrame < CONSTRUCTION_FRAME_COUNT, `${name}: construction frame is outside the manifest`);
    assert.equal(value.frame, value.globalFrame, `${name}: global and painted frame metadata must agree`);
    assert.equal(value.settled, true, `${name}: an idle camera must finish on one authored frame`);
    assert.equal(value.frameBlend, 0, `${name}: resting architecture must not retain double outlines`);
    assert.equal(value.stageIndex, constructionStages.indexOf(value.stage), `${name}: stage metadata must agree`);
    assert.equal(value.phase, value.stage, `${name}: caption and painted construction stage must agree`);
    assert.ok(Number.isInteger(value.decodedSheets) && value.decodedSheets >= 0);
    assert.ok(Number.isInteger(value.pendingSheets) && value.pendingSheets >= 0 && value.pendingSheets <= 2);
    assert.ok(value.decodedSheets + value.pendingSheets <= 4, `${name}: decoded and pending sheets must share the four-image bound`);
    return value;
  }
  const initial = sample('initial');
  assert.equal(initial.globalFrame, 0);
  assert.equal(initial.stage, 'land');
  let previous = initial;
  for (const distance of [120, 240, 360]) {
    const value = sample(`wheel-${distance}px`);
    assert.ok(value.globalFrame > previous.globalFrame, 'Each early native wheel input must advance the construction camera without Play');
    assert.notEqual(value.canvasSha256, previous.canvasSha256, 'Early scroll must change painted pixels, not only counters');
    previous = value;
  }
  for (const [index, progress] of constructionCheckpoints.entries()) {
    const value = sample(`forward-${progress}`);
    assert.equal(value.stage, constructionStages[index + 1], 'Native scrolling must visit every construction stage');
    assert.ok(value.globalFrame > previous.globalFrame, 'Construction frames must advance through the seven stages');
    assert.notEqual(value.canvasSha256, previous.canvasSha256, 'Each construction stage must change actual painted pixels');
    previous = value;
  }
  for (const progress of constructionCheckpoints.slice(0, -1)) {
    const forward = sample(`forward-${progress}`);
    const reverse = sample(`reverse-${progress}`);
    assert.equal(reverse.globalFrame, forward.globalFrame, 'Reverse scrolling must revisit the same construction frame');
    assert.equal(reverse.stage, forward.stage, 'Reverse scrolling must revisit the same construction stage');
  }
  const closed = sample('reverse-closed');
  assert.equal(closed.globalFrame, 0);
  assert.equal(closed.stage, 'land');
  // Canvas readback backends can differ by one 8-bit channel level after
  // repeated reads. Spatial screenshot pixels are checked in verifyTarget.
}

function assertPreviousSequenceCaptures(captures, schema) {
  assert.ok(['journey', 'legacy'].includes(schema), 'Unrecognized animation schema');
  const byName = new Map(captures.map(capture => [capture.name, capture]));
  function sample(name) {
    const capture = byName.get(name);
    assert.ok(capture, `Missing native-wheel capture: ${name}`);
    assert.ok(Number.isInteger(capture.frame) && capture.frame >= 0 && capture.frame <= 39, `${name}: local frame must be 0–39`);
    if (schema === 'journey') {
      assert.ok(Number.isInteger(capture.globalFrame) && capture.globalFrame >= 0 && capture.globalFrame <= 119, `${name}: Journey global frame must be 0–119`);
      assert.equal(capture.globalFrame, ['arrival', 'interior', 'structure'].indexOf(capture.scene) * 40 + capture.frame, `${name}: scene and local/global frame metadata must agree`);
    }
    return capture;
  }
  const position = capture => schema === 'journey' ? capture.globalFrame : capture.frame;
  const initial = sample('initial');
  const quarter = sample('forward-25');
  const open = sample('forward-40');
  const structure = sample('forward-66');
  const late = sample('forward-80');
  const overview = sample('forward-98');
  const closed = sample('reverse-closed');
  assert.equal(position(initial), 0, 'Initial canvas must show the first frame');
  let previous = position(initial);
  for (const distance of [120, 240, 360]) {
    const capture = sample(`wheel-${distance}px`);
    assert.ok(position(capture) > previous, 'Each of the first three native wheel inputs must advance the film without Play');
    previous = position(capture);
  }
  assert.ok(position(quarter) > previous, 'Forward scrolling must continue beyond the initial wheel ticks');

  if (schema === 'journey') {
    assert.equal(initial.scene, 'arrival');
    assert.equal(quarter.scene, 'arrival');
    assert.equal(open.scene, 'interior', 'The interior scene must be reached at 40%');
    assert.equal(structure.scene, 'structure', 'The structural scene must be reached at 66%');
    assert.equal(late.scene, 'structure');
    assert.equal(overview.scene, 'structure');
    assert.equal(overview.phase, 'overview', 'The final chapter must show the neighborhood overview');
    assert.equal(position(overview), 119, 'The Journey must finish at global frame 119');
    for (const [first, second] of [[quarter, open], [open, structure], [structure, late], [late, overview]]) {
      assert.ok(position(second) > position(first), 'Journey global frames must advance through all three scenes');
      assert.notEqual(second.canvasSha256, first.canvasSha256, 'Each Journey scene or structural pose must change actual canvas pixels');
    }
  } else {
    assert.ok(quarter.frame > 0, 'Natural forward scrolling must advance the house film');
    assert.ok(open.frame >= 35 && open.frame > quarter.frame, 'The house must open by the Layers chapter');
    assert.equal(structure.frame, 39, 'Structure must hold the open final frame');
    assert.ok(late.frame > 0 && late.frame < structure.frame, 'The legacy film must reassemble before the neighborhood view');
    assert.equal(overview.frame, 0, 'The legacy neighborhood chapter holds the assembled frame');
    assert.equal(overview.phase, 'neighborhood');
  }
  for (const progress of [80, 66, 40, 25]) {
    const forward = sample(`forward-${progress}`);
    const reverse = sample(`reverse-${progress}`);
    assert.ok(Math.abs(position(reverse) - position(forward)) <= 2, 'Reverse scrolling must return through the same film poses');
    if (schema === 'journey') assert.equal(reverse.scene, forward.scene, 'Reverse scrolling must revisit the same scene');
  }
  assert.equal(position(closed), 0);
  assert.equal(closed.canvasSha256, initial.canvasSha256, 'Reverse scrolling must restore the original canvas pixels');
  assert.notEqual(open.canvasSha256, initial.canvasSha256, 'Canvas pixels must change, not just the frame counter');
}

const report = {
  startedAt: new Date().toISOString(),
  commit: process.env.CANDIDATE_SHA || process.env.GITHUB_SHA || null,
  environment: {
    platform: process.platform, release: os.release(), version: os.version(), architecture: process.arch,
    runnerOS: process.env.RUNNER_OS || null, imageOS: process.env.ImageOS || null,
    imageVersion: process.env.ImageVersion || null, node: process.version,
  },
  requestedBrowserChannel: channel,
  engine: null,
  headed: null,
  headless: null,
  viewport,
  reducedMotionContext: 'no-preference',
  interaction: 'Primary desktop checks use native mouse wheel only, without Play, chapters, range or scripted scrolling. Separate checks exercise reduced motion, poster failure, deliberate film playback and emulated touch/keyboard controls.',
  targets: [], candidateChecks: [], mobileChecks: [], visualChecks: [],
};
const sha256 = value => createHash('sha256').update(value).digest('hex');
const errorDetails = error => ({ message: error.message, stack: error.stack });
let browser;
let server;
let serverLog;

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(`Local website server exited with ${server.exitCode}`);
    try {
      const response = await fetch('http://127.0.0.1:5189/healthz');
      if (response.ok && await response.text() === 'ok') return;
    } catch { /* Wait only for this test's local server to start. */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Local website health check did not become ready');
}

async function settlePaint(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function waitForCanvas(page) {
  await page.locator(`${canvasSelector.split(', ').map(selector => selector + '[data-status="ready"]').join(', ')}`).waitFor({ state: 'visible', timeout: 45000 });
  if (await page.locator('.ae-construction-sequence').count()) {
    await page.locator('.ae-construction-sequence[data-status="ready"][data-settled="true"]').waitFor({ state: 'visible', timeout: 45000 });
  }
  await settlePaint(page);
}

async function canvasState(page) {
  return page.evaluate(async selector => {
    const stage = document.querySelector('.ae-stage');
    const canvas = document.querySelector(selector);
    const rect = canvas.getBoundingClientRect();
    const style = getComputedStyle(canvas);
    function effectiveOpacity(element) {
      let opacity = 1;
      for (let node = element; node; node = node.parentElement) {
        const computed = getComputedStyle(node);
        if (computed.display === 'none' || computed.visibility !== 'visible') return 0;
        opacity *= Number(computed.opacity);
      }
      return opacity;
    }
    const overview = document.querySelector('.journey-overview, .ae-aerial');
    const overviewImage = overview?.querySelector('img');
    // Reading the live canvas repeatedly makes Chromium switch its renderer
    // from GPU to CPU. Inspect a detached readback copy so measurement leaves
    // the product's rendering backend unchanged throughout the wheel journey.
    const readback = document.createElement('canvas');
    readback.width = canvas.width;
    readback.height = canvas.height;
    const readbackContext = readback.getContext('2d', { alpha: false, willReadFrequently: true });
    readbackContext.drawImage(canvas, 0, 0);
    const pixels = readbackContext.getImageData(0, 0, readback.width, readback.height);
    const digest = await crypto.subtle.digest('SHA-256', pixels.data);
    let sum = 0;
    let squares = 0;
    let samples = 0;
    for (let index = 0; index < pixels.data.length; index += 64) {
      const luminance = .2126 * pixels.data[index] + .7152 * pixels.data[index + 1] + .0722 * pixels.data[index + 2];
      sum += luminance;
      squares += luminance * luminance;
      samples++;
    }
    const meanLuminance = sum / samples;
    return {
      scrollY, progress: Number(stage.dataset.progress), phase: stage.dataset.phase,
      mode: document.querySelector('.animated-experience').dataset.mode,
      sequenceStatus: canvas.dataset.status, artlistStatus: canvas.dataset.status,
      frame: Number(canvas.dataset.frame),
      settled: canvas.dataset.settled === 'true',
      frameBlend: Number(canvas.dataset.frameBlend || 0),
      globalFrame: canvas.dataset.globalFrame === undefined ? null : Number(canvas.dataset.globalFrame),
      scene: canvas.dataset.scene || canvas.dataset.stage || null,
      sceneIndex: canvas.dataset.sceneIndex === undefined ? null : Number(canvas.dataset.sceneIndex),
      stage: canvas.dataset.stage || null,
      stageIndex: canvas.dataset.stageIndex === undefined ? null : Number(canvas.dataset.stageIndex),
      clipProgress: Number(canvas.dataset.clipProgress), variant: canvas.dataset.variant,
      decodedSheets: Number(canvas.dataset.decodedSheets), pendingSheets: Number(canvas.dataset.pendingSheets),
      canvasSha256: [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join(''),
      canvasReadback: 'detached copy with willReadFrequently; live canvas is not read',
      canvas: {
        width: canvas.width, height: canvas.height, x: rect.x, y: rect.y,
        cssWidth: rect.width, cssHeight: rect.height, visibility: style.visibility,
        effectiveOpacity: effectiveOpacity(canvas), meanLuminance,
        pixelVariance: Math.max(0, squares / samples - meanLuminance * meanLuminance),
      },
      overview: { effectiveOpacity: overview ? effectiveOpacity(overview) : 0, imageLoaded: Boolean(overviewImage?.complete && overviewImage.naturalWidth > 0) },
      overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      viewport: { innerWidth, clientWidth: document.documentElement.clientWidth, innerHeight },
      dialogCount: document.querySelectorAll('dialog').length,
    };
  }, canvasSelector);
}

function assertCacheBound(state) {
  assert.ok(Number.isInteger(state.decodedSheets) && state.decodedSheets >= 0);
  assert.ok(Number.isInteger(state.pendingSheets) && state.pendingSheets >= 0 && state.pendingSheets <= 2);
  assert.ok(state.decodedSheets + state.pendingSheets <= 4, 'Decoded and pending construction images must share the four-reference cap');
}

async function pixelEvidence(png, schema = 'legacy') {
  const region = schema === 'construction'
    ? { left: .1, top: .2, width: .8, height: .53, label: 'central scene, x=10–90% and y=20–73% of viewport' }
    : { left: .55, top: .25, width: .4, height: .57, label: 'right-side architecture, x=55–95% and y=25–82% of viewport' };
  const { data, info } = await sharp(png).extract({
    left: Math.floor(viewport.width * region.left), top: Math.floor(viewport.height * region.top),
    width: Math.floor(viewport.width * region.width), height: Math.floor(viewport.height * region.height),
  }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let brightPixels = 0;
  let totalLuminance = 0;
  let squares = 0;
  const pixels = info.width * info.height;
  for (let index = 0; index < data.length; index += info.channels) {
    const luminance = .2126 * data[index] + .7152 * data[index + 1] + .0722 * data[index + 2];
    totalLuminance += luminance;
    squares += luminance * luminance;
    if (luminance > 100) brightPixels++;
  }
  const meanLuminance = totalLuminance / pixels;
  return {
    raw: data,
    metrics: {
      region: region.label, width: info.width, height: info.height, sha256: sha256(data),
      brightPixelFraction: brightPixels / pixels, meanLuminance,
      pixelVariance: Math.max(0, squares / pixels - meanLuminance * meanLuminance),
    },
  };
}

function imageDifference(first, second) {
  assert.equal(first.length, second.length);
  let absoluteDifference = 0;
  let changedPixels = 0;
  let maxChannelDifference = 0;
  for (let index = 0; index < first.length; index += 3) {
    const red = Math.abs(first[index] - second[index]);
    const green = Math.abs(first[index + 1] - second[index + 1]);
    const blue = Math.abs(first[index + 2] - second[index + 2]);
    maxChannelDifference = Math.max(maxChannelDifference, red, green, blue);
    const difference = (red + green + blue) / 3;
    absoluteDifference += difference;
    if (difference > 12) changedPixels++;
  }
  return { meanAbsoluteChannelDifference: absoluteDifference / (first.length / 3), changedPixelFraction: changedPixels / (first.length / 3), maxChannelDifference };
}

function observePage(page, result) {
  page.on('pageerror', error => result.pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') result.consoleErrors.push(message.text()); });
  page.on('request', request => {
    if (result.atlasRequests && atlasRequest.test(request.url())) result.atlasRequests.push(request.url());
    if (/\.mp4(?:[?#]|$)/i.test(request.url())) result.mp4Requests.push(request.url());
  });
}
async function verifyTarget(target) {
  const result = { ...target, captures: [], cacheSamples: [], pageErrors: [], consoleErrors: [], requestFailures: [], assetFailures: [], mp4Requests: [], passed: false };
  report.targets.push(result);
  const directory = join(output, target.name);
  await mkdir(directory, { recursive: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'no-preference', locale: 'en-US' });
  const page = await context.newPage();
  observePage(page, result);
  page.on('requestfailed', request => result.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('response', response => {
    if (response.status() >= 400 && /\.(?:webp|png|js|css)(?:[?#]|$)/i.test(response.url())) result.assetFailures.push({ url: response.url(), status: response.status() });
  });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
  const imageData = new Map();

  async function wheel(delta) {
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, delta);
    await page.waitForFunction(previous => Math.abs(scrollY - previous) > .5 || (previous > 0 && scrollY === 0), before, { timeout: 5000 });
    await settlePaint(page);
    if (result.schema === 'construction') {
      const state = await page.locator('.ae-construction-sequence').evaluate(canvas => ({ decodedSheets: Number(canvas.dataset.decodedSheets), pendingSheets: Number(canvas.dataset.pendingSheets) }));
      assertCacheBound(state);
      result.cacheSamples.push(state);
    }
  }

  async function wheelToProgress(progress) {
    const geometry = await page.evaluate(() => {
      const track = document.querySelector('.ae-scroll-track');
      return { top: track.getBoundingClientRect().top + scrollY, distance: Math.max(1, track.offsetHeight - innerHeight) };
    });
    // Reversal compares exact painted frames, so revisit the same attainable
    // CSS pixel rather than opposite sides of a nearest-frame threshold.
    const targetY = progress === 0 ? 0 : Math.round(geometry.top + geometry.distance * progress);
    for (let count = 0; count < 120; count++) {
      const current = await page.evaluate(() => scrollY);
      if (progress === 0 ? current === 0 : Math.abs(targetY - current) <= .5) return;
      await wheel(progress === 0 ? -120 : Math.max(-120, Math.min(120, targetY - current)));
    }
    throw new Error(`Native wheel did not reach progress ${progress}`);
  }

  async function capture(name) {
    await waitForCanvas(page);
    const state = await canvasState(page);
    const file = `${name}.png`;
    const screenshot = await page.screenshot({ path: join(directory, file), type: 'png', animations: 'allow' });
    const { raw, metrics } = await pixelEvidence(screenshot, result.schema);
    imageData.set(name, raw);
    const captured = { name, screenshot: `${target.name}/${file}`, ...state, visibleModel: metrics };
    result.captures.push(captured);
    assert.equal(state.mode, 'scroll', 'Scroll animation must be active without clicking Play');
    assert.equal(state.sequenceStatus, 'ready', 'The requested canvas pose must be fully decoded');
    assert.equal(state.canvas.visibility, 'visible');
    assert.ok(state.canvas.width > 0 && state.canvas.height > 0 && state.canvas.cssWidth > 0 && state.canvas.cssHeight > 0, 'Canvas must have a visible painted area');
    if (result.schema === 'construction') {
      assertCacheBound(state);
      assert.ok(state.canvas.effectiveOpacity > .9, 'The controlled construction canvas stays visible through the final reveal');
      assert.ok(state.canvas.pixelVariance > 1, 'A construction view must contain painted scene detail rather than uniform black pixels');
    } else if (state.progress < .81) {
      assert.ok(state.canvas.effectiveOpacity > .9, 'The canvas remains visible during house chapters');
    } else if (state.progress >= .97) {
      assert.ok(state.overview.effectiveOpacity > .9 && state.overview.imageLoaded, 'The older overview must show the loaded neighborhood image');
      assert.ok(state.canvas.effectiveOpacity < .1, 'The older model yields to its separate overview');
    }
    assert.equal(state.overflow, 0, 'Animation page must not overflow horizontally');
    assert.equal(state.dialogCount, 0, 'Native wheel verification must not open the video dialog');
    return captured;
  }

  try {
    const response = await page.goto(target.url, { waitUntil: 'networkidle', timeout: 45000 });
    assert.ok(response?.ok(), 'Animation HTML must load successfully');
    result.html = { status: response.status(), url: response.url(), sha256: sha256(await response.body()) };
    await page.locator('.animated-experience[data-mode="scroll"]').waitFor({ timeout: 30000 });
    const declared = await page.locator('.animated-experience').getAttribute('data-experience');
    assert.ok(!declared || ['journey', 'construction'].includes(declared), 'The public page declares an unsupported animation experience');
    result.schema = declared || 'legacy';
    if (target.expectedSchema !== 'auto') assert.equal(result.schema, target.expectedSchema, 'The target must serve the expected animation schema');
    await waitForCanvas(page);
    result.browserEnvironment = await page.evaluate(async () => {
      let renderer = null;
      let vendor = null;
      try {
        const gl = document.createElement('canvas').getContext('webgl');
        const extension = gl?.getExtension('WEBGL_debug_renderer_info');
        if (extension) { renderer = gl.getParameter(extension.UNMASKED_RENDERER_WEBGL); vendor = gl.getParameter(extension.UNMASKED_VENDOR_WEBGL); }
      } catch { /* WebGL diagnostics are optional; the product uses Canvas2D. */ }
      return {
        userAgent: navigator.userAgent, platform: navigator.platform,
        userAgentData: typeof navigator.userAgentData?.getHighEntropyValues === 'function' ? await navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'bitness']) : null,
        prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, renderer, vendor,
      };
    });
    await page.mouse.move(viewport.width * .8, viewport.height * .5);
    const initial = await capture('initial');
    assert.equal(initial.frame, 0);
    for (let tick = 1; tick <= 3; tick++) {
      await wheel(120);
      await capture(`wheel-${tick * 120}px`);
    }
    const checkpoints = result.schema === 'construction' ? constructionCheckpoints : previousCheckpoints;
    for (const progress of checkpoints) {
      await wheelToProgress(progress / 100);
      await capture(`forward-${progress}`);
    }
    for (const progress of checkpoints.slice(0, -1).reverse()) {
      await wheelToProgress(progress / 100);
      await capture(`reverse-${progress}`);
    }
    await wheelToProgress(0);
    await capture('reverse-closed');
    assertSequenceCaptures(result.captures, result.schema);
    const representative = result.schema === 'construction' ? 'forward-66' : 'forward-40';
    result.visibleOpening = imageDifference(imageData.get('initial'), imageData.get(representative));
    result.visibleReturn = imageDifference(imageData.get('initial'), imageData.get('reverse-closed'));
    assert.ok(result.visibleOpening.changedPixelFraction > .02 && result.visibleOpening.meanAbsoluteChannelDifference > 1, 'The visible scene must change beyond incidental interface noise');
    if (result.schema === 'construction') {
      result.originReadback = {
        exactCanvasHash: initial.canvasSha256 === result.captures.at(-1).canvasSha256,
        permittedScreenshotChannelDifference: 1,
        measuredMaximum: result.visibleReturn.maxChannelDifference,
      };
      assert.ok(result.visibleReturn.maxChannelDifference <= 1, 'Reverse scrolling must restore the original scene within one 8-bit raster level at every compared channel');
      const names = ['initial', ...constructionCheckpoints.map(progress => `forward-${progress}`)];
      result.visibleStageChanges = names.slice(1).map((name, index) => ({ from: names[index], to: name, ...imageDifference(imageData.get(names[index]), imageData.get(name)) }));
      for (const change of result.visibleStageChanges) assert.ok(change.changedPixelFraction > .005 && change.meanAbsoluteChannelDifference > .5, `${change.from} → ${change.to} must visibly change the construction scene`);
    } else {
      const opened = result.captures.find(capture => capture.name === 'forward-40');
      const overview = result.captures.find(capture => capture.name === 'forward-98');
      assert.ok(initial.visibleModel.brightPixelFraction > .02 && opened.visibleModel.brightPixelFraction > .02, 'The older house must remain visible in its architecture region');
      assert.ok(overview.visibleModel.brightPixelFraction > .02, 'The older overview must remain visible');
      if (result.schema === 'journey') {
        result.visibleSceneChanges = [[25, 40], [40, 66], [80, 98]].map(([from, to]) => ({ from, to, ...imageDifference(imageData.get(`forward-${from}`), imageData.get(`forward-${to}`)) }));
        for (const change of result.visibleSceneChanges) assert.ok(change.changedPixelFraction > .02 && change.meanAbsoluteChannelDifference > 1, 'The older journey must visibly change between scenes');
      }
    }
    assert.equal(result.mp4Requests.length, 0, 'Native scrolling must not request or play the MP4');
    assert.deepEqual(result.pageErrors, [], 'Browser JavaScript must not fail');
    assert.deepEqual(result.assetFailures, [], 'Animation assets must not return HTTP errors');
    result.passed = true;
  } catch (error) {
    result.error = errorDetails(error);
    await page.screenshot({ path: join(directory, 'failure.png'), type: 'png' }).catch(() => {});
  } finally {
    await context.tracing.stop({ path: join(directory, 'trace.zip') }).catch(error => { result.traceError = error.message; });
    await context.close();
    console.log(JSON.stringify({ target: result.name, schema: result.schema, browser: channel, passed: result.passed, captures: result.captures.map(({ name, progress, frame, globalFrame, stage, scene }) => ({ name, progress, frame, globalFrame, stage, scene })), error: result.error?.message }));
  }
}
async function runCandidateCheck(target, collection, name, options, exercise, allowFilm = false) {
  const result = { name, url: target.url, ...options.evidence, pageErrors: [], consoleErrors: [], atlasRequests: [], mp4Requests: [], passed: false };
  collection.push(result);
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'no-preference', locale: 'en-US', ...options.context });
  const page = await context.newPage();
  observePage(page, result);
  try {
    await exercise(page, result);
    assert.deepEqual(result.pageErrors, [], 'Alternative interactions must not cause browser JavaScript errors');
    if (!allowFilm) assert.equal(result.mp4Requests.length, 0, 'This check must not request or autoplay an MP4');
    result.passed = true;
  } catch (error) {
    result.error = errorDetails(error);
    const directory = join(output, name);
    await mkdir(directory, { recursive: true });
    await page.screenshot({ path: join(directory, 'failure.png'), type: 'png' }).catch(() => {});
  } finally {
    await context.close();
    console.log(JSON.stringify({ candidateCheck: name, browser: channel, passed: result.passed, error: result.error?.message }));
  }
}

async function loadConstruction(page, target) {
  const response = await page.goto(target.url, { waitUntil: 'networkidle', timeout: 45000 });
  assert.ok(response?.ok(), 'Candidate construction HTML must load');
  await page.locator('.animated-experience[data-experience="construction"]').waitFor({ timeout: 30000 });
  await page.waitForFunction(() => [...document.querySelectorAll('.ae-view-options button')].some(button => !button.disabled));
}

async function verifyCandidateFallbacks(target) {
  await runCandidateCheck(target, report.candidateChecks, 'candidate-reduced-motion', {
    context: { reducedMotion: 'reduce' }, evidence: { reducedMotion: 'reduce' },
  }, async (page, result) => {
    await loadConstruction(page, target);
    await page.locator('.animated-experience[data-mode="stills"]').waitFor();
    assert.ok(await page.locator('.ae-storyboard').isVisible(), 'Reduced motion must initially show the stills');
    assert.equal(await page.locator('.ae-storyboard figure').count(), 7, 'All seven construction stages remain available');
    assert.equal(result.atlasRequests.length, 0, 'Initial reduced motion must load no construction atlases');
    result.initialMode = 'stills';
    result.initialAtlasRequests = result.atlasRequests.length;
    await page.getByRole('button', { name: 'Enable scroll animation', exact: true }).click();
    await page.locator('.animated-experience[data-mode="scroll"]').waitFor();
    await waitForCanvas(page);
    await page.mouse.move(viewport.width * .8, viewport.height * .5);
    await page.mouse.wheel(0, 120);
    await page.waitForFunction(() => Number(document.querySelector('.ae-construction-sequence')?.dataset.globalFrame) > 0);
    await waitForCanvas(page);
    const optedIn = await canvasState(page);
    assertCacheBound(optedIn);
    assert.equal(optedIn.stage, 'land', 'Explicit motion opt-in restores the Land stage');
    result.optIn = { status: optedIn.sequenceStatus, stage: optedIn.stage, globalFrame: optedIn.globalFrame };
    // Reapplying the same preference does not produce a new media-query event.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
    await settlePaint(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.animated-experience[data-mode="stills"]').waitFor();
    await page.locator('.ae-construction-sequence[data-status="idle"]').waitFor({ state: 'attached' });
    assert.equal(await page.locator('.ae-construction-sequence').isVisible(), false, 'Reduced motion keeps the idle canvas hidden');
    const released = await page.locator('.ae-construction-sequence').evaluate(canvas => ({ decodedSheets: Number(canvas.dataset.decodedSheets), pendingSheets: Number(canvas.dataset.pendingSheets) }));
    assert.deepEqual(released, { decodedSheets: 0, pendingSheets: 0 }, 'Returning to stills releases all construction image references');
    assert.ok(await page.locator('.ae-storyboard').isVisible());
    assert.ok(await page.getByRole('button', { name: 'Enable scroll animation', exact: true }).isEnabled());
    result.preferenceResetMode = 'stills';
    result.released = released;
  });

  await runCandidateCheck(target, report.candidateChecks, 'candidate-atlas-failure', { evidence: { reducedMotion: 'no-preference' } }, async (page, result) => {
    result.abortedAtlases = [];
    await page.route(/\/assets\/construction(?:\/premium-v2)?\/(?:desktop|mobile)\/sheet-0\.webp(?:[?#]|$)/, route => {
      result.abortedAtlases.push(route.request().url());
      return route.abort('failed');
    });
    await loadConstruction(page, target);
    await page.locator('.ae-construction-sequence[data-status="error"]').waitFor({ state: 'attached', timeout: 30000 });
    assert.ok(result.abortedAtlases.length > 0, 'The current required atlas was deliberately blocked');
    await page.waitForFunction(() => {
      const image = document.querySelector('.ce-poster');
      return image?.complete && image.naturalWidth > 0 && Number(getComputedStyle(image).opacity) > .9;
    });
    result.poster = await page.locator('.ce-poster').evaluate(image => ({
      loaded: image.complete && image.naturalWidth > 0, opacity: Number(getComputedStyle(image).opacity),
      visibility: getComputedStyle(image).visibility, width: image.getBoundingClientRect().width, height: image.getBoundingClientRect().height,
    }));
    assert.ok(result.poster.loaded && result.poster.opacity > .9 && result.poster.visibility === 'visible' && result.poster.width > 0 && result.poster.height > 0, 'A failed atlas leaves the loaded poster visible');
    const { metrics } = await pixelEvidence(await page.screenshot({ type: 'png' }), 'construction');
    result.visiblePoster = metrics;
    assert.ok(metrics.pixelVariance > 1, 'The fallback must paint a scene rather than a uniform blank area');
    assert.ok(await page.getByRole('button', { name: 'View stills', exact: true }).isVisible());
    assert.ok(await page.locator('.ae-film-link').isVisible(), 'Deliberate native film playback remains available');
    assert.ok(await page.locator('.ce-load-message').isVisible(), 'The failed view is explained');
    await page.getByRole('button', { name: 'View stills', exact: true }).click();
    await page.locator('.animated-experience[data-mode="stills"]').waitFor();
    assert.ok(await page.locator('.ae-storyboard').isVisible());
    assert.equal(await page.locator('.ae-storyboard figure').count(), 7);
    result.fallbackMode = 'stills';
  });

  await runCandidateCheck(target, report.candidateChecks, 'candidate-native-film', {
    evidence: { deliberatePlayback: true, seekMethod: 'Native HTML media seeking, separate from wheel-only checks' },
  }, async (page, result) => {
    await loadConstruction(page, target);
    await waitForCanvas(page);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    const pausedProgress = await page.locator('.ae-stage').getAttribute('data-progress');
    await page.mouse.move(viewport.width * .8, viewport.height * .5);
    await page.mouse.wheel(0, 120);
    await page.waitForFunction(() => scrollY > 0);
    await settlePaint(page);
    assert.equal(await page.locator('.ae-stage').getAttribute('data-progress'), pausedProgress, 'Pause freezes the construction pose while the document still scrolls');
    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    await page.waitForFunction(() => Number(document.querySelector('.ae-stage')?.dataset.progress) > 0);
    await waitForCanvas(page);
    result.pauseResume = { pausedProgress: Number(pausedProgress), resumedFrame: (await canvasState(page)).globalFrame };
    assert.ok(result.pauseResume.resumedFrame > 0);
    await page.getByRole('button', { name: 'View stills', exact: true }).click();
    await page.locator('.animated-experience[data-mode="stills"]').waitFor();
    assert.equal(await page.locator('.ae-storyboard figure').count(), 7);
    await page.waitForFunction(() => document.activeElement?.matches('.ae-view-options button')
      && document.activeElement.textContent.trim() === 'Enable scroll animation');
    result.stillsFocusReturned = await page.getByRole('button', { name: 'Enable scroll animation', exact: true }).evaluate(button => button === document.activeElement);
    assert.equal(result.stillsFocusReturned, true, 'View stills must hand keyboard focus to Enable scroll animation');
    await page.getByRole('button', { name: 'Enable scroll animation', exact: true }).click();
    await page.waitForFunction(() => Number(document.querySelector('.ae-construction-sequence')?.dataset.globalFrame) === 0);
    await waitForCanvas(page);
    await page.locator('.ae-chapters button').nth(0).press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('.ae-construction-sequence')?.dataset.stage === 'community');
    await waitForCanvas(page);
    await page.locator('.ae-chapters button').nth(1).press('Home');
    await page.waitForFunction(() => Number(document.querySelector('.ae-construction-sequence')?.dataset.globalFrame) === 0);
    await waitForCanvas(page);
    result.keyboardChapters = true;
    assert.equal(result.mp4Requests.length, 0, 'The native film is not requested before its link is activated');
    result.requestsBeforeActivation = 0;
    await page.locator('.ae-film-link').click();
    await page.locator('.ae-film-dialog[open]').waitFor();
    await page.waitForFunction(() => {
      const video = document.querySelector('.ae-film-dialog video');
      return video && !video.error && video.readyState >= 2 && !video.paused && video.currentTime > 0;
    }, null, { timeout: 45000 });
    result.media = await page.locator('.ae-film-dialog video').evaluate(video => ({
      readyState: video.readyState, paused: video.paused, muted: video.muted, controls: video.controls,
      width: video.videoWidth, height: video.videoHeight, duration: video.duration, source: video.currentSrc,
    }));
    assert.ok(result.media.muted && result.media.controls);
    const manifestResponse = await fetch(new URL('/assets/construction/premium-v2/manifest.json', target.url));
    assert.ok(manifestResponse.ok, 'The versioned source/render manifest must be served');
    const manifest = await manifestResponse.json();
    assert.equal(manifest.frameCount, CONSTRUCTION_FRAME_COUNT);
    assert.equal(manifest.sheets, CONSTRUCTION_SHEET_COUNT);
    assert.equal(manifest.sourceFrameCount, 672, 'The entire continuous 672-frame source render must be retained');
    assert.equal(manifest.inputFrames.length, manifest.sourceFrameCount);
    assert.ok(manifest.inputFrames.every((frame, index) => frame.frame === index + 1
      && frame.width >= 1920 && frame.height >= 1080 && /^[a-f0-9]{64}$/.test(frame.sha256)),
    'Every native source frame must be authored at 1080p or higher and individually inventoried');
    assert.ok(manifest.film.size[0] >= 1920 && manifest.film.size[1] >= 1080, 'The film must be encoded at native 1080p or higher');
    assert.equal(result.media.width, manifest.film.size[0]);
    assert.equal(result.media.height, manifest.film.size[1]);
    assert.ok(Number.isFinite(result.media.duration) && Math.abs(result.media.duration - manifest.film.seconds) < .2,
      'The decoded native film must match the full source timeline');
    assert.equal(manifest.film.frames, manifest.sourceFrameCount);
    assert.ok(Math.abs(manifest.film.frames / manifest.film.fps - manifest.film.seconds) < .01);
    assert.match(result.media.source, /\/assets\/construction\/premium-v2\/construction-film\.mp4(?:[?#]|$)/);
    result.sourceRender = { sourceFrames: manifest.sourceFrameCount, size: manifest.film.size,
      browserSamples: manifest.frameCount, seconds: manifest.film.seconds,
      nativeFramesInventoried: manifest.inputFrames.length, cacheVersion: 'premium-v2' };
    const seekTarget = await page.locator('.ae-film-dialog video').evaluate(video => {
      const targetTime = Math.min(video.duration - .3, video.duration * .6);
      video.currentTime = targetTime;
      return targetTime;
    });
    await page.waitForFunction(targetTime => {
      const video = document.querySelector('.ae-film-dialog video');
      return video && !video.error && !video.seeking && video.readyState >= 2 && Math.abs(video.currentTime - targetTime) < 1.5;
    }, seekTarget, { timeout: 30000 });
    result.seek = { target: seekTarget, actual: await page.locator('.ae-film-dialog video').evaluate(video => video.currentTime) };
    await page.keyboard.press('Escape');
    await page.locator('.ae-film-dialog').waitFor({ state: 'detached' });
    result.focusReturned = await page.evaluate(() => document.activeElement?.matches('.ae-film-link'));
    assert.equal(result.focusReturned, true);
    assert.ok(result.mp4Requests.length > 0, 'The deliberate playback check actually requested the film');
  }, true);
}

async function verifyMobileContexts(target, devices) {
  const definitions = [];
  if (channel === 'webkit') {
    for (const name of ['iPhone 13', 'iPad Mini']) {
      assert.ok(devices[name], `The pinned Playwright device registry must contain ${name}`);
      const { defaultBrowserType, ...parameters } = devices[name];
      definitions.push({ name: name === 'iPhone 13' ? 'mobile-safari-emulation' : 'tablet-safari-emulation', preset: name, parameters });
    }
  } else if (channel === 'chrome') {
    assert.ok(devices['Pixel 5'], 'The pinned Playwright device registry must contain Pixel 5');
    const { defaultBrowserType, ...parameters } = devices['Pixel 5'];
    definitions.push({ name: 'mobile-android-emulation', preset: 'Pixel 5', parameters });
    definitions.push({ name: 'tablet-android-emulation', preset: 'Android Chrome parameters with 1024×768 tablet viewport', parameters: { ...parameters, viewport: { width: 1024, height: 768 }, screen: { width: 1024, height: 768 } } });
  }
  if (definitions.length) definitions.push({ name: 'compact-phone-emulation', preset: '320×480 short phone viewport', parameters: { ...definitions[0].parameters, viewport: { width: 320, height: 480 }, screen: { width: 320, height: 480 } } });
  report.mobileCoverage = { type: 'Browser/device emulation; not physical iPhone, Android or tablet hardware', inputs: 'Emulated touch taps and keyboard range controls; no physical touch-swipe claim', expectedContexts: definitions.length };
  for (const definition of definitions) {
    await runCandidateCheck(target, report.mobileChecks, definition.name, {
      context: { ...definition.parameters, deviceScaleFactor: 1 },
      evidence: { emulated: true, preset: definition.preset, engine: report.engine, parameters: { ...definition.parameters, deviceScaleFactor: 1 } },
    }, async (page, result) => {
      async function captureMobile(label) {
        const file = `${definition.name}-${label}.png`;
        await page.screenshot({ path: join(output, file), type: 'png', animations: 'allow' });
        (result.screenshots ||= []).push({ label, file });
      }
      await loadConstruction(page, target);
      await waitForCanvas(page);
      const initial = await canvasState(page);
      assert.equal(initial.globalFrame, 0);
      assert.equal(initial.stage, 'land');
      assert.equal(initial.variant, initial.viewport.innerWidth <= 600 ? 'mobile' : 'desktop');
      await captureMobile('initial');
      result.controlsWithinViewport = await page.locator('.ae-scroll-controls').evaluate(controls => {
        const rect = controls.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight + 1 && rect.left >= 0 && rect.right <= window.innerWidth + 1;
      });
      assert.equal(result.controlsWithinViewport, true, 'Phone and tablet chapter/range controls remain inside the visible stage');
      assert.equal(initial.overflow, 0);
      assertCacheBound(initial);
      assert.equal(await page.locator('.ae-chapters button').count(), 7);
      result.touchControls = await page.locator('.ae-chapters button').evaluateAll(buttons => buttons.map(button => ({
        label: button.getAttribute('aria-label') || button.textContent.trim(), width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height,
      })));
      assert.ok(result.touchControls.every(control => control.width >= 24 && control.height >= 40), 'Emulated chapter controls retain usable touch areas');
      await page.locator('.ae-chapters button').nth(3).tap();
      await page.waitForFunction(() => document.querySelector('.ae-construction-sequence')?.dataset.stage === 'interior');
      await waitForCanvas(page);
      const interior = await canvasState(page);
      assert.equal(interior.stage, 'interior');
      assert.notEqual(interior.canvasSha256, initial.canvasSha256);
      assert.equal(interior.overflow, 0);
      assertCacheBound(interior);
      await captureMobile('interior');
      const range = page.getByRole('slider', { name: 'Experience progress', exact: true });
      await range.press('End');
      await page.waitForFunction(lastFrame => Number(document.querySelector('.ae-construction-sequence')?.dataset.globalFrame) === lastFrame,
        CONSTRUCTION_FRAME_COUNT - 1);
      await waitForCanvas(page);
      const reveal = await canvasState(page);
      assert.equal(reveal.stage, 'reveal');
      assertCacheBound(reveal);
      await captureMobile('reveal');
      await range.press('Home');
      await page.waitForFunction(() => Number(document.querySelector('.ae-construction-sequence')?.dataset.globalFrame) === 0);
      await waitForCanvas(page);
      const returned = await canvasState(page);
      assert.equal(returned.canvasSha256, initial.canvasSha256, 'Emulated controls return to the original land pixels');
      assertCacheBound(returned);
      result.poses = [initial, interior, reveal, returned].map(({ stage, globalFrame, variant, overflow, decodedSheets, pendingSheets }) => ({ stage, globalFrame, variant, overflow, decodedSheets, pendingSheets }));
      await page.getByRole('button', { name: 'View stills', exact: true }).tap();
      await page.locator('.animated-experience[data-mode="stills"]').waitFor();
      assert.equal(await page.locator('.ae-storyboard figure').count(), 7);
      result.stills = 7;
      await captureMobile('stills');
    });
  }
}

const originalPortraits = {
  '/assets/tony-grama.webp': '57d296a30dbf5053d38f41e36fe120b0dd4f4d5828d1af70509f9e1538ffe4d4',
  '/assets/photo/alina-portrait.jpg': 'cdb327d837e267ce7d04567c5c32fb108b11bcd0d95535f379c6647453daeb1c',
  '/assets/photo/alina-realtor.jpg': '673d19ce4b1b4b0740729f4c9475f27e03c78866fe4a1ed7bc9ad4741bc72883',
};
const paletteNames = ['paper', 'white', 'limestone', 'sand', 'ink', 'charcoal', 'muted', 'bronze', 'bronze-light', 'line', 'on-dark', 'on-dark-muted'];

function contrastRatio(first, second) {
  function luminance(color) {
    const value = color.trim();
    let rgb;
    if (/^#[a-f\d]{6}$/i.test(value)) rgb = [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16));
    else {
      const match = value.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
      assert.ok(match && (match[4] === undefined || Number(match[4]) === 1), `Contrast requires an opaque sRGB color: ${value}`);
      rgb = match.slice(1, 4).map(Number);
    }
    const linear = rgb.map(channel => {
      const component = channel / 255;
      return component <= .04045 ? component / 12.92 : ((component + .055) / 1.055) ** 2.4;
    });
    return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
  }
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
}

async function verifySiteRefinement(target) {
  const layouts = [
    { name: 'desktop', viewport: { width: 1440, height: 900 } },
    { name: 'tablet', viewport: { width: 768, height: 1024 } },
    { name: 'phone', viewport: { width: 390, height: 844 } },
    { name: 'compact', viewport: { width: 320, height: 568 } },
  ];
  const routes = ['/', '/about', '/developments', '/projects', '/partnerships', '/animated-experience', '/contact', '/projects/dexter-acres'];
  const portraitResponses = new Map();
  let referencePalette;
  report.visualCoverage = {
    scope: 'Rendered local candidate after refinement only; screenshots are not claimed as before/after pairs or physical-device captures.',
    leadershipRoutes: ['/', '/about'], layouts, paletteRoutes: routes,
    paletteLayouts: ['desktop', 'phone'], expectedChecks: 24,
    portraitToleranceCssPixels: 1, normalTextContrastMinimum: 4.5,
    portraitImageGeometry: 'visibleImage is the intersection of the transformed image and its overflow-clipped frame; image retains the raw transformed bounds for crop documentation.',
  };
  for (const route of ['/', '/about']) {
    for (const layout of layouts) {
      const targetPage = { ...target, url: new URL(route, target.url).href };
      const name = `visual-leadership-${route === '/' ? 'home' : 'about'}-${layout.name}`;
      await runCandidateCheck(targetPage, report.visualChecks, name, {
        context: { viewport: layout.viewport, reducedMotion: 'reduce' },
        evidence: { route, viewport: layout.viewport, comparison: 'Equal side-by-side or stacked portrait frames in the same rendered candidate' },
      }, async (page, result) => {
        const response = await page.goto(targetPage.url, { waitUntil: 'networkidle', timeout: 45000 });
        assert.ok(response?.ok(), 'Leadership page must load');
        const section = page.locator('.family-section');
        await section.scrollIntoViewIfNeeded();
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => {
          const images = [...document.querySelectorAll('.family-portraits img')];
          return images.length === 2 && images.every(image => image.complete && image.naturalWidth > 0);
        });
        result.measurements = await page.locator('.family-portraits').evaluate(container => {
          const bounds = element => {
            const rect = element.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          };
          const typography = element => {
            const style = getComputedStyle(element);
            return { fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight, color: style.color };
          };
          return {
            overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
            background: getComputedStyle(container.closest('.family-section')).backgroundColor,
            portraits: [...container.querySelectorAll(':scope > figure.family-portrait')].map(figure => {
              const frame = figure.querySelector('.family-portrait-frame');
              const image = frame?.querySelector('img');
              const caption = figure.querySelector('.family-caption');
              if (!frame || !image || !caption || caption.children.length !== 2) return { missingSharedStructure: true };
              const style = getComputedStyle(image);
              const frameStyle = getComputedStyle(frame);
              const frameBounds = bounds(frame);
              const imageBounds = bounds(image);
              const visibleX = Math.max(frameBounds.x, imageBounds.x);
              const visibleY = Math.max(frameBounds.y, imageBounds.y);
              const visibleImage = { x: visibleX, y: visibleY,
                width: Math.max(0, Math.min(frameBounds.x + frameBounds.width, imageBounds.x + imageBounds.width) - visibleX),
                height: Math.max(0, Math.min(frameBounds.y + frameBounds.height, imageBounds.y + imageBounds.height) - visibleY) };
              return { frame: frameBounds, image: imageBounds, visibleImage, caption: bounds(caption),
                frameOverflow: { x: frameStyle.overflowX, y: frameStyle.overflowY },
                source: image.getAttribute('src'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
                complete: image.complete, objectFit: style.objectFit, objectPosition: style.objectPosition,
                transform: style.transform, transformOrigin: style.transformOrigin,
                visibility: style.visibility, opacity: Number(style.opacity),
                name: typography(caption.children[0]), role: typography(caption.children[1]) };
            }),
          };
        });
        const { portraits, overflow } = result.measurements;
        assert.equal(overflow, 0, 'Leadership layout must not overflow horizontally');
        assert.equal(portraits.length, 2, 'Both leaders use the same figure structure');
        assert.ok(portraits.every(item => !item.missingSharedStructure));
        const [tony, alina] = portraits;
        for (const dimension of ['width', 'height']) {
          assert.ok(tony.frame[dimension] > 0 && Math.abs(tony.frame[dimension] - alina.frame[dimension]) <= 1,
            `Portrait frame ${dimension} must be equal within one CSS pixel`);
          assert.ok(Math.abs(tony.visibleImage[dimension] - alina.visibleImage[dimension]) <= 1,
            `Clipped visible image ${dimension} must be equal within one CSS pixel`);
          assert.ok(portraits.every(item => Math.abs(item.frame[dimension] - item.visibleImage[dimension]) <= 1),
            'Both visible images must fill their equally sized editorial frames');
        }
        for (const portrait of portraits) {
          assert.ok(['hidden', 'clip'].includes(portrait.frameOverflow.x) && ['hidden', 'clip'].includes(portrait.frameOverflow.y),
            'The measured editorial frame must actually clip any transformed image overflow');
          assert.ok(portrait.image.x <= portrait.frame.x + 1 && portrait.image.y <= portrait.frame.y + 1
            && portrait.image.x + portrait.image.width >= portrait.frame.x + portrait.frame.width - 1
            && portrait.image.y + portrait.image.height >= portrait.frame.y + portrait.frame.height - 1,
          'Each original image must cover all four clipping-frame edges without gaps');
          assert.ok(Math.abs(portrait.visibleImage.x - portrait.frame.x) <= 1 && Math.abs(portrait.visibleImage.y - portrait.frame.y) <= 1,
            'Each visible image must align with its clipping frame');
        }
        assert.ok(Math.abs(tony.frame.width / tony.frame.height - alina.frame.width / alina.frame.height) <= .005);
        assert.ok(Math.abs(tony.visibleImage.width / tony.visibleImage.height - alina.visibleImage.width / alina.visibleImage.height) <= .005);
        if (Math.abs(tony.frame.y - alina.frame.y) < tony.frame.height / 2) {
          assert.ok(Math.abs(tony.frame.y - alina.frame.y) <= 1, 'Side-by-side portraits must align at the top');
          assert.ok(Math.abs(tony.caption.y - alina.caption.y) <= 1, 'Side-by-side captions must share a baseline area');
        } else assert.ok(Math.abs(tony.frame.x - alina.frame.x) <= 1, 'Stacked portraits must share the same left alignment');
        assert.deepEqual(tony.name, alina.name, 'Names must receive identical type treatment');
        assert.deepEqual(tony.role, alina.role, 'Roles must receive identical type treatment');
        assert.ok(Math.abs(tony.caption.width - alina.caption.width) <= 1, 'Caption areas must have equal width');
        result.captionContrast = portraits.map(portrait => ({
          name: contrastRatio(portrait.name.color, result.measurements.background),
          role: contrastRatio(portrait.role.color, result.measurements.background),
        }));
        assert.ok(result.captionContrast.every(pair => pair.name >= 4.5 && pair.role >= 4.5),
          'Actual rendered leadership names and roles must meet normal-text AA contrast');
        assert.equal(tony.source, '/assets/tony-grama.webp');
        assert.equal(alina.source, route === '/about' ? '/assets/photo/alina-realtor.jpg' : '/assets/photo/alina-portrait.jpg');
        result.originalSourceHashes = [];
        for (const portrait of portraits) {
          assert.ok(portrait.complete && portrait.naturalWidth > 0 && portrait.naturalHeight > 0);
          assert.equal(portrait.objectFit, 'cover');
          assert.equal(portrait.visibility, 'visible');
          assert.equal(portrait.opacity, 1);
          const imageUrl = new URL(portrait.source, targetPage.url).href;
          if (!portraitResponses.has(imageUrl)) {
            const image = await fetch(imageUrl);
            assert.ok(image.ok, 'Original portrait must be served');
            portraitResponses.set(imageUrl, sha256(Buffer.from(await image.arrayBuffer())));
          }
          assert.equal(portraitResponses.get(imageUrl), originalPortraits[portrait.source], 'Portrait source bytes must remain unchanged; no facial reconstruction');
          result.originalSourceHashes.push({ source: portrait.source, sha256: portraitResponses.get(imageUrl) });
        }
        result.screenshot = `${name}.png`;
        await section.screenshot({ path: join(output, result.screenshot), animations: 'disabled' });
      });
    }
  }
  for (const route of routes) {
    for (const layout of [layouts[0], layouts[2]]) {
      const targetPage = { ...target, url: new URL(route, target.url).href };
      const slug = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
      const name = `visual-palette-${slug}-${layout.name}`;
      await runCandidateCheck(targetPage, report.visualChecks, name, {
        context: { viewport: layout.viewport, reducedMotion: 'reduce' },
        evidence: { route, viewport: layout.viewport, contrastScope: 'Opaque design-token text/surface pairs, not a full automated WCAG audit of text over photography' },
      }, async (page, result) => {
        const response = await page.goto(targetPage.url, { waitUntil: 'networkidle', timeout: 45000 });
        assert.ok(response?.ok(), 'Public page must load');
        await page.locator('.site-footer').waitFor({ state: 'attached' });
        await page.evaluate(() => document.fonts.ready);
        result.rendered = await page.evaluate(names => {
          const root = getComputedStyle(document.documentElement);
          return {
            overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
            tokens: Object.fromEntries(names.map(name => [name, root.getPropertyValue(`--site-${name}`).trim()])),
            surfaces: [...document.querySelectorAll('body, .site-header, .site-footer, main, .company-page, .ae-stage')].map(element => {
              const style = getComputedStyle(element);
              return { selector: element.tagName.toLowerCase() + (element.className ? '.' + String(element.className).trim().split(/\s+/).join('.') : ''), color: style.color, background: style.backgroundColor };
            }),
          };
        }, paletteNames);
        assert.equal(result.rendered.overflow, 0, `${route}: page must not overflow at ${layout.viewport.width}px`);
        assert.ok(paletteNames.every(name => result.rendered.tokens[name]), 'Every page must expose the complete shared architectural palette');
        referencePalette ||= result.rendered.tokens;
        assert.deepEqual(result.rendered.tokens, referencePalette, 'All public pages and responsive layouts must use the same palette tokens');
        result.contrast = [['ink', 'paper'], ['muted', 'paper'], ['bronze', 'paper'], ['ink', 'limestone'], ['muted', 'limestone'], ['on-dark', 'charcoal'], ['on-dark-muted', 'charcoal']]
          .map(([foreground, background]) => ({ foreground, background, ratio: contrastRatio(result.rendered.tokens[foreground], result.rendered.tokens[background]) }));
        assert.ok(result.contrast.every(pair => pair.ratio >= 4.5), 'Shared normal-text color pairs must meet WCAG AA contrast');
        result.screenshot = `${name}.png`;
        await page.screenshot({ path: join(output, result.screenshot), type: 'png', animations: 'disabled' });
      }, true);
    }
  }
}

async function main() {
  await mkdir(output, { recursive: true });
  try {
    const publicUrl = resolvePublicAnimationUrl(process.env.PUBLIC_ANIMATION_URL);
    const publicSchema = resolvePublicAnimationSchema(process.env.PUBLIC_ANIMATION_SCHEMA);
    report.publicTarget = { url: publicUrl, expectedSchema: publicSchema };
    const configuration = resolveBrowserConfiguration(channel);
    report.engine = configuration.engine;
    report.headless = configuration.headless;
    report.headed = !configuration.headless;
    report.launchChannel = configuration.launchChannel;
    report.browserIdentity = configuration.browserIdentity;
    assert.ok(process.env.PLAYWRIGHT_MODULE_PATH, 'Isolated Playwright module path is required');
    const playwright = await import(pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href);
    serverLog = openSync(join(output, 'local-server.log'), 'w');
    server = spawn(process.execPath, ['scripts/serve-website.mjs'], { env: { ...process.env, PORT: '5189' }, stdio: ['ignore', serverLog, serverLog], windowsHide: true });
    await waitForServer();
    browser = await playwright[configuration.engine].launch({
      ...(configuration.launchChannel ? { channel: configuration.launchChannel } : {}),
      headless: configuration.headless,
    });
    report.browserVersion = browser.version();
    if (configuration.engine === 'chromium') {
      const session = await browser.newBrowserCDPSession();
      report.browserProtocolVersion = await session.send('Browser.getVersion');
      await session.detach();
    }
    const candidate = { name: 'local-candidate', url: 'http://127.0.0.1:5189/animated-experience', expectedSchema: 'construction' };
    await verifyTarget(candidate);
    await verifyTarget({ name: 'public-domain', url: publicUrl, expectedSchema: publicSchema });
    await verifyCandidateFallbacks(candidate);
    await verifyMobileContexts(candidate, playwright.devices);
    await verifySiteRefinement(candidate);
    report.passed = report.targets.length === 2 && report.targets.every(target => target.passed)
      && report.candidateChecks.length === 3 && report.candidateChecks.every(check => check.passed)
      && report.mobileChecks.length === report.mobileCoverage.expectedContexts && report.mobileChecks.every(check => check.passed)
      && report.visualChecks.length === report.visualCoverage.expectedChecks && report.visualChecks.every(check => check.passed);
  } catch (error) {
    report.error = errorDetails(error);
    report.passed = false;
  } finally {
    await browser?.close().catch(() => {});
    server?.kill();
    if (serverLog !== undefined) closeSync(serverLog);
    report.finishedAt = new Date().toISOString();
    await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ environment: report.environment, browser: channel, engine: report.engine, headed: report.headed, version: report.browserVersion, passed: report.passed, report: join(output, 'report.json'), error: report.error?.message }));
    if (!report.passed) process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
