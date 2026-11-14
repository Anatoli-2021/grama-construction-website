import { useEffect, useRef, useState } from 'react';
import { enquiryHref } from '../enquiry-context.js';
import { CONSTRUCTION_CHAPTERS, clampConstructionProgress, getConstructionPose } from './construction-timeline.js';
import ConstructionSequence from './ConstructionSequence.jsx';
import HouseAnimationPlayer from './HouseAnimationPlayer.jsx';
import './AnimatedExperience.css';

const stillDescriptions = ['Unbuilt concept site following the supplied fourteen-lot plan', 'Concept homes taking shape across the proposed neighborhood', 'Approach to one conceptual residence within the neighborhood', 'Conceptual kitchen and living spaces inside the residence', 'Aligned structural cutaway of the same residence', 'The conceptual residence reassembled into its finished form', 'Completed fourteen-home architectural masterplan concept'];
const stills = CONSTRUCTION_CHAPTERS.map((chapter, index) => ({
  image: `/assets/construction/${chapter.id}.webp`,
  title: chapter.title,
  alt: stillDescriptions[index],
}));


function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.2" /></svg>;
}

export default function AnimatedExperience({ motion = true }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const rangeRef = useRef(null);
  const sequenceRef = useRef(null);
  const seekRef = useRef(null);
  const progressRef = useRef(0);
  const phaseRef = useRef(0);
  const pendingStartRef = useRef(false);
  const pendingStillsFocusRef = useRef(false);
  const enableButtonRef = useRef(null);
  const chapterButtons = useRef([]);
  const [clientReady, setClientReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const [viewMode, setViewMode] = useState('scroll');
  const [paused, setPaused] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [sequenceStatus, setSequenceStatus] = useState('idle');
  const scrollMode = clientReady && (optIn || (motion && !reducedMotion)) && viewMode === 'scroll';
  const canvasVisible = sequenceStatus === 'ready' || sequenceStatus === 'buffering';
  const activeChapter = CONSTRUCTION_CHAPTERS[chapter];
  const poster = stills[chapter].image;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) {
        setOptIn(false);
        pendingStartRef.current = false;
      }
    };
    update();
    setClientReady(true);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return undefined;
    let raf = 0;
    function draw(value) {
      const pose = getConstructionPose(value);
      progressRef.current = pose.progress;
      stage.dataset.progress = pose.progress.toFixed(4);
      stage.dataset.phase = pose.stage;
      stage.style.setProperty('--ce-introduction', String(Math.max(0, 1 - pose.progress * 12)));
      stage.style.setProperty('--ce-reveal', String(Math.max(0, Math.min(1, (pose.progress - 0.92) / 0.06))));
      stage.style.setProperty('--ce-progress', String(pose.progress));
      sequenceRef.current?.seek(pose.progress);
      if (rangeRef.current) {
        rangeRef.current.value = String(Math.round(pose.progress * 1000));
        rangeRef.current.setAttribute('aria-valuetext', CONSTRUCTION_CHAPTERS[pose.stageIndex].label);
      }
      if (phaseRef.current !== pose.stageIndex) {
        phaseRef.current = pose.stageIndex;
        setChapter(pose.stageIndex);
      }
    }
    function measure() {
      const distance = -track.getBoundingClientRect().top;
      const range = Math.max(1, track.offsetHeight - window.innerHeight);
      // Fractional mobile viewports can round scroll positions by a device
      // pixel. Keep the first and last authored frames reachable exactly.
      if (distance <= 1) return 0;
      if (range - distance <= 1) return 1;
      return clampConstructionProgress(distance / range);
    }
    function frame() {
      raf = 0;
      if (!paused) draw(measure());
    }
    function requestFrame() {
      if (!raf) raf = window.requestAnimationFrame(frame);
    }
    seekRef.current = value => {
      const progress = clampConstructionProgress(value);
      draw(progress);
      if (scrollMode) {
        const top = track.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + progress * Math.max(1, track.offsetHeight - window.innerHeight), behavior: 'instant' });
      }
    };
    if (!scrollMode) draw(0);
    else if (paused) draw(progressRef.current);
    else requestFrame();
    if (scrollMode) {
      window.addEventListener('scroll', requestFrame, { passive: true });
      window.addEventListener('resize', requestFrame, { passive: true });
    }
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', requestFrame);
      window.removeEventListener('resize', requestFrame);
      seekRef.current = null;
    };
  }, [scrollMode, paused]);

  useEffect(() => {
    if (scrollMode && pendingStartRef.current) {
      pendingStartRef.current = false;
      seekRef.current?.(0);
    }
  }, [scrollMode]);

  useEffect(() => {
    if (!scrollMode && pendingStillsFocusRef.current) {
      pendingStillsFocusRef.current = false;
      enableButtonRef.current?.focus({ preventScroll: true });
    }
  }, [scrollMode]);

  function enableMotion() {
    pendingStartRef.current = true;
    setOptIn(true);
    setViewMode('scroll');
    setPaused(false);
  }
  function showStills() {
    pendingStartRef.current = false;
    pendingStillsFocusRef.current = true;
    setOptIn(false);
    setPaused(false);
    setViewMode('stills');
    window.requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  function chapterKey(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? CONSTRUCTION_CHAPTERS.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : CONSTRUCTION_CHAPTERS.length - 1)) % CONSTRUCTION_CHAPTERS.length;
    chapterButtons.current[next]?.focus();
    seekRef.current?.(CONSTRUCTION_CHAPTERS[next].target);
  }

  return <section className="animated-experience construction-experience" ref={sectionRef} data-mode={scrollMode ? 'scroll' : 'stills'} data-experience="construction" data-sequence-state={sequenceStatus} aria-labelledby="animated-experience-title">
    <div className="ae-scroll-track" ref={trackRef}>
      <div className="ae-stage ce-stage" ref={stageRef} data-phase="land" data-progress="0" data-artlist-status={sequenceStatus}>
        <div className="ce-picture" aria-hidden={!scrollMode}>
          <img className="ce-poster" src={poster} alt="" width="1280" height="720" fetchPriority="high" style={{ opacity: canvasVisible ? 0 : 1 }} />
          <ConstructionSequence ref={sequenceRef} enabled={scrollMode} onStatusChange={setSequenceStatus} />
        </div>
        <div className="ce-shade" aria-hidden="true" />
        <header className="ce-intro"><p className="site-label">GRAMA / ANIMATED EXPERIENCE</p><h1 id="animated-experience-title">A closer<br />look.</h1><p className={sequenceStatus === 'error' ? 'ce-load-message' : undefined} role={sequenceStatus === 'error' ? 'status' : undefined}>{sequenceStatus === 'error' ? 'Animation unavailable. View the stills or play the film.' : 'From neighborhood to residence.'}</p></header>
        <div className="ae-view-options" aria-label="Experience display options">{scrollMode ? <>
          <button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}><span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>{paused ? 'Resume' : 'Pause'}</button>
          <button type="button" onClick={showStills}>View stills</button>
        </> : <button ref={enableButtonRef} type="button" onClick={enableMotion} disabled={!clientReady}>Enable scroll animation <Arrow /></button>}</div>
        <div className="ce-caption" aria-live="polite" aria-atomic="true"><span className="site-label">{String(chapter + 1).padStart(2, '0')} / {activeChapter.label}</span><h2>{activeChapter.title}</h2><p>{activeChapter.text}</p></div>
        <div className="ce-brand-reveal" aria-hidden="true"><img className="ce-reveal-wordmark" src="/assets/brand/grama-development.svg" alt="" width="780" height="240" /></div>
        <div className="ce-film"><HouseAnimationPlayer source="/assets/construction/construction-film.mp4" poster="/assets/construction/residence.webp" label="Play film" ariaLabel="Play the architectural film" title="A closer look" description="Continuous architectural concept from a neighborhood into one residence and its structure" loop={false} /></div>
        <p className="ce-disclosure">Architectural concept.<br />Illustrative construction sequence.</p>
        {scrollMode && <div className="ae-scroll-controls">
          <div className="ae-scroll-instruction"><span>Scroll to explore <span aria-hidden="true">↓</span></span><span>Reverse to return</span></div>
          <label className="ae-range-label"><span className="ae-sr-only">Experience progress</span><input ref={rangeRef} type="range" min="0" max="1000" step="1" defaultValue="0" aria-label="Experience progress" onChange={event => seekRef.current?.(Number(event.target.value) / 1000)} /></label>
          <nav className="ae-chapters" aria-label="Animation chapters">{CONSTRUCTION_CHAPTERS.map((item, index) => <button type="button" key={item.id} ref={element => { chapterButtons.current[index] = element; }} aria-label={`${String(index + 1).padStart(2, '0')} ${item.label}`} aria-current={chapter === index ? 'step' : undefined} onClick={() => seekRef.current?.(item.target)} onKeyDown={event => chapterKey(event, index)}><span>{String(index + 1).padStart(2, '0')}</span><span className="ce-chapter-label">{item.label}</span></button>)}</nav>
        </div>}
      </div>
    </div>
    {!scrollMode && <div className="ae-storyboard" aria-label="Construction concept in seven stills">{stills.map((item, index) => <figure key={item.image}><img src={item.image} alt={item.alt} width="1280" height="720" loading="lazy" /><figcaption><span>0{index + 1} / Architectural concept</span><h2>{item.title}</h2></figcaption></figure>)}</div>}
    <section className="ce-editorial" aria-labelledby="ce-editorial-title"><div><p className="site-label">THE ARCHITECTURAL STUDY</p><h2 id="ce-editorial-title">One neighborhood.<br />A closer look.</h2></div><div><p>Explore a residential community, step inside a home and discover the structure beneath its finishes. Continue below to Grama’s completed work.</p><p className="ce-factual-note">Illustrative architectural concept based on the supplied lot plan. Building designs, landscaping and final specifications are not approved.</p></div></section>
    <section className="ce-work" aria-labelledby="ce-work-title"><div className="ce-work-heading"><p className="site-label">BUILT BY GRAMA</p><h2 id="ce-work-title">The work, in reality.</h2><a className="site-link" href="/projects">Explore the portfolio <Arrow /></a></div><div className="ce-work-grid"><a href="/projects/1171-prospect-lane"><img src="/assets/portfolio-prospect.webp" alt="Completed masonry residence at 1171 Prospect Lane" width="1600" height="1067" loading="lazy" /><span>1171 Prospect Lane <Arrow /></span></a><a href="/projects/1906-lee-street"><img src="/assets/photo/lee-kitchen-living.webp" alt="Completed kitchen and living spaces at 1906 Lee Street" width="2000" height="1334" loading="lazy" /><span>1906 Lee Street <Arrow /></span></a></div></section>
    <section className="ce-continue"><p className="site-label">THE DEVELOPMENT</p><h2>Explore Dexter Acres.</h2><p>Continue to the proposed fourteen-lot plan, or speak with our team.</p><div><a href="/projects/dexter-acres#community">Explore the lot plan <Arrow /></a><a href={enquiryHref({ path: 'home', topic: 'Dexter Acres' })}>Discuss Dexter Acres <Arrow /></a></div></section>
  </section>;
}
