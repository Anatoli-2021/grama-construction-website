import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ARTLIST_FRAME_COUNT, ARTLIST_SHEET_COLUMNS, ARTLIST_SHEET_COUNT, ARTLIST_SHEET_ROWS, clampSequenceProgress, getFrameBlend, getFrameRect } from './artlist-house-sequence.js';
import { JOURNEY_SCENES } from './journey-timeline.js';

const MAX_IMAGES = 6;
const MAX_PENDING = 3;
const LOAD_TIMEOUT = 15000;

function normalizePose(value) {
  const scene = Number.isFinite(value?.sceneIndex) ? Math.trunc(value.sceneIndex) : 0;
  const sceneIndex = Math.max(0, Math.min(JOURNEY_SCENES.length - 1, scene));
  return {
    sceneIndex,
    localProgress: clampSequenceProgress(value?.localProgress),
    transition: sceneIndex === 0 || value?.transition === undefined ? 1 : clampSequenceProgress(value.transition),
  };
}

// The canvas retains its previous paint while a required atlas is loading.
// Only requested frame sheets and bounded look-ahead sheets are decoded.
const JourneySequence = forwardRef(function JourneySequence({
  enabled = true,
  onStatusChange,
  className = '',
}, ref) {
  const canvasRef = useRef(null);
  const refreshRef = useRef(null);
  const poseRef = useRef(normalizePose());
  const directionRef = useRef(1);
  const callbackRef = useRef(onStatusChange);
  const statusRef = useRef('idle');
  const paintedRef = useRef(false);
  const [status, setStatus] = useState('idle');
  const [painted, setPainted] = useState(false);
  const [variant, setVariant] = useState('desktop');
  const [variantReady, setVariantReady] = useState(false);

  useEffect(() => { callbackRef.current = onStatusChange; }, [onStatusChange]);

  useImperativeHandle(ref, () => ({
    seek(value) {
      const next = normalizePose(value);
      const previous = poseRef.current;
      const change = next.sceneIndex - previous.sceneIndex || next.localProgress - previous.localProgress;
      if (change) directionRef.current = Math.sign(change);
      poseRef.current = next;
      refreshRef.current?.();
    },
  }), []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 600px)');
    const update = () => {
      setVariant(query.matches ? 'mobile' : 'desktop');
      setVariantReady(true);
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let alive = true;
    let lastPaint = null;
    const cache = new Map();
    const pending = new Map();
    const failed = new Set();
    const canvas = canvasRef.current;
    const width = variant === 'mobile' ? 640 : 960;
    const height = variant === 'mobile' ? 360 : 540;
    let context;

    function report(next) {
      if (!alive || statusRef.current === next) return;
      statusRef.current = next;
      if (canvas) canvas.dataset.status = next;
      setStatus(next);
      callbackRef.current?.(next);
    }

    function stats() {
      if (!canvas) return;
      canvas.dataset.decodedSheets = String(cache.size);
      canvas.dataset.pendingSheets = String(pending.size);
    }

    function sheet(sceneIndex, sheetIndex) {
      return { sceneIndex, sheetIndex, key: `${sceneIndex}:${sheetIndex}` };
    }

    function plan() {
      const pose = poseRef.current;
      const blend = getFrameBlend(pose.localProgress);
      const first = getFrameRect(blend.lower, width, height);
      const required = [sheet(pose.sceneIndex, first.sheetIndex)];
      if (blend.upper !== blend.lower && blend.blend > 0) {
        const upper = getFrameRect(blend.upper, width, height);
        if (upper.sheetIndex !== first.sheetIndex) required.push(sheet(pose.sceneIndex, upper.sheetIndex));
      }
      if (pose.sceneIndex > 0 && pose.transition < 1) required.push(sheet(pose.sceneIndex - 1, ARTLIST_SHEET_COUNT - 1));
      const requiredKeys = new Set(required.map(item => item.key));
      const prefetch = [];
      const adjacent = first.sheetIndex + directionRef.current;
      if (adjacent >= 0 && adjacent < ARTLIST_SHEET_COUNT) prefetch.push(sheet(pose.sceneIndex, adjacent));
      if (pose.localProgress >= 0.72 && pose.sceneIndex + 1 < JOURNEY_SCENES.length) prefetch.push(sheet(pose.sceneIndex + 1, 0));
      if (directionRef.current < 0 && pose.localProgress <= 0.28 && pose.sceneIndex > 0) prefetch.push(sheet(pose.sceneIndex - 1, ARTLIST_SHEET_COUNT - 1));
      return { pose, blend, required, requiredKeys, prefetch: prefetch.filter((item, index, items) => !requiredKeys.has(item.key) && items.findIndex(other => other.key === item.key) === index) };
    }

    function release(key) {
      const image = cache.get(key);
      cache.delete(key);
      image?.removeAttribute('src');
    }

    function reserve(protectedKeys) {
      // Include pending Images in the bound, so concurrent decodes cannot
      // silently add another full set of atlases beside the LRU cache.
      while (cache.size + pending.size >= MAX_IMAGES) {
        const oldest = [...cache.keys()].find(key => !protectedKeys.has(key));
        if (!oldest) return false;
        release(oldest);
      }
      return true;
    }

    function load(item) {
      const image = new window.Image();
      image.decoding = 'async';
      let settled = false;
      let timeout;
      const entry = { cancel: () => finish(false, true) };
      function finish(ok, cancelled = false) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        image.onload = null;
        image.onerror = null;
        if (pending.get(item.key) === entry) pending.delete(item.key);
        if (!alive || cancelled) {
          image.removeAttribute('src');
          stats();
          return;
        }
        if (ok) cache.set(item.key, image);
        else {
          failed.add(item.key);
          image.removeAttribute('src');
        }
        stats();
        refresh();
      }
      pending.set(item.key, entry);
      timeout = window.setTimeout(() => finish(false), LOAD_TIMEOUT);
      image.onload = async () => {
        try {
          if (typeof image.decode === 'function') await image.decode();
          finish(image.naturalWidth === width * ARTLIST_SHEET_COLUMNS && image.naturalHeight === height * ARTLIST_SHEET_ROWS);
        } catch { finish(false); }
      };
      image.onerror = () => finish(false);
      image.src = `${JOURNEY_SCENES[item.sceneIndex].atlasBase}/${variant}/sheet-${item.sheetIndex}.webp`;
      stats();
    }

    function requestSheets(current) {
      const wanted = new Set([...current.required, ...current.prefetch].map(item => item.key));
      for (const [key, request] of pending) if (!wanted.has(key)) request.cancel();
      const missing = current.required.filter(item => !cache.has(item.key) && !pending.has(item.key) && !failed.has(item.key));
      for (const [key, request] of pending) {
        if (pending.size + missing.length <= MAX_PENDING) break;
        if (!current.requiredKeys.has(key)) request.cancel();
      }
      for (const item of [...current.required, ...current.prefetch]) {
        if (pending.size >= MAX_PENDING) break;
        if (cache.has(item.key) || pending.has(item.key) || failed.has(item.key)) continue;
        if (!reserve(current.requiredKeys)) break;
        load(item);
      }
      stats();
    }

    function cached(sceneIndex, frame) {
      const tile = getFrameRect(frame, width, height);
      const key = `${sceneIndex}:${tile.sheetIndex}`;
      const image = cache.get(key);
      // Reinsertion makes this sheet most recently used.
      cache.delete(key);
      cache.set(key, image);
      return { image, tile };
    }

    function drawFrame(sceneIndex, frame, alpha) {
      const { image, tile } = cached(sceneIndex, frame);
      context.globalAlpha = alpha;
      context.drawImage(image, tile.sx, tile.sy, tile.width, tile.height, 0, 0, width, height);
    }

    function refresh() {
      if (!alive || !enabled) return;
      const current = plan();
      if (current.required.some(item => failed.has(item.key))) {
        report('error');
        return;
      }
      requestSheets(current);
      if (current.required.some(item => !cache.has(item.key))) {
        report(paintedRef.current ? 'buffering' : 'loading');
        return;
      }
      const { pose, blend } = current;
      if (!lastPaint || lastPaint.sceneIndex !== pose.sceneIndex || lastPaint.localProgress !== pose.localProgress || lastPaint.transition !== pose.transition) {
        try {
          // Resize only when the complete new pose can be painted immediately.
          if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
          drawFrame(pose.sceneIndex, blend.lower, 1);
          if (blend.upper !== blend.lower && blend.blend > 0) drawFrame(pose.sceneIndex, blend.upper, blend.blend);
          if (pose.sceneIndex > 0 && pose.transition < 1) drawFrame(pose.sceneIndex - 1, ARTLIST_FRAME_COUNT - 1, 1 - pose.transition);
          context.globalAlpha = 1;
          canvas.dataset.variant = variant;
          canvas.dataset.frame = String(blend.lower);
          canvas.dataset.globalFrame = String(pose.sceneIndex * ARTLIST_FRAME_COUNT + blend.lower);
          canvas.dataset.scene = JOURNEY_SCENES[pose.sceneIndex].id;
          canvas.dataset.sceneIndex = String(pose.sceneIndex);
          canvas.dataset.clipProgress = pose.localProgress.toFixed(4);
          canvas.dataset.transition = pose.transition.toFixed(4);
          lastPaint = { ...pose };
          if (!paintedRef.current) { paintedRef.current = true; setPainted(true); }
        } catch {
          context.globalAlpha = 1;
          report('error');
          return;
        }
      }
      report('ready');
      stats();
    }

    function cleanup() {
      alive = false;
      if (refreshRef.current === refresh) refreshRef.current = null;
      for (const request of [...pending.values()]) request.cancel();
      pending.clear();
      for (const key of [...cache.keys()]) release(key);
      stats();
    }

    if (!enabled) {
      report('idle');
      return cleanup;
    }
    report(paintedRef.current ? 'buffering' : 'loading');
    if (!variantReady) return cleanup;
    try { context = canvas?.getContext('2d', { alpha: false }); }
    catch { /* Parent retains its poster/static fallback. */ }
    if (!context || !JOURNEY_SCENES.length) {
      report('error');
      return cleanup;
    }
    refreshRef.current = refresh;
    refresh();
    return cleanup;
  }, [enabled, variant, variantReady]);

  return <canvas ref={canvasRef}
    className={`ae-journey-sequence ${className}`}
    width="960" height="540"
    data-status={status}
    data-variant="desktop"
    data-frame="0"
    data-global-frame="0"
    data-scene={JOURNEY_SCENES[0]?.id || 'arrival'}
    data-clip-progress="0"
    role="img"
    aria-label="AI-generated architectural journey through a conceptual residence, interior and structural study"
    aria-hidden={!enabled || !painted}
    style={{ visibility: enabled && painted ? 'visible' : 'hidden' }} />;
});

export default JourneySequence;
