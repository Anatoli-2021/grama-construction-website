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
  assert.ok(['auto', 'journey', 'legacy'].includes(schema), 'Public animation schema must be auto, journey or legacy');
  return schema;
}

// Kept independent of Playwright so the expected evidence can be checked locally
// without pretending that a macOS run is actual Windows browser verification.
export function assertSequenceCaptures(captures, schema) {
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
  interaction: 'Primary checks use native mouse wheel only, without Play, chapters, range or scripted scrolling; separate candidate fallback checks use explicit opt-in and stills controls',
  targets: [],
  candidateChecks: [],
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
      region: 'right-side architecture, x=55–95% and y=25–82% of viewport',
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
    await page.waitForFunction(previous => Math.abs(scrollY - previous) > 0.5 || (previous > 0 && scrollY === 0), before, { timeout: 5000 });
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
      if (progress === 0 ? current === 0 : Math.abs(targetY - current) <= 2) return;
      // Reach the exact origin for the reverse pixel-hash comparison. An early
      // return a fraction of a pixel above it would retain a blended frame.
      await wheel(progress === 0 ? -120 : Math.max(-120, Math.min(120, targetY - current)));
    }
    throw new Error(`Native wheel did not reach progress ${progress}`);
  }

  async function capture(name) {
    await settlePaint();
    // A new Journey atlas can still be decoding after the native scroll event.
    // Wait for the visible pose, rather than accepting its preceding canvas.
    await page.waitForFunction(() => document.querySelector('.ae-stage')?.dataset.artlistStatus === 'ready'
      && document.querySelector('.ae-artlist-sequence')?.dataset.status === 'ready', null, { timeout: 45000 });
    await settlePaint();
    const state = await page.evaluate(async () => {
      const stage = document.querySelector('.ae-stage');
      const canvas = document.querySelector('.ae-artlist-sequence');
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
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      const digest = await crypto.subtle.digest('SHA-256', pixels.data);
      return {
        scrollY,
        progress: Number(stage.dataset.progress),
        phase: stage.dataset.phase,
        mode: document.querySelector('.animated-experience').dataset.mode,
        artlistStatus: stage.dataset.artlistStatus,
        frame: Number(canvas.dataset.frame),
        globalFrame: canvas.dataset.globalFrame === undefined ? null : Number(canvas.dataset.globalFrame),
        scene: canvas.dataset.scene || null,
        sceneIndex: canvas.dataset.sceneIndex === undefined ? null : Number(canvas.dataset.sceneIndex),
        clipProgress: Number(canvas.dataset.clipProgress),
        canvasSha256: [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join(''),
        canvas: { width: canvas.width, height: canvas.height, x: rect.x, y: rect.y, cssWidth: rect.width, cssHeight: rect.height, visibility: style.visibility, opacity: style.opacity, effectiveOpacity: effectiveOpacity(canvas), maskComposite: style.maskComposite, maskImage: style.maskImage },
        overview: { effectiveOpacity: overview ? effectiveOpacity(overview) : 0, imageLoaded: Boolean(overviewImage?.complete && overviewImage.naturalWidth > 0) },
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
    assert.ok(state.canvas.width > 0 && state.canvas.height > 0 && state.canvas.cssWidth > 0 && state.canvas.cssHeight > 0, 'Canvas must have a visible painted area');
    if (state.progress < 0.81) {
      assert.ok(state.canvas.effectiveOpacity > 0.9, 'Canvas must remain visible during the house chapters');
    } else if (state.progress >= 0.97) {
      assert.ok(state.overview.effectiveOpacity > 0.9 && state.overview.imageLoaded, 'The completed overview transition must show the loaded neighborhood image');
      assert.ok(state.canvas.effectiveOpacity < 0.1, 'The model must yield to the neighborhood overview');
    }
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
    const declaredExperience = await page.locator('.animated-experience').getAttribute('data-experience');
    assert.ok(!declaredExperience || declaredExperience === 'journey', 'The public page declares an unsupported animation experience');
    result.schema = declaredExperience === 'journey' ? 'journey' : 'legacy';
    if (target.expectedSchema !== 'auto') assert.equal(result.schema, target.expectedSchema, 'The target must serve the expected animation schema');
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
    await capture('forward-25');
    await wheelToProgress(0.40);
    const open = await capture('forward-40');
    await wheelToProgress(0.66);
    const structure = await capture('forward-66');
    await wheelToProgress(0.80);
    await capture('forward-80');
    await wheelToProgress(0.98);
    const overview = await capture('forward-98');
    for (const progress of [0.80, 0.66, 0.40]) {
      await wheelToProgress(progress);
      await capture(`reverse-${Math.round(progress * 100)}`);
    }
    await wheelToProgress(0.25);
    await capture('reverse-25');
    await wheelToProgress(0);
    await capture('reverse-closed');

    assertSequenceCaptures(result.captures, result.schema);
    result.visibleOpening = imageDifference(imageData.get('initial'), imageData.get('forward-40'));
    result.visibleReturn = imageDifference(imageData.get('initial'), imageData.get('reverse-closed'));
    assert.ok(initial.visibleModel.brightPixelFraction > 0.02, 'Closed house must be visible in the screenshot model region');
    assert.ok(open.visibleModel.brightPixelFraction > 0.02, 'Open house must be visible in the screenshot model region');
    assert.ok(result.visibleOpening.changedPixelFraction > 0.02, 'The displayed model region must change while scrolling');
    assert.ok(result.visibleOpening.meanAbsoluteChannelDifference > 1, 'The visible change must exceed incidental UI noise');
    assert.ok(overview.visibleModel.brightPixelFraction > 0.02, 'The neighborhood must be visible in the screenshot architecture region');
    if (result.schema === 'journey') {
      assert.ok(structure.visibleModel.brightPixelFraction > 0.02, 'The structural scene must be visibly rendered');
      result.visibleSceneChanges = [
        { from: 'arrival', to: 'interior', ...imageDifference(imageData.get('forward-25'), imageData.get('forward-40')) },
        { from: 'interior', to: 'structure', ...imageDifference(imageData.get('forward-40'), imageData.get('forward-66')) },
        { from: 'structure', to: 'overview', ...imageDifference(imageData.get('forward-80'), imageData.get('forward-98')) },
      ];
      for (const change of result.visibleSceneChanges) {
        assert.ok(change.changedPixelFraction > 0.02 && change.meanAbsoluteChannelDifference > 1, `${change.from} → ${change.to} must visibly change the displayed architecture`);
      }
    }
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
    console.log(JSON.stringify({ target: result.name, schema: result.schema, browser: channel, passed: result.passed, captures: result.captures.map(({ name, scrollY, progress, frame, globalFrame, scene }) => ({ name, scrollY, progress, frame, globalFrame, scene })), visibleOpening: result.visibleOpening, visibleSceneChanges: result.visibleSceneChanges, error: result.error?.message }));
  }
}

async function verifyCandidateFallbacks(target) {
  const atlasRequest = /\/assets\/(?:film\/(?:arrival|interior)|animated\/artlist-house)\/(?:desktop|mobile)\/sheet-\d+\.webp(?:[?#]|$)/;
  async function check(name, reducedMotion, exercise) {
    const result = { name, url: target.url, reducedMotion, pageErrors: [], consoleErrors: [], atlasRequests: [], mp4Requests: [], passed: false };
    report.candidateChecks.push(result);
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion, locale: 'en-US' });
    const page = await context.newPage();
    page.on('pageerror', error => result.pageErrors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') result.consoleErrors.push(message.text()); });
    page.on('request', request => {
      if (atlasRequest.test(request.url())) result.atlasRequests.push(request.url());
      if (/\.mp4(?:[?#]|$)/i.test(request.url())) result.mp4Requests.push(request.url());
    });
    try {
      await exercise(page, result);
      assert.deepEqual(result.pageErrors, [], 'Fallback interactions must not cause browser JavaScript errors');
      assert.equal(result.mp4Requests.length, 0, 'Fallback checks must not request or autoplay an MP4');
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

  async function loadJourney(page) {
    const response = await page.goto(target.url, { waitUntil: 'networkidle', timeout: 45000 });
    assert.ok(response?.ok(), 'Candidate animation HTML must load');
    await page.locator('.animated-experience[data-experience="journey"]').waitFor({ timeout: 30000 });
    await page.waitForFunction(() => [...document.querySelectorAll('.ae-view-options button')].some(button => !button.disabled));
  }

  await check('candidate-reduced-motion', 'reduce', async (page, result) => {
    await loadJourney(page);
    await page.locator('.animated-experience[data-mode="stills"]').waitFor();
    assert.ok(await page.locator('.ae-storyboard').isVisible(), 'Reduced motion must initially show the stills');
    assert.equal(await page.locator('.ae-storyboard figure').count(), 4, 'All four architectural stills remain available');
    assert.equal(result.atlasRequests.length, 0, 'Reduced-motion initial rendering must not load any animation atlas');
    assert.equal(result.mp4Requests.length, 0, 'Reduced motion must not preload or autoplay the film');
    result.initialMode = 'stills';
    result.initialAtlasRequests = result.atlasRequests.length;
    await page.getByRole('button', { name: 'Enable scroll animation', exact: true }).click();
    await page.locator('.animated-experience[data-mode="scroll"]').waitFor();
    await page.locator('.ae-journey-sequence[data-status="ready"]').waitFor({ timeout: 45000 });
    await page.mouse.move(viewport.width * 0.8, viewport.height * 0.5);
    await page.mouse.wheel(0, 120);
    await page.waitForFunction(() => Number(document.querySelector('.ae-journey-sequence')?.dataset.globalFrame) > 0);
    result.optIn = await page.locator('.ae-journey-sequence').evaluate(canvas => ({ status: canvas.dataset.status, scene: canvas.dataset.scene, globalFrame: Number(canvas.dataset.globalFrame) }));
    assert.equal(result.optIn.scene, 'arrival', 'Explicit opt-in restores the Journey');
    assert.equal(result.optIn.status, 'ready');
    // A fresh reduce change must revoke the explicit opt-in. Reapplying an
    // unchanged media value would not fire the browser's change event.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.animated-experience[data-mode="stills"]').waitFor();
    await page.locator('.ae-journey-sequence[data-status="idle"]').waitFor();
    assert.ok(await page.locator('.ae-storyboard').isVisible(), 'A new reduce preference must restore the stills');
    assert.ok(await page.getByRole('button', { name: 'Enable scroll animation', exact: true }).isEnabled(), 'Opt-in control remains available after the preference reset');
    result.preferenceResetMode = 'stills';
  });

  await check('candidate-atlas-failure', 'no-preference', async (page, result) => {
    result.abortedAtlases = [];
    await page.route(/\/assets\/film\/arrival\/(?:desktop|mobile)\/sheet-0\.webp(?:[?#]|$)/, route => {
      result.abortedAtlases.push(route.request().url());
      return route.abort('failed');
    });
    await loadJourney(page);
    await page.locator('.ae-stage[data-artlist-status="error"]').waitFor({ timeout: 30000 });
    assert.ok(result.abortedAtlases.length > 0, 'The current required atlas was deliberately blocked');
    result.poster = await page.locator('.journey-poster').evaluate(image => ({
      loaded: image.complete && image.naturalWidth > 0,
      opacity: Number(getComputedStyle(image).opacity),
      visibility: getComputedStyle(image).visibility,
      width: image.getBoundingClientRect().width,
      height: image.getBoundingClientRect().height,
    }));
    assert.ok(result.poster.loaded && result.poster.opacity > 0.9 && result.poster.visibility === 'visible' && result.poster.width > 0 && result.poster.height > 0, 'A failed atlas must leave the loaded poster visible');
    const { metrics } = await pixelEvidence(await page.screenshot({ type: 'png' }));
    result.visiblePoster = metrics;
    assert.ok(metrics.brightPixelFraction > 0.02, 'The poster must paint visible architecture instead of a blank canvas');
    assert.ok(await page.getByRole('button', { name: 'View stills', exact: true }).isVisible(), 'Stills fallback remains available');
    assert.ok(await page.locator('.ae-film-link').isVisible(), 'Manual film playback remains available');
    assert.ok(await page.locator('.journey-error').isVisible(), 'A failed view must be explained');
    await page.getByRole('button', { name: 'View stills', exact: true }).click();
    await page.locator('.animated-experience[data-mode="stills"]').waitFor();
    assert.ok(await page.locator('.ae-storyboard').isVisible(), 'The stills action must work after atlas failure');
    assert.equal(await page.locator('.ae-storyboard figure').count(), 4);
    result.fallbackMode = 'stills';
  });
}

async function main() {
  await mkdir(output, { recursive: true });
  try {
    const publicUrl = resolvePublicAnimationUrl(process.env.PUBLIC_ANIMATION_URL);
    const publicSchema = resolvePublicAnimationSchema(process.env.PUBLIC_ANIMATION_SCHEMA);
    report.publicTarget = { url: publicUrl, expectedSchema: publicSchema };
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
    const candidate = { name: 'local-candidate', url: 'http://127.0.0.1:5189/animated-experience', expectedSchema: 'journey' };
    await verifyTarget(candidate);
    await verifyTarget({ name: 'public-domain', url: publicUrl, expectedSchema: publicSchema });
    await verifyCandidateFallbacks(candidate);
    report.passed = report.targets.length === 2 && report.targets.every(target => target.passed)
      && report.candidateChecks.length === 2 && report.candidateChecks.every(check => check.passed);
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
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
