import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CinematicStory.css';

gsap.registerPlugin(ScrollTrigger);

const chapters = [
  {
    label: 'The residence',
    eyebrow: '01 / RESIDENCE CONCEPT',
    first: 'A proposed',
    second: 'residence.',
    body: 'Concept design for a Dexter Acres home: gabled rooflines, light masonry and a covered entrance.',
    image: '/assets/residence.webp',
    alt: 'Architectural concept of a Dexter Acres residence with a steep gabled roof and light masonry',
    target: 0.015,
  },
  {
    label: 'The detail',
    eyebrow: '02 / ARCHITECTURAL DETAIL',
    first: 'Materials &',
    second: 'detail.',
    body: 'A closer view of the proposed masonry, windows and rooflines. Final selections depend on the project’s design development.',
    image: '/assets/residence-angle.webp',
    alt: 'Angled architectural rendering showing the conceptual masonry palette, roofline and sheltered entrance',
    target: 0.405,
  },
  {
    label: 'The neighborhood',
    eyebrow: '03 / INTRODUCING DEXTER ACRES',
    first: '14 planned homes.',
    second: 'Des Plaines.',
    body: 'The proposed neighborhood at Webster and Dexter Lanes. Explore all 14 lots in the plan below.',
    image: '/assets/community.webp',
    alt: 'AI-generated concept aerial showing all fourteen proposed Dexter Acres homes',
    target: 0.84,
  },
];

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (from, to, amount) => from + (to - from) * amount;
const smooth = (amount) => {
  const t = clamp(amount);
  return t * t * (3 - 2 * t);
};

function supportsSequence(motion) {
  return typeof window !== 'undefined'
    && motion
    && window.matchMedia('(min-width: 900px)').matches;
}

function cover(context, image, width, height, zoom = 1, focusX = 0.5, focusY = 0.5) {
  if (!image?.naturalWidth) return;
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, (width - drawWidth) * focusX, (height - drawHeight) * focusY, drawWidth, drawHeight);
}

export default function CinematicStory({ motion = true }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const panelRefs = useRef([]);
  const triggerRef = useRef(null);
  const phaseRef = useRef(0);
  const [enhanced, setEnhanced] = useState(() => supportsSequence(motion));
  const [phase, setPhase] = useState(0);

  useLayoutEffect(() => {
    const viewport = window.matchMedia('(min-width: 900px)');
    const update = () => setEnhanced(motion && viewport.matches);
    update();
    viewport.addEventListener('change', update);
    return () => {
      viewport.removeEventListener('change', update);
    };
  }, [motion]);

  useLayoutEffect(() => {
    if (!enhanced) return undefined;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!section || !stage || !context) {
      setEnhanced(false);
      return undefined;
    }

    let alive = true;
    let started = false;
    let raf = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;
    const frames = new Array(32).fill(null);
    const images = { poster: null, aerial: null, detail: null };
    const pending = new Set();
    const playhead = { progress: 0 };

    function requestDraw() {
      if (alive && !raf) raf = window.requestAnimationFrame(draw);
    }

    function nearestFrame(index) {
      if (frames[index]) return frames[index];
      for (let distance = 1; distance < frames.length; distance += 1) {
        if (frames[index - distance]) return frames[index - distance];
        if (frames[index + distance]) return frames[index + distance];
      }
      return images.poster;
    }

    function draw() {
      raf = 0;
      if (!alive) return;
      const progress = clamp(playhead.progress);
      const transition = smooth((progress - 0.5) / 0.22);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.globalAlpha = 1;
      context.filter = 'none';
      context.fillStyle = '#22271f';
      context.fillRect(0, 0, width, height);

      if (images.aerial && transition > 0) {
        // The ambient layer fills the stage; the sharp main image always uses
        // contain fitting, preserving every home once the neighborhood arrives.
        context.save();
        context.globalAlpha = transition;
        context.filter = 'blur(22px) brightness(.45) saturate(.72)';
        cover(context, images.aerial, width, height, 1.16);
        context.restore();

        const mainTop = Math.max(240, height * 0.285);
        const mainHeight = Math.max(100, height - mainTop - Math.max(105, height * 0.12));
        const fitting = Math.min((width * 0.94) / images.aerial.naturalWidth, mainHeight / images.aerial.naturalHeight);
        const revealScale = mix(1.045, 1, transition);
        const imageWidth = images.aerial.naturalWidth * fitting * revealScale;
        const imageHeight = images.aerial.naturalHeight * fitting * revealScale;
        context.globalAlpha = smooth((progress - 0.515) / 0.205);
        context.drawImage(images.aerial, (width - imageWidth) / 2, mainTop + (mainHeight - imageHeight) / 2, imageWidth, imageHeight);
        context.globalAlpha = 1;
      }

      if (progress < 0.72) {
        const framePosition = clamp(progress / 0.3) * (frames.length - 1);
        const lower = Math.floor(framePosition);
        const upper = Math.min(frames.length - 1, lower + 1);
        const blend = framePosition - lower;
        const first = progress >= 0.3 && images.detail ? images.detail : nearestFrame(lower);
        const second = progress >= 0.3 ? first : frames[upper] || first;
        let zoom;
        if (progress <= 0.3) zoom = mix(1.02, 1.08, smooth(progress / 0.3));
        else if (progress <= 0.5) zoom = mix(1.08, 1.46, smooth((progress - 0.3) / 0.2));
        else zoom = mix(1.46, 0.76, transition);
        const detail = smooth((progress - 0.3) / 0.2);
        const focusX = mix(0.53, 0.61, detail);
        const focusY = mix(0.51, 0.44, detail);
        context.globalAlpha = 1 - transition;
        cover(context, first, width, height, zoom, focusX, focusY);
        // Crossfade adjacent source frames rather than stepping at frame edges.
        // During the later pullback the held frame has a zero blend fraction.
        if (second !== first && blend > 0) {
          context.globalAlpha = (1 - transition) * blend;
          cover(context, second, width, height, zoom, focusX, focusY);
        }
        context.globalAlpha = 1;
      }

      const nextPhase = progress < 0.3 ? 0 : progress < 0.65 ? 1 : 2;
      if (nextPhase !== phaseRef.current) {
        phaseRef.current = nextPhase;
        setPhase(nextPhase);
      }
      stage.style.setProperty('--cinema-progress', String(progress));
      const copyAlpha = [
        1 - smooth((progress - 0.22) / 0.08),
        smooth((progress - 0.30) / 0.07) * (1 - smooth((progress - 0.57) / 0.07)),
        smooth((progress - 0.66) / 0.08),
      ];
      copyAlpha.forEach((alpha, index) => {
        stage.style.setProperty('--cinema-copy-' + index, String(alpha));
        stage.style.setProperty('--cinema-y-' + index, (1 - alpha) * 20 + 'px');
      });
    }

    function measure() {
      const bounds = stage.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      requestDraw();
    }

    function loadImage(source) {
      return new Promise((resolve) => {
        const image = new Image();
        image.decoding = 'async';
        let settled = false;
        const entry = { finish: null };
        const finish = (result) => {
          if (settled) return;
          settled = true;
          pending.delete(entry);
          image.onload = null;
          image.onerror = null;
          resolve(result);
        };
        entry.finish = finish;
        pending.add(entry);
        image.onload = () => finish(image);
        image.onerror = () => finish(null);
        image.src = source;
      });
    }

    function startLoading() {
      if (started || !alive) return;
      started = true;
      // Four workers bound network/decode work. Source stills and sequence end
      // frames arrive first, providing a reliable picture during progressive load.
      const queue = [
        { key: 'poster', source: '/assets/residence.webp' },
        { key: 'aerial', source: '/assets/community.webp' },
        { key: 'detail', source: '/assets/sequence/detail.webp' },
        { frame: 0, source: '/assets/sequence/house-001.webp' },
        { frame: 31, source: '/assets/sequence/house-032.webp' },
        ...Array.from({ length: 30 }, (_, index) => ({
          frame: index + 1,
          source: `/assets/sequence/house-${String(index + 2).padStart(3, '0')}.webp`,
        })),
      ];
      let cursor = 0;
      async function worker() {
        while (alive && cursor < queue.length) {
          const item = queue[cursor++];
          const image = await loadImage(item.source);
          if (!alive) return;
          if (item.key) images[item.key] = image;
          else frames[item.frame] = image;
          if (image) requestDraw();
        }
      }
      for (let index = 0; index < 4; index += 1) void worker();
    }

    measure();
    const sizeObserver = new ResizeObserver(measure);
    sizeObserver.observe(stage);
    const proximityObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        startLoading();
        proximityObserver.disconnect();
      }
    }, { rootMargin: '100% 0px' });
    proximityObserver.observe(section);

    const tween = gsap.to(playhead, {
      progress: 1,
      ease: 'none',
      onUpdate: requestDraw,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        invalidateOnRefresh: true,
        onRefresh: requestDraw,
      },
    });
    triggerRef.current = tween.scrollTrigger;

    return () => {
      alive = false;
      proximityObserver.disconnect();
      sizeObserver.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      tween.scrollTrigger?.kill();
      tween.kill();
      triggerRef.current = null;
      for (const entry of [...pending]) entry.finish(null);
    };
  }, [enhanced]);

  useEffect(() => {
    if (enhanced) return undefined;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const next = Number(entry.target.dataset.cinemaPanel);
          if (next !== phaseRef.current) {
            phaseRef.current = next;
            setPhase(next);
          }
        }
      }
    }, { rootMargin: '-25% 0px -25% 0px', threshold: 0 });
    panelRefs.current.forEach((panel) => { if (panel) observer.observe(panel); });
    return () => observer.disconnect();
  }, [enhanced]);

  function goToChapter(index) {
    const trigger = triggerRef.current;
    if (enhanced && trigger) {
      window.scrollTo({
        top: trigger.start + (trigger.end - trigger.start) * chapters[index].target,
        behavior: 'instant',
      });
      trigger.update();
      trigger.getTween()?.progress(1);
    } else {
      panelRefs.current[index]?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }

  function chapterNavigation() {
    return (
      <nav className="cinema__navigation" aria-label="Architectural story chapters">
        {chapters.map((chapter, index) => (
          <button
            className={`cinema__chapter-button${phase === index ? ' cinema__chapter-button--active' : ''}`}
            key={chapter.label}
            type="button"
            aria-current={phase === index ? 'step' : undefined}
            onClick={() => goToChapter(index)}
          >
            <span className="cinema__chapter-number">0{index + 1}</span>
            <span>{chapter.label}</span>
          </button>
        ))}
      </nav>
    );
  }

  return (
    <section
      className={`cinema ${enhanced ? 'cinema--enhanced' : 'cinema--static'}`}
      id="architecture"
      data-chapter="04"
      data-phase={phase}
      ref={sectionRef}
      aria-label="From one residence to a shared neighborhood vision"
    >
      {enhanced ? (
        <div className="cinema__stage" ref={stageRef}>
          <canvas className="cinema__canvas" ref={canvasRef} aria-hidden="true" />
          <div className="cinema__shade" aria-hidden="true" />
          <div className="cinema__topline" aria-hidden="true"><span>THE ARCHITECTURAL VISION</span><span>DEXTER ACRES / GRAMA</span></div>
          <div className="cinema__chapters">
            {chapters.map((chapter, index) => (
              <article key={chapter.label} className={`cinema__copy cinema__copy--${index}${phase === index ? ' cinema__copy--active' : ''}`}>
                <p className="cinema__eyebrow">{chapter.eyebrow}</p>
                <h2 className="cinema__title">{chapter.first}<br /><em>{chapter.second}</em></h2>
                <p className="cinema__body">{chapter.body}</p>
              </article>
            ))}
          </div>
          <div className="cinema__bottom">
            {chapterNavigation()}
            <p className="cinema__disclosure">Architectural visualization / AI concept</p>
          </div>
          <div className="cinema__progress" aria-hidden="true"><span /></div>
        </div>
      ) : (
        <div className="cinema__fallback">
          {chapterNavigation()}
          {chapters.map((chapter, index) => (
            <article
              key={chapter.label}
              className={`cinema__panel cinema__panel--${index}`}
              data-cinema-panel={index}
              ref={(node) => { panelRefs.current[index] = node; }}
            >
              <div className="cinema__panel-image"><img src={chapter.image} alt={chapter.alt} width={index === 2 ? 1800 : 1536} height={index === 2 ? 817 : 1024} loading="lazy" /></div>
              <div className="cinema__panel-copy">
                <p className="cinema__eyebrow">{chapter.eyebrow}</p>
                <h2 className="cinema__title">{chapter.first}<br /><em>{chapter.second}</em></h2>
                <p className="cinema__body">{chapter.body}</p>
                <p className="cinema__disclosure">Architectural visualization / AI concept</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
