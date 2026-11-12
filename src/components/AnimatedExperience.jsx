import { useEffect, useRef, useState } from 'react';
import { enquiryHref } from '../enquiry-context.js';
import { EXPERIENCE_CHAPTERS, clampProgress, getAnimatedPose, poseStyles } from './animated-timeline.js';
import ArtlistHouseSequence from './ArtlistHouseSequence.jsx';
import HouseAnimationPlayer from './HouseAnimationPlayer.jsx';
import { getHouseClipProgress } from './artlist-house-sequence.js';
import './AnimatedExperience.css';

const assets = {
  complete: '/assets/animated/house-complete.webp',
  structure: '/assets/animated/house-structure.webp',
  roof: '/assets/animated/roof.png',
  facade: '/assets/animated/facade.png',
};

const chapters = [
  { title: 'The house, considered.', text: 'Gabled rooflines. Light masonry. A sheltered entrance. Explore the architectural idea from a different perspective.' },
  { title: 'One home. Its many layers.', text: 'The roof lifts and the exterior opens, revealing the frame beneath.' },
  { title: 'The structure, revealed.', text: 'An open view of the timber-frame concept and the space it begins to define.' },
  { title: 'A wider perspective.', text: 'From one residence to a proposed neighborhood at Webster and Dexter Lanes in Des Plaines.' },
];

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.2" /></svg>;
}

function LayeredHouse({ className = '', stillProgress, mediaReady = false, motionSlot = null, hideLayers = false }) {
  return <div className={`ae-house-plane ${className}`} style={stillProgress === undefined ? undefined : poseStyles(getAnimatedPose(stillProgress))}>
    <div className="ae-house-camera" data-ready={mediaReady ? 'true' : 'false'} style={hideLayers ? { visibility: 'hidden' } : undefined} aria-hidden={hideLayers || undefined} role="img" aria-label="Illustrative architectural concept of a gabled residence, with roof and exterior layers separated to reveal its timber frame">
      <img className="ae-house-fallback" src={assets.complete} alt="" width="1672" height="941" decoding="async" />
      <div className="ae-house-layers" data-ready={mediaReady ? 'true' : 'false'} aria-hidden="true">
        <img className="ae-structure" src={assets.structure} alt="" width="1672" height="941" decoding="async" />
        <img className="ae-facade ae-facade--left" src={assets.facade} alt="" width="1672" height="941" decoding="async" />
        <img className="ae-facade ae-facade--right" src={assets.facade} alt="" width="1672" height="941" decoding="async" />
        <img className="ae-roof" src={assets.roof} alt="" width="1672" height="941" decoding="async" />
      </div>
    </div>
    {motionSlot}
  </div>;
}

export default function AnimatedExperience({ motion = true }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const rangeRef = useRef(null);
  const sequenceRef = useRef(null);
  const chapterButtonRefs = useRef([]);
  const seekRef = useRef(null);
  const pendingStartRef = useRef(false);
  const progressRef = useRef(0);
  const chapterRef = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [clientReady, setClientReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionOptIn, setMotionOptIn] = useState(false);
  const [paused, setPaused] = useState(false);
  const [viewMode, setViewMode] = useState('scroll');
  const [mediaStatus, setMediaStatus] = useState('loading');
  const [artlistStatus, setArtlistStatus] = useState('idle');
  const motionAllowed = motionOptIn || (motion && !reducedMotion);
  const wantsMotion = clientReady && motionAllowed && viewMode === 'scroll';
  const canAnimate = mediaStatus !== 'unavailable' || artlistStatus === 'loading' || artlistStatus === 'ready';
  const scrollMode = wantsMotion && canAnimate;
  const filmReady = scrollMode && artlistStatus === 'ready';
  const motionUnavailable = mediaStatus === 'unavailable' && artlistStatus === 'error';
  const mediaReady = mediaStatus === 'ready';

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) {
        setMotionOptIn(false);
        pendingStartRef.current = false;
      }
    };
    update();
    setClientReady(true);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let alive = true;
    const images = [assets.structure, assets.roof, assets.facade].map(src => new Promise((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    }));
    Promise.all(images).then(() => { if (alive) setMediaStatus('ready'); }, () => { if (alive) setMediaStatus('unavailable'); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return undefined;
    let raf = 0;
    function draw(progress) {
      const pose = getAnimatedPose(progress);
      sequenceRef.current?.seek(getHouseClipProgress(pose.progress));
      progressRef.current = pose.progress;
      stage.dataset.progress = pose.progress.toFixed(4);
      stage.dataset.phase = EXPERIENCE_CHAPTERS[pose.chapterIndex].id;
      for (const [key, value] of Object.entries(poseStyles(pose))) stage.style.setProperty(key, value);
      if (rangeRef.current) {
        rangeRef.current.value = String(Math.round(pose.progress * 1000));
        rangeRef.current.setAttribute('aria-valuetext', EXPERIENCE_CHAPTERS[pose.chapterIndex].label);
      }
      if (chapterRef.current !== pose.chapterIndex) {
        chapterRef.current = pose.chapterIndex;
        setChapter(pose.chapterIndex);
      }
    }
    function measure() {
      const distance = Math.max(1, track.offsetHeight - window.innerHeight);
      return clampProgress(-track.getBoundingClientRect().top / distance);
    }
    function frame() {
      raf = 0;
      if (!paused) draw(measure());
    }
    function requestFrame() {
      if (!raf) raf = window.requestAnimationFrame(frame);
    }
    seekRef.current = progress => {
      const target = clampProgress(progress);
      draw(target);
      if (scrollMode) {
        const top = track.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + target * Math.max(1, track.offsetHeight - window.innerHeight), behavior: 'instant' });
      }
    };
    if (!scrollMode) {
      draw(0);
      return () => { seekRef.current = null; };
    }
    if (paused) draw(progressRef.current);
    else requestFrame();
    window.addEventListener('scroll', requestFrame, { passive: true });
    window.addEventListener('resize', requestFrame, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', requestFrame);
      window.removeEventListener('resize', requestFrame);
      seekRef.current = null;
    };
  }, [scrollMode, paused]);

  useEffect(() => {
    if (!scrollMode || !pendingStartRef.current) return;
    pendingStartRef.current = false;
    seekRef.current?.(0);
  }, [scrollMode]);

  function jumpTo(index) {
    seekRef.current?.(EXPERIENCE_CHAPTERS[index].target);
  }
  function navigateChapters(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (index + (event.key === 'ArrowRight' ? 1 : 3)) % 4;
    chapterButtonRefs.current[next]?.focus();
    jumpTo(next);
  }
  function showStills() {
    pendingStartRef.current = false;
    setMotionOptIn(false);
    setViewMode('stills');
    setPaused(false);
    window.requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }

  function enableScrollAnimation() {
    pendingStartRef.current = true;
    setMotionOptIn(true);
    setPaused(false);
    setViewMode('scroll');
  }

  return <section ref={sectionRef} className="animated-experience" data-mode={scrollMode ? 'scroll' : 'stills'} data-media-ready={mediaReady ? 'true' : 'false'} aria-labelledby="animated-experience-title">
    <svg className="ae-filter-defs" aria-hidden="true" focusable="false"><defs><filter id="grama-ae-facade-edge" colorInterpolationFilters="sRGB"><feMorphology in="SourceAlpha" operator="erode" radius="1.25" result="trimmedAlpha" /><feComposite in="SourceGraphic" in2="trimmedAlpha" operator="in" /></filter></defs></svg>
    <div className="ae-scroll-track" ref={trackRef}>
      <div className="ae-stage" ref={stageRef} data-phase="house" data-progress="0" data-artlist-status={artlistStatus}>
        <div className="ae-stage-grain" aria-hidden="true" />
        <div className="ae-world">
          <div className="ae-aerial" role="img" aria-label="AI-generated conceptual aerial of the proposed Dexter Acres neighborhood">
            <img src="/assets/community.webp" alt="" width="1800" height="817" decoding="async" />
          </div>
          <LayeredHouse mediaReady={mediaReady} hideLayers={filmReady} motionSlot={<ArtlistHouseSequence ref={sequenceRef} enabled={wantsMotion} onStatusChange={setArtlistStatus} />} />
          <div className="ae-frame-detail" aria-hidden="true"><i /><i /><i /><i /></div>
        </div>

        <header className="ae-heading">
          <p className="ae-eyebrow">Grama Development <span>/</span> Dexter Acres</p>
          <h1 id="animated-experience-title">Animated<br />Experience.</h1>
          <p className="ae-disclosure">AI-animated architectural concept.<br />Structure and materials are shown conceptually.</p>
          <HouseAnimationPlayer />
        </header>

        <div className="ae-view-options" aria-label="Experience display options">
          {scrollMode ? <>
            <button type="button" className="ae-pause" onClick={() => setPaused(value => !value)} aria-pressed={paused}>
              <span className={paused ? 'ae-play-icon' : 'ae-pause-icon'} aria-hidden="true" />
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" onClick={showStills}>View stills</button>
          </> : <button type="button" onClick={enableScrollAnimation} disabled={!clientReady || motionUnavailable}>{motionUnavailable ? 'Scroll animation unavailable' : 'Enable scroll animation'}<Arrow /></button>}
        </div>

        <div className="ae-chapter-copy">
          {chapters.map((item, index) => <div className={`ae-copy ae-copy--${index}`} key={item.title} aria-hidden={index !== chapter}>
            <p className="ae-chapter-number">0{index + 1} <span>/</span> {EXPERIENCE_CHAPTERS[index].label}</p>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            {index === 3 && <p className="ae-aerial-disclosure">AI-generated neighborhood concept</p>}
          </div>)}
        </div>

        {mediaStatus !== 'ready' && artlistStatus !== 'ready' && <p className="ae-media-status" role="status">{mediaStatus === 'loading' || artlistStatus === 'loading' ? 'Preparing the architectural animation…' : 'The animated view is unavailable. Showing the complete house concept.'}</p>}

        <div className="ae-scroll-controls">
          <div className="ae-scroll-instruction"><span>{paused ? 'Animation paused' : 'Scroll to explore'}</span><span className="ae-scroll-arrow" aria-hidden="true">↓</span><span>Reverse your scroll to return</span></div>
          <label className="ae-range-label"><span className="ae-sr-only">Experience progress</span><input ref={rangeRef} type="range" min="0" max="1000" step="1" defaultValue="0" aria-valuetext="House" onChange={event => seekRef.current?.(Number(event.target.value) / 1000)} /></label>
          <nav className="ae-chapters" aria-label="Animation chapters">{EXPERIENCE_CHAPTERS.map((item, index) => <button ref={element => { chapterButtonRefs.current[index] = element; }} type="button" key={item.id} onClick={() => jumpTo(index)} onKeyDown={event => navigateChapters(event, index)} aria-current={chapter === index ? 'step' : undefined}><span>0{index + 1}</span>{item.label}</button>)}</nav>
        </div>
        <p className="ae-sr-only" aria-live="polite">{EXPERIENCE_CHAPTERS[chapter].label}. {chapters[chapter].title}</p>
      </div>
    </div>

    <div className="ae-storyboard" aria-label="Architectural study in four stills">
      {chapters.map((item, index) => mediaStatus === 'unavailable' && (index === 1 || index === 2) ? null : <article className="ae-still" key={item.title}>
        <div className={`ae-still-visual ae-still-visual--${index}`}>
          {index === 3 ? <img src="/assets/community.webp" alt="AI-generated concept aerial of the proposed Dexter Acres neighborhood" width="1800" height="817" loading="lazy" /> : <LayeredHouse mediaReady={mediaReady} stillProgress={EXPERIENCE_CHAPTERS[index].target} />}
        </div>
        <div className="ae-still-copy"><span className="ae-chapter-number">0{index + 1} / {EXPERIENCE_CHAPTERS[index].label}</span><h2>{item.title}</h2><p>{item.text}</p>{index === 3 && <p className="ae-aerial-disclosure">AI-generated neighborhood concept</p>}</div>
      </article>)}
    </div>

    <div className="ae-next">
      <div><p className="ae-eyebrow">Continue exploring</p><h2>See the bigger picture.</h2><p>Explore the proposed fourteen-lot plan or speak with Grama Development about Dexter Acres.</p></div>
      <div className="ae-next-links"><a href="/projects/dexter-acres#community">Explore the lot plan <Arrow /></a><a href={enquiryHref({ path: 'home', topic: 'Dexter Acres' })}>Discuss Dexter Acres <Arrow /></a></div>
    </div>
  </section>;
}
