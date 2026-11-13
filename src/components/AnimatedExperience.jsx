import { useEffect, useRef, useState } from 'react';
import { enquiryHref } from '../enquiry-context.js';
import { clampSequenceProgress } from './artlist-house-sequence.js';
import { JOURNEY_CHAPTERS, JOURNEY_SCENES, getJourneyPose } from './journey-timeline.js';
import JourneySequence from './JourneySequence.jsx';
import HouseAnimationPlayer from './HouseAnimationPlayer.jsx';
import './AnimatedExperience.css';

const stills = [
  { image: '/assets/animated/house-complete.webp', title: 'The residence.', alt: 'Gabled Dexter Acres residence concept with timber and light masonry' },
  { image: '/assets/film/interior-poster.webp', title: 'The interior.', alt: 'Conceptual interior with timber beams, living space and kitchen' },
  { image: '/assets/animated/house-structure.webp', title: 'The structure.', alt: 'Illustrative house concept opened to reveal the timber frame' },
  { image: '/assets/community.webp', title: 'The neighborhood.', alt: 'Architectural concept of the proposed Dexter Acres neighborhood' },
];

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
  const activeChapter = JOURNEY_CHAPTERS[chapter];
  const poster = chapter === 2 ? JOURNEY_SCENES[1].poster : chapter === 3 ? JOURNEY_SCENES[2].poster : JOURNEY_SCENES[0].poster;

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
      const pose = getJourneyPose(value);
      progressRef.current = pose.progress;
      stage.dataset.progress = pose.progress.toFixed(4);
      stage.dataset.phase = pose.phase;
      stage.style.setProperty('--journey-overview', String(pose.overview));
      stage.style.setProperty('--journey-introduction', String(pose.introduction));
      stage.style.setProperty('--journey-progress', String(pose.progress));
      sequenceRef.current?.seek(pose);
      if (rangeRef.current) {
        rangeRef.current.value = String(Math.round(pose.progress * 1000));
        rangeRef.current.setAttribute('aria-valuetext', JOURNEY_CHAPTERS[pose.chapterIndex].label);
      }
      if (phaseRef.current !== pose.chapterIndex) {
        phaseRef.current = pose.chapterIndex;
        setChapter(pose.chapterIndex);
      }
    }
    function measure() {
      return clampSequenceProgress(-track.getBoundingClientRect().top / Math.max(1, track.offsetHeight - window.innerHeight));
    }
    function frame() {
      raf = 0;
      if (!paused) draw(measure());
    }
    function requestFrame() {
      if (!raf) raf = window.requestAnimationFrame(frame);
    }
    seekRef.current = value => {
      const progress = clampSequenceProgress(value);
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

  function enableMotion() {
    pendingStartRef.current = true;
    setOptIn(true);
    setViewMode('scroll');
    setPaused(false);
  }
  function showStills() {
    pendingStartRef.current = false;
    setOptIn(false);
    setPaused(false);
    setViewMode('stills');
    window.requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  function chapterKey(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? JOURNEY_CHAPTERS.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : JOURNEY_CHAPTERS.length - 1)) % JOURNEY_CHAPTERS.length;
    chapterButtons.current[next]?.focus();
    seekRef.current?.(JOURNEY_CHAPTERS[next].target);
  }

  return <section className="animated-experience architectural-journey" ref={sectionRef} data-mode={scrollMode ? 'scroll' : 'stills'} data-experience="journey" aria-labelledby="animated-experience-title">
    <div className="ae-scroll-track" ref={trackRef}>
      <div className="ae-stage journey-stage" ref={stageRef} data-phase="arrival" data-progress="0" data-artlist-status={sequenceStatus}>
        <div className="journey-picture" aria-hidden={!scrollMode}>
          <img className="journey-poster" src={poster} alt="" width="1920" height="1080" style={{ opacity: canvasVisible ? 0 : 1 }} />
          <JourneySequence ref={sequenceRef} enabled={scrollMode} onStatusChange={setSequenceStatus} className="ae-artlist-sequence" />
        </div>
        <div className="journey-overview"><img src="/assets/community.webp" alt="Architectural concept of the proposed fourteen-home Dexter Acres neighborhood" width="1800" height="817" /></div>
        <div className="journey-shade" aria-hidden="true" />
        <header className="journey-intro"><p className="site-label">GRAMA / DEXTER ACRES</p><h1 id="animated-experience-title">Animated<br />Experience.</h1><p>A cinematic architectural concept.</p></header>
        <div className="ae-view-options" aria-label="Experience display options">{scrollMode ? <>
          <button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}><span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>{paused ? 'Resume' : 'Pause'}</button>
          <button type="button" onClick={showStills}>View stills</button>
        </> : <button type="button" onClick={enableMotion} disabled={!clientReady}>Enable scroll animation <Arrow /></button>}</div>
        <div className="journey-caption" aria-live="polite" aria-atomic="true"><span className="site-label">{String(chapter + 1).padStart(2, '0')} / {activeChapter.label}</span><h2>{activeChapter.title}</h2><p>{activeChapter.text}</p></div>
        <div className="journey-film"><HouseAnimationPlayer source="/assets/film/journey.mp4" /></div>
        <p className="ae-journey-disclosure">AI architectural concept. Final design subject to confirmation.</p>
        {scrollMode && <div className="ae-scroll-controls">
          <div className="ae-scroll-instruction"><span>Scroll to explore <span aria-hidden="true">↓</span></span><span>Reverse to return</span></div>
          <label className="ae-range-label"><span className="ae-sr-only">Experience progress</span><input ref={rangeRef} type="range" min="0" max="1000" step="1" defaultValue="0" aria-label="Experience progress" onChange={event => seekRef.current?.(Number(event.target.value) / 1000)} /></label>
          <nav className="ae-chapters" aria-label="Animation chapters">{JOURNEY_CHAPTERS.map((item, index) => <button type="button" key={item.id} ref={element => { chapterButtons.current[index] = element; }} aria-current={chapter === index ? 'step' : undefined} onClick={() => seekRef.current?.(item.target)} onKeyDown={event => chapterKey(event, index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.label}</button>)}</nav>
        </div>}
        {sequenceStatus === 'error' && scrollMode && <p className="journey-error" role="status">This view could not load. View the stills or play the film.</p>}
      </div>
    </div>
    {!scrollMode && <div className="ae-storyboard" aria-label="Architectural concept in four stills">{stills.map((item, index) => <figure key={item.image}><img src={item.image} alt={item.alt} width="1920" height="1080" loading="lazy" /><figcaption><span>0{index + 1} / Architectural concept</span><h2>{item.title}</h2></figcaption></figure>)}</div>}
    <section className="journey-continue"><p className="site-label">THE DEVELOPMENT</p><h2>Explore Dexter Acres.</h2><p>Continue to the proposed fourteen-lot plan, or speak with our team.</p><div><a href="/projects/dexter-acres#community">Explore the lot plan <Arrow /></a><a href={enquiryHref({ path: 'home', topic: 'Dexter Acres' })}>Discuss Dexter Acres <Arrow /></a></div></section>
  </section>;
}
