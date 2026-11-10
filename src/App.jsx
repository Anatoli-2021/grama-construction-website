import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SitePlan, { lotData } from './components/SitePlan.jsx';
import CinematicStory from './components/CinematicStory.jsx';
import { AboutGrama, PropertyCollection, Capabilities, Partnerships, TrustedPartners } from './components/BrandSections.jsx';
import DevelopmentProcess from './components/DevelopmentProcess.jsx';
import Consultation from './components/Consultation.jsx';
import { isLocalPreview } from './preview-mode.js';

gsap.registerPlugin(ScrollTrigger);

const assets = '/assets/';
const enquiryPreviewNote = isLocalPreview
  ? 'Local enquiries are saved only on this computer; no email or CRM delivery is connected.'
  : 'The enquiry form creates a draft in this browser only. Nothing is submitted; contact Grama by telephone.';

function Arrow({ diagonal = false, reverse = false, ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props} style={{ transform: reverse ? 'rotate(180deg)' : undefined }}><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M3 12h17m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.3" /></svg>;
}

function MotionIcon({ paused }) {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">{paused ? <path d="m7 4 9 6-9 6V4Z" fill="currentColor" /> : <><path d="M7 4v12M13 4v12" stroke="currentColor" strokeWidth="2" /></>}</svg>;
}

function App() {
  const root = useRef(null);
  const video = useRef(null);
  const dialog = useRef(null);
  const chapterState = useRef('01');
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(10);
  const [modal, setModal] = useState(null);
  const [consultationRequest, setConsultationRequest] = useState(null);
  const [filmAvailable, setFilmAvailable] = useState(false);
  const [chapter, setChapter] = useState('01');
  const lot = lotData.find(item => item.id === selectedLot);

  useEffect(() => {
    fetch('/assets/residence-film.mp4', { method: 'HEAD' })
      .then(response => setFilmAvailable(response.ok && (response.headers.get('content-type') || '').includes('video')))
      .catch(() => {});
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = event => { if (event.matches) setMotion(false); };
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!video.current) return;
    if (motion) video.current.play().catch(() => {});
    else video.current.pause();
  }, [motion, filmAvailable]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        root.current.querySelector('.menu-button')?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    const sections = [...root.current.querySelectorAll('[data-chapter]')];
    const update = () => {
      const range = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty('--scroll-progress', String(range > 0 ? scrollY / range : 0));
      const current = sections.find(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= innerHeight * .5 && rect.bottom > innerHeight * .5;
      });
      if (current && current.dataset.chapter !== chapterState.current) {
        chapterState.current = current.dataset.chapter;
        setChapter(current.dataset.chapter);
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  useLayoutEffect(() => {
    if (!motion) return;
    const mm = gsap.matchMedia();
    mm.add('all', () => {
      gsap.fromTo('.hero-visual', { scale: 1.045 }, { scale: 1.14, yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.hero-copy', { y: 80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '25% top', end: 'bottom top', scrub: .6 } });
      gsap.utils.toArray('.reveal').forEach(element => gsap.from(element, { y: 36, opacity: 0, duration: 1.1, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } }));
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => { mm.revert(); window.removeEventListener('load', refresh); };
  }, [motion]);

  useEffect(() => {
    if (!modal || !dialog.current) return;
    const previousFocus = document.activeElement;
    dialog.current.showModal();
    return () => {
      if (dialog.current?.open) dialog.current.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [Boolean(modal)]);

  function navigate() { setMenuOpen(false); }
  function openConsultation(options = {}) {
    setMenuOpen(false);
    setConsultationRequest({ path: 'development', topic: 'Development partnership', ...options });
    document.querySelector('#interest').scrollIntoView({ behavior: motion ? 'smooth' : 'instant' });
  }
  function enquireLot() {
    openConsultation({ path: 'home', topic: 'Dexter Acres', lot: String(selectedLot) });
  }

  return (
    <div ref={root} className="experience" data-motion={motion ? 'on' : 'off'}>
      <a className="skip-link" href="#about">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Grama Construction — home" onClick={navigate}><img src={assets + 'logo-light.png'} alt="Grama Construction" width="1633" height="387" /></a>
        <button type="button" className="menu-button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        <nav id="mobile-menu" className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          <a href="#about" onClick={navigate}>About Grama</a>
          <a href="#properties" onClick={navigate}>Projects & listings</a>
          <a href="#services" onClick={navigate}>Services & process</a>
          <a href="#partnerships" onClick={navigate}>Partnerships</a>
          <a href="#architecture" onClick={navigate}>Dexter Acres</a>
          <a className="nav-cta" href="#interest" onClick={navigate}>Discuss a project <Arrow diagonal /></a>
        </nav>
        <div className="header-progress" />
      </header>

      <main>
        <section className="hero" id="home" data-chapter="01" aria-labelledby="hero-title">
          <div className="hero-visual">
            <img className="hero-image" src={assets + 'residence.webp'} alt="Architectural concept of a gabled Dexter Acres residence, with light masonry and dark rooflines" width="1536" height="1024" fetchPriority="high" />
            {filmAvailable && <video ref={video} className="hero-video" src={assets + 'residence-film.mp4'} poster={assets + 'residence.webp'} autoPlay={motion} muted loop playsInline preload="metadata" aria-label="Animated architectural concept of a Dexter Acres residence" />}
          </div>
          <div className="hero-shade" />
          <div className="hero-location"><span className="tiny-dot" /> CHICAGO & CHICAGOLAND <span className="location-line" /> GRAMA CONSTRUCTION</div>
          <div className="hero-copy">
            <p className="eyebrow light">FOR INVESTORS, DEVELOPERS & PROPERTY OWNERS</p>
            <h1 id="hero-title">Luxury custom homes.<br /><em>Residential development.</em></h1>
            <p className="hero-positioning">A family business serving Chicago and Chicagoland.<br />{' '}For property owners, developers and investment partners.</p>
            <div className="hero-actions"><a className="text-link light-link" href="#interest" onClick={event => { event.preventDefault(); openConsultation({ path: 'development', topic: 'Development partnership' }); }}>Discuss a partnership <Arrow /></a><a className="text-link light-link" href="#properties">View completed projects <Arrow diagonal /></a></div>
          </div>
          <div className="hero-bottom"><a href="#architecture" className="scroll-cue"><span />DEXTER ACRES / 14 PLANNED HOMES</a><span className="image-disclosure">Architectural concept{filmAvailable ? ' · AI-animated visualization' : ' rendering'}</span><button className="motion-button" onClick={() => setMotion(!motion)} aria-label={motion ? 'Pause motion' : 'Enable motion'}><MotionIcon paused={!motion} /><span>{motion ? 'PAUSE MOTION' : 'PLAY MOTION'}</span></button></div>
        </section>

        <AboutGrama onConsultation={() => openConsultation()} />
        <PropertyCollection onView={setModal} motion={motion} />

        <CinematicStory motion={motion} />

        <section className="community section-pad" id="community" data-chapter="05" aria-labelledby="community-title">
          <div className="section-heading reveal"><p className="eyebrow">DEXTER ACRES / PROPOSED DEVELOPMENT</p><div className="heading-row"><h2 className="display" id="community-title">Dexter Acres.<br /><em>The proposed neighborhood.</em></h2><p>Explore the proposed 14-home development at Webster and Dexter Lanes in Des Plaines. Select a lot to view the supplied plan’s details.</p></div></div>
          <div className="community-layout"><div className="map-frame"><div className="map-topline"><span>EXPLORE THE PROPOSED LOTS</span><span>SELECT A LOT <Arrow diagonal /></span></div><SitePlan selectedLot={selectedLot} onSelectLot={setSelectedLot} /></div><aside className="lot-panel" aria-live="polite"><div className="lot-panel-top"><span className="eyebrow">LOT DETAILS</span><span className="lot-status">PLANNED COMMUNITY</span></div><div className="lot-number"><span>LOT</span><strong>{String(selectedLot).padStart(2, '0')}</strong></div><h3>{lot.frontage === 'Internal street' ? 'Within the neighborhood.' : 'Along ' + lot.frontage + '.'}</h3><dl><div><dt>Drawing-reported area</dt><dd>{lot.area.toLocaleString('en-US')} <span>sq ft</span></dd></div><div><dt>Frontage</dt><dd>{lot.frontage}</dd></div></dl><button className="button button-dark" onClick={enquireLot}>Enquire about this lot <Arrow diagonal /></button><button className="text-link plan-link" onClick={() => setModal({ image: 'site-plan-original.png', title: 'Supplied subdivision drawing — C5', caption: 'The supplied drawing is the reference for lot numbering. Approval status and current engineering revisions have not been established.' })}>View the source drawing <span>+</span></button><p className="fineprint">Lot selection expresses interest only. Availability, dimensions, home designs and project details are subject to confirmation and the current approved documents.</p></aside></div>
          <div className="community-notes"><div><span className="tiny-number">I.</span><h3>14 planned homes</h3><p>A residential development concept at Webster and Dexter Lanes in Des Plaines.</p></div><div><span className="tiny-number">II.</span><h3>Site coordination</h3><p>Street access, utilities, landscape and drainage depend on the project’s engineering and approved plans.</p></div><div><span className="tiny-number">III.</span><h3>Development enquiries</h3><p>Speak with Grama about the project, a potential collaboration or your interest in a home.</p></div></div>
        </section>

        <Capabilities />
        <DevelopmentProcess onConsultation={() => openConsultation()} />
        <Partnerships onExplore={() => openConsultation({ path: 'development', topic: 'Investment partnership' })} />
        <TrustedPartners />
        <Consultation request={consultationRequest} motion={motion} />
      </main>

      <footer className="site-footer"><div className="footer-navigation"><a href="#about">About Grama</a><a href="#properties">Projects & listings</a><a href="#services">Services</a><a href="#process">The process</a><a href="#partnerships">Development partnerships</a><a href="#interest">Private consultation</a></div><div className="footer-main"><a className="footer-brand" href="#home"><img src={assets + 'logo-light.png'} alt="Grama Construction" width="1633" height="387" /></a><p>A family construction business.<br />Chicago & Chicagoland residential development.</p><a className="footer-phone" href="tel:+17738499634">+1 773 849 9634 <Arrow diagonal /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Grama Construction</span><span>Chicago & the surrounding Illinois suburbs</span><button onClick={() => setModal({ title: 'About this preview', text: 'Dexter Acres is an upcoming, owner-described 14-home development. House images are architectural renderings; the aerial is an AI-generated concept. The interactive map follows the supplied C5 drawing for lot organization and numbering. Project approval status, infrastructure specifications, dates, final designs, pricing and availability have not been confirmed. Completed-project photographs are separately identified and sourced from Grama Construction’s official website. This preview sends no marketing emails and does not reserve a property. ' + enquiryPreviewNote })}>Project & image notes</button></div></footer>
      <div className="chapter-index" aria-hidden="true"><span>{chapter}</span><i />08</div>
      {modal && <dialog ref={dialog} aria-labelledby="preview-dialog-title" className={modal.image ? 'media-dialog' : 'notes-dialog'} onCancel={() => setModal(null)} onClick={event => { if (event.target === event.currentTarget) setModal(null); }}><div className="dialog-sticky-toolbar"><button className="dialog-close" autoFocus aria-label="Close preview" onClick={() => setModal(null)}>×</button></div>{modal.image && <><img src={assets + (modal.images?.[modal.index || 0]?.image || modal.image)} alt={modal.images?.[modal.index || 0]?.alt || modal.title} />{modal.images?.length > 1 && <div className="dialog-gallery-controls"><button aria-label="Previous project photograph" onClick={() => setModal(current => ({ ...current, index: ((current.index || 0) + current.images.length - 1) % current.images.length }))}><Arrow reverse /></button><span>{String((modal.index || 0) + 1).padStart(2, '0')} / {String(modal.images.length).padStart(2, '0')}</span><button aria-label="Next project photograph" onClick={() => setModal(current => ({ ...current, index: ((current.index || 0) + 1) % current.images.length }))}><Arrow /></button></div>}</>}<div className="dialog-caption"><h2 id="preview-dialog-title">{modal.title}</h2><p>{modal.caption || modal.text}</p>{modal.source && <a href={modal.source} target="_blank" rel="noreferrer">Original Grama project page <Arrow diagonal /></a>}</div></dialog>}
    </div>
  );
}

export default App;
