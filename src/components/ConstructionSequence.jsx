import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  CONSTRUCTION_ATLAS_BASE,
  CONSTRUCTION_SHEET_COLUMNS,
  CONSTRUCTION_SHEET_COUNT,
  CONSTRUCTION_SHEET_ROWS,
  clampConstructionProgress,
  getConstructionFrameRect,
  getConstructionPose,
} from './construction-timeline.js';

const MAX_IMAGES = 4;
const MAX_PENDING = 2;
const LOAD_TIMEOUT = 15000;

// Only the frames needed for the current pose and one directional look-ahead
// are decoded. Camera motion is authored in the images, not in the page scroll.
const ConstructionSequence = forwardRef(function ConstructionSequence({
  enabled = true,
  onStatusChange,
  className = '',
}, ref) {
  const canvasRef = useRef(null);
  const refreshRef = useRef(null);
  const progressRef = useRef(0);
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
      const next = clampConstructionProgress(value);
      if (next !== progressRef.current) directionRef.current = Math.sign(next - progressRef.current);
      progressRef.current = next;
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
    let context;
    const canvas = canvasRef.current;
    const width = variant === 'mobile' ? 640 : 960;
    const height = variant === 'mobile' ? 360 : 540;
    const cache = new Map();
    const pending = new Map();
    const failed = new Set();

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

    function plan() {
      const pose = getConstructionPose(progressRef.current);
      const lower = getConstructionFrameRect(pose.frame, width, height);
      const required = [lower.sheetIndex];
      if (pose.upperFrame !== pose.frame && pose.blend > 0) {
        const upper = getConstructionFrameRect(pose.upperFrame, width, height);
        if (upper.sheetIndex !== lower.sheetIndex) required.push(upper.sheetIndex);
      }
      const adjacent = lower.sheetIndex + directionRef.current;
      return {
        pose,
        required,
        requiredKeys: new Set(required),
        prefetch: adjacent >= 0 && adjacent < CONSTRUCTION_SHEET_COUNT && !required.includes(adjacent) ? [adjacent] : [],
      };
    }

    function release(key) {
      const image = cache.get(key);
      cache.delete(key);
      image?.removeAttribute('src');
    }

    function reserve(protectedKeys) {
      // Pending decodes share the same reference limit as decoded images.
      while (cache.size + pending.size >= MAX_IMAGES) {
        const oldest = [...cache.keys()].find(key => !protectedKeys.has(key));
        if (oldest === undefined) return false;
        release(oldest);
      }
      return true;
    }

    function load(key) {
      const image = new window.Image();
      image.decoding = 'async';
      let settled = false;
      let timeout;
      const request = { cancel: () => finish(false, true) };

      function finish(ok, cancelled = false) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        image.onload = null;
        image.onerror = null;
        if (pending.get(key) === request) pending.delete(key);
        if (!alive || cancelled) {
          image.removeAttribute('src');
          stats();
          return;
        }
        if (ok) cache.set(key, image);
        else {
          failed.add(key);
          image.removeAttribute('src');
        }
        stats();
        refresh();
      }

      pending.set(key, request);
      timeout = window.setTimeout(() => finish(false), LOAD_TIMEOUT);
      image.onload = async () => {
        try {
          if (typeof image.decode === 'function') await image.decode();
          finish(image.naturalWidth === width * CONSTRUCTION_SHEET_COLUMNS
            && image.naturalHeight === height * CONSTRUCTION_SHEET_ROWS);
        } catch { finish(false); }
      };
      image.onerror = () => finish(false);
      image.src = `${CONSTRUCTION_ATLAS_BASE}/${variant}/sheet-${key}.webp`;
      stats();
    }

    function requestSheets(current) {
      const wanted = new Set([...current.required, ...current.prefetch]);
      for (const [key, request] of [...pending]) if (!wanted.has(key)) request.cancel();
      const missing = current.required.filter(key => !cache.has(key) && !pending.has(key) && !failed.has(key));
      for (const [key, request] of [...pending]) {
        if (pending.size + missing.length <= MAX_PENDING) break;
        if (!current.requiredKeys.has(key)) request.cancel();
      }
      for (const key of [...current.required, ...current.prefetch]) {
        if (pending.size >= MAX_PENDING) break;
        if (cache.has(key) || pending.has(key) || failed.has(key)) continue;
        if (!reserve(current.requiredKeys)) break;
        load(key);
      }
      stats();
    }

    function drawFrame(frame, alpha) {
      const tile = getConstructionFrameRect(frame, width, height);
      const image = cache.get(tile.sheetIndex);
      cache.delete(tile.sheetIndex);
      cache.set(tile.sheetIndex, image);
      context.globalAlpha = alpha;
      context.drawImage(image, tile.sx, tile.sy, tile.width, tile.height, 0, 0, width, height);
    }

    function refresh() {
      if (!alive || !enabled) return;
      const current = plan();
      if (current.required.some(key => failed.has(key))) {
        report('error');
        return;
      }
      requestSheets(current);
      if (current.required.some(key => !cache.has(key))) {
        report(paintedRef.current ? 'buffering' : 'loading');
        return;
      }
      const { pose } = current;
      if (lastPaint !== pose.progress) {
        try {
          // Preserve the old visible paint until a full new-variant pose is ready.
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }
          drawFrame(pose.frame, 1);
          if (pose.upperFrame !== pose.frame && pose.blend > 0) drawFrame(pose.upperFrame, pose.blend);
          context.globalAlpha = 1;
          canvas.dataset.variant = variant;
          canvas.dataset.frame = String(pose.frame);
          canvas.dataset.globalFrame = String(pose.globalFrame);
          canvas.dataset.stage = pose.stage;
          canvas.dataset.stageIndex = String(pose.stageIndex);
          canvas.dataset.progress = pose.progress.toFixed(5);
          canvas.dataset.clipProgress = pose.localProgress.toFixed(5);
          canvas.dataset.frameBlend = pose.blend.toFixed(5);
          lastPaint = pose.progress;
          if (!paintedRef.current) {
            paintedRef.current = true;
            setPainted(true);
          }
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
    catch { /* Parent keeps the poster, stills and native-film alternative. */ }
    if (!context) {
      report('error');
      return cleanup;
    }
    refreshRef.current = refresh;
    refresh();
    return cleanup;
  }, [enabled, variant, variantReady]);

  return <canvas ref={canvasRef}
    className={`ae-construction-sequence ${className}`}
    width="960" height="540"
    data-status={status}
    data-variant="desktop"
    data-frame="0"
    data-global-frame="0"
    data-stage="land"
    data-stage-index="0"
    data-decoded-sheets="0"
    data-pending-sheets="0"
    role="img"
    aria-label="Conceptual architectural journey from an empty development site into one residence and its structure"
    aria-hidden={!enabled || !painted}
    style={{ visibility: enabled && painted ? 'visible' : 'hidden' }} />;
});

export default ConstructionSequence;
