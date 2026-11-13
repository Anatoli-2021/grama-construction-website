import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { openSync, closeSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

// This is a Windows CI browser test, not a user-agent simulation. Playwright is
// installed under RUNNER_TEMP; it is not a website dependency or public asset.
const output = resolve(process.env.ANIMATION_EVIDENCE_DIR || join(os.tmpdir(), 'grama-windows-animation'));
const channel = process.env.BROWSER_CHANNEL;
const viewport = { width: 1440, height: 900 };
const report = {
  startedAt: new Date().toISOString(),
  commit: process.env.CANDIDATE_SHA || process.env.GITHUB_SHA || null,
  environment: {
    platform: process.platform,
    release: os.release(),
    version: os.version(),
    architecture: process.arch,
    runnerOS: process.env.RUNNER_OS || null,
    imageOS: process.env.ImageOS || null,
    imageVersion: process.env.ImageVersion || null,
    node: process.version,
  },
  requestedBrowserChannel: channel,
  headed: true,
  viewport,
  reducedMotionContext: 'no-preference',
  interaction: 'Native mouse wheel events only; no Play, chapter, range, or scripted scrolling',
  targets: [],
};
const sha256 = value => createHash('sha256').update(value).digest('hex');
const errorDetails = error => ({ message: error.message, stack: error.stack });
await mkdir(output, { recursive: true });
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

async function pixelEvidence(png) {
  const { data, info } = await sharp(png).extract({
    left: Math.floor(viewport.width * 0.55),
    top: Math.floor(viewport.height * 0.25),
    width: Math.floor(viewport.width * 0.40),
    height: Math.floor(viewport.height * 0.57),
  }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let brightPixels = 0;
  let totalLuminance = 0;
  const pixels = info.width * info.height;
  for (let index = 0; index < data.length; index += info.channels) {
    const luminance = 0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
    totalLuminance += luminance;
    if (luminance > 100) brightPixels++;
  }
  return {
    raw: data,
    metrics: {
      region: 'right-side model, x=55–95% and y=25–82% of viewport',
      width: info.width,
      height: info.height,
      sha256: sha256(data),
      brightPixelFraction: brightPixels / pixels,
      meanLuminance: totalLuminance / pixels,
    },
  };
}

function imageDifference(first, second) {
  assert.equal(first.length, second.length);
  let absoluteDifference = 0;
  let changedPixels = 0;
  for (let index = 0; index < first.length; index += 3) {
    const difference = (Math.abs(first[index] - second[index])
      + Math.abs(first[index + 1] - second[index + 1])
      + Math.abs(first[index + 2] - second[index + 2])) / 3;
    absoluteDifference += difference;
    if (difference > 12) changedPixels++;
  }
  return {
    meanAbsoluteChannelDifference: absoluteDifference / (first.length / 3),
    changedPixelFraction: changedPixels / (first.length / 3),
  };
}

async function verifyTarget(target) {
  const result = { ...target, captures: [], pageErrors: [], consoleErrors: [], requestFailures: [], assetFailures: [], mp4Requests: [], passed: false };
  report.targets.push(result);
  const directory = join(output, target.name);
  await mkdir(directory, { recursive: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'no-preference', locale: 'en-US' });
  const page = await context.newPage();
  page.on('pageerror', error => result.pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') result.consoleErrors.push(message.text()); });
  page.on('requestfailed', request => result.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('request', request => { if (/\.mp4(?:[?#]|$)/i.test(request.url())) result.mp4Requests.push(request.url()); });
  page.on('response', response => {
    if (response.status() >= 400 && /\.(?:webp|png|js|css)(?:[?#]|$)/i.test(response.url())) {
      result.assetFailures.push({ url: response.url(), status: response.status() });
    }
  });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
  const imageData = new Map();

  async function settlePaint() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }

  async function wheel(delta) {
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, delta);
    await page.waitForFunction(previous => Math.abs(scrollY - previous) > 0.5, before, { timeout: 5000 });
    await settlePaint();
  }

  async function wheelToProgress(progress) {
    const geometry = await page.evaluate(() => {
      const track = document.querySelector('.ae-scroll-track');
      return { top: track.getBoundingClientRect().top + scrollY, distance: Math.max(1, track.offsetHeight - innerHeight), scrollY };
    });
    const targetY = progress === 0 ? 0 : geometry.top + geometry.distance * progress;
    for (let count = 0; count < 100; count++) {
      const current = await page.evaluate(() => scrollY);
      if (Math.abs(targetY - current) <= 2) return;
      await wheel(Math.max(-120, Math.min(120, targetY - current)));
    }
    throw new Error(`Native wheel did not reach progress ${progress}`);
  }

  async function capture(name) {
    await settlePaint();
    const state = await page.evaluate(async () => {
      const stage = document.querySelector('.ae-stage');
      const canvas = document.querySelector('.ae-artlist-sequence');
      const rect = canvas.getBoundingClientRect();
      const style = getComputedStyle(canvas);
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      const digest = await crypto.subtle.digest('SHA-256', pixels.data);
      return {
        scrollY,
        progress: Number(stage.dataset.progress),
        phase: stage.dataset.phase,
        mode: document.querySelector('.animated-experience').dataset.mode,
        artlistStatus: stage.dataset.artlistStatus,
        frame: Number(canvas.dataset.frame),
        clipProgress: Number(canvas.dataset.clipProgress),
        canvasSha256: [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join(''),
        canvas: { width: canvas.width, height: canvas.height, x: rect.x, y: rect.y, cssWidth: rect.width, cssHeight: rect.height, visibility: style.visibility, opacity: style.opacity, maskComposite: style.maskComposite, maskImage: style.maskImage },
        overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        viewport: { innerWidth, clientWidth: document.documentElement.clientWidth, innerHeight },
        dialogCount: document.querySelectorAll('dialog').length,
      };
    });
    const file = `${name}.png`;
    const screenshot = await page.screenshot({ path: join(directory, file), type: 'png', animations: 'allow' });
    const { raw, metrics } = await pixelEvidence(screenshot);
    imageData.set(name, raw);
    const captured = { name, screenshot: `${target.name}/${file}`, ...state, visibleModel: metrics };
    result.captures.push(captured);
    assert.equal(state.mode, 'scroll', 'Scroll animation must be active without clicking Play');
    assert.equal(state.artlistStatus, 'ready', 'Artlist film must be ready');
    assert.equal(state.canvas.visibility, 'visible');
    assert.ok(Number(state.canvas.opacity) > 0.9, 'Canvas must remain visible during the house chapters');
    assert.equal(state.overflow, 0, 'Animation page must not overflow horizontally');
    assert.equal(state.dialogCount, 0, 'Scroll verification must not open the native video dialog');
    return captured;
  }

  try {
    const response = await page.goto(target.url, { waitUntil: 'networkidle', timeout: 45000 });
    assert.ok(response?.ok(), 'Animation HTML must load successfully');
    result.html = { status: response.status(), url: response.url(), sha256: sha256(await response.body()) };
    await page.locator('.animated-experience[data-mode="scroll"]').waitFor({ timeout: 30000 });
    await page.locator('.ae-artlist-sequence[data-status="ready"]').waitFor({ timeout: 45000 });
    result.browserEnvironment = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      const extension = gl?.getExtension('WEBGL_debug_renderer_info');
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        userAgentData: await navigator.userAgentData?.getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'bitness']),
        prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : null,
        vendor: extension ? gl.getParameter(extension.UNMASKED_VENDOR_WEBGL) : null,
      };
    });
    await page.mouse.move(viewport.width * 0.8, viewport.height * 0.5);
    const initial = await capture('initial');
    assert.equal(initial.frame, 0);
    for (let tick = 1; tick <= 3; tick++) {
      await wheel(120);
      await capture(`wheel-${tick * 120}px`);
    }
    await wheelToProgress(0.25);
    const quarter = await capture('forward-25');
    await wheelToProgress(0.40);
    const open = await capture('forward-40');
    await wheelToProgress(0.66);
    const structure = await capture('forward-66');
    await wheelToProgress(0.25);
    const reverse = await capture('reverse-25');
    await wheelToProgress(0);
    const closed = await capture('reverse-closed');

    assert.ok(quarter.frame > 0, 'Natural forward scrolling must advance the house film');
    assert.ok(open.frame >= 35 && open.frame > quarter.frame, 'The house must open by the Layers chapter');
    assert.equal(structure.frame, 39, 'Structure must hold the open final frame');
    assert.ok(Math.abs(reverse.frame - quarter.frame) <= 2, 'Reverse scrolling must return through the same film');
    assert.equal(closed.frame, 0);
    assert.equal(closed.canvasSha256, initial.canvasSha256, 'Reverse scrolling must restore the original canvas pixels');
    assert.notEqual(open.canvasSha256, initial.canvasSha256, 'Canvas content must visibly change, not just its frame counter');
    result.visibleOpening = imageDifference(imageData.get('initial'), imageData.get('forward-40'));
    result.visibleReturn = imageDifference(imageData.get('initial'), imageData.get('reverse-closed'));
    assert.ok(initial.visibleModel.brightPixelFraction > 0.02, 'Closed house must be visible in the screenshot model region');
    assert.ok(open.visibleModel.brightPixelFraction > 0.02, 'Open house must be visible in the screenshot model region');
    assert.ok(result.visibleOpening.changedPixelFraction > 0.02, 'The displayed model region must change while scrolling');
    assert.ok(result.visibleOpening.meanAbsoluteChannelDifference > 1, 'The visible change must exceed incidental UI noise');
    assert.equal(result.mp4Requests.length, 0, 'Scrolling must work without requesting or playing the MP4');
    assert.deepEqual(result.pageErrors, [], 'Browser JavaScript must not fail');
    assert.deepEqual(result.assetFailures, [], 'Required animation assets must not fail');
    result.passed = true;
  } catch (error) {
    result.error = errorDetails(error);
    await page.screenshot({ path: join(directory, 'failure.png'), type: 'png' }).catch(() => {});
  } finally {
    await context.tracing.stop({ path: join(directory, 'trace.zip') }).catch(error => { result.traceError = error.message; });
    await context.close();
    console.log(JSON.stringify({ target: result.name, browser: channel, passed: result.passed, captures: result.captures.map(({ name, scrollY, progress, frame }) => ({ name, scrollY, progress, frame })), visibleOpening: result.visibleOpening, error: result.error?.message }));
  }
}

try {
  assert.equal(process.platform, 'win32', 'This verification must run on an actual Windows runner');
  assert.ok(['chrome', 'msedge'].includes(channel), 'BROWSER_CHANNEL must select installed Chrome or Edge');
  assert.ok(process.env.PLAYWRIGHT_MODULE_PATH, 'Isolated Playwright module path is required');
  const { chromium } = await import(pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href);
  serverLog = openSync(join(output, 'local-server.log'), 'w');
  server = spawn(process.execPath, ['scripts/serve-website.mjs'], {
    env: { ...process.env, PORT: '5189' },
    stdio: ['ignore', serverLog, serverLog],
    windowsHide: true,
  });
  await waitForServer();
  browser = await chromium.launch({ channel, headless: false });
  report.browserVersion = browser.version();
  const session = await browser.newBrowserCDPSession();
  report.browserProtocolVersion = await session.send('Browser.getVersion');
  await session.detach();
  await verifyTarget({ name: 'local-candidate', url: 'http://127.0.0.1:5189/animated-experience' });
  await verifyTarget({ name: 'public-domain', url: 'https://gramadevelopment.com/animated-experience' });
  report.passed = report.targets.length === 2 && report.targets.every(target => target.passed);
} catch (error) {
  report.error = errorDetails(error);
  report.passed = false;
} finally {
  await browser?.close().catch(() => {});
  server?.kill();
  if (serverLog !== undefined) closeSync(serverLog);
  report.finishedAt = new Date().toISOString();
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ windows: report.environment, browser: channel, version: report.browserVersion, passed: report.passed, report: join(output, 'report.json'), error: report.error?.message }));
  if (!report.passed) process.exitCode = 1;
}
