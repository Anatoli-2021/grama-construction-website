import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ARTLIST_FRAME_BASE, ARTLIST_SHEET_COUNT, ARTLIST_SHEET_COLUMNS, ARTLIST_SHEET_ROWS, clampSequenceProgress, getFrameBlend, getFrameRect } from './artlist-house-sequence.js';

// Instantiate only for the live stage. Static cards retain the image-layer view.
const ArtlistHouseSequence = forwardRef(function ArtlistHouseSequence({
  enabled = true,
  className = '',
  onStatusChange,
}, ref) {
  const canvasRef = useRef(null);
  const drawRef = useRef(null);
  const progressRef = useRef(0);
  const callbackRef = useRef(onStatusChange);
  const statusRef = useRef('idle');
  const [status, setStatus] = useState('idle');
  const [variant, setVariant] = useState(() => typeof window !== 'undefined'
    && window.matchMedia('(max-width: 600px)').matches ? 'mobile' : 'desktop');

  useEffect(() => { callbackRef.current = onStatusChange; }, [onStatusChange]);

  useImperativeHandle(ref, () => ({
    seek(value) {
      progressRef.current = clampSequenceProgress(value);
      drawRef.current?.();
    },
  }), []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 600px)');
    const update = () => setVariant(query.matches ? 'mobile' : 'desktop');
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let alive = true;
    let failed = false;
    let cursor = 0;
    const sheets = new Array(ARTLIST_SHEET_COUNT).fill(null);
    const pending = new Set();
    const width = variant === 'mobile' ? 640 : 960;
    const height = variant === 'mobile' ? 360 : 540;
    const canvas = canvasRef.current;
    let context = null;

    function report(next) {
      if (!alive || statusRef.current === next) return;
      statusRef.current = next;
      setStatus(next);
      callbackRef.current?.(next);
    }
    function cancelPending() {
      for (const cancel of [...pending]) cancel();
    }
    function cleanup() {
      alive = false;
      drawRef.current = null;
      cancelPending();
      sheets.fill(null);
    }
    if (!enabled) {
      drawRef.current = null;
      report('idle');
      return cleanup;
    }
    report('loading');
    try { context = canvas?.getContext('2d', { alpha: false }) || null; }
    catch { /* The existing layered renderer remains available. */ }
    if (!context) {
      report('error');
      return cleanup;
    }

    function load(index) {
      return new Promise(resolve => {
        const image = new window.Image();
        image.decoding = 'async';
        let settled = false;
        const finish = result => {
          if (settled) return;
          settled = true;
          pending.delete(cancel);
          image.onload = null;
          image.onerror = null;
          resolve(result);
        };
        const cancel = () => {
          finish(null);
          image.removeAttribute('src');
        };
        pending.add(cancel);
        image.onload = async () => {
          try {
            if (typeof image.decode === 'function') await image.decode();
            finish(image.naturalWidth === width * ARTLIST_SHEET_COLUMNS && image.naturalHeight === height * ARTLIST_SHEET_ROWS ? image : null);
          } catch { finish(null); }
        };
        image.onerror = () => finish(null);
        image.src = `${ARTLIST_FRAME_BASE}/${variant}/sheet-${index}.webp`;
      });
    }

    // Four workers bound network/decode work. No partial sequence is displayed.
    const order = [0, ARTLIST_SHEET_COUNT - 1,
      ...Array.from({ length: ARTLIST_SHEET_COUNT - 2 }, (_, index) => index + 1)];
    async function worker() {
      while (alive && !failed && cursor < order.length) {
        const index = order[cursor++];
        const image = await load(index);
        if (!alive) return;
        if (!image) {
          failed = true;
          cancelPending();
          return;
        }
        sheets[index] = image;
      }
    }
    Promise.all(Array.from({ length: 4 }, worker)).then(() => {
      if (!alive) return;
      if (failed || sheets.some(image => !image)) {
        report('error');
        return;
      }
      canvas.width = width;
      canvas.height = height;
      function drawFrame(index) {
        const tile = getFrameRect(index, width, height);
        context.drawImage(sheets[tile.sheetIndex], tile.sx, tile.sy, tile.width, tile.height, 0, 0, width, height);
      }
      drawRef.current = () => {
        if (!alive) return;
        const { lower, upper, blend } = getFrameBlend(progressRef.current);
        canvas.dataset.frame = String(lower);
        canvas.dataset.clipProgress = progressRef.current.toFixed(4);
        context.globalAlpha = 1;
        drawFrame(lower);
        if (upper !== lower && blend > 0) {
          context.globalAlpha = blend;
          drawFrame(upper);
          context.globalAlpha = 1;
        }
      };
      // seek() calls made during loading are retained, including a paused pose.
      drawRef.current();
      report('ready');
    }).catch(() => {
      if (!alive) return;
      failed = true;
      cancelPending();
      drawRef.current = null;
      report('error');
    });
    return cleanup;
  }, [enabled, variant]);

  return <canvas ref={canvasRef}
    className={`ae-artlist-sequence ${className}`}
    width="960" height="540"
    data-status={status}
    data-variant={variant}
    role="img"
    aria-label="Artlist-animated architectural concept showing the house opening into roof, façade and timber-frame layers"
    aria-hidden={status !== 'ready'}
    style={{ visibility: status === 'ready' ? 'visible' : 'hidden' }} />;
});

export default ArtlistHouseSequence;
