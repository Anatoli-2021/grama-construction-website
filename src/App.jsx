import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DexterExperience from './components/DexterExperience.jsx';
import AnimatedExperience from './components/AnimatedExperience.jsx';
import { AboutPage, PartnershipsPage, ContactPage } from './components/CompanyPages.jsx';
import { ProjectsPage, ProjectCase } from './components/ProjectPages.jsx';
import { getRoute, notFoundRoute } from './site-routes.js';
import { readEnquiryContext, enquiryHref } from './enquiry-context.js';
import { AboutGrama, PropertyCollection, TrustedPartners } from './components/BrandSections.jsx';
import { isLocalPreview } from './preview-mode.js';

gsap.registerPlugin(ScrollTrigger);

const assets = '/assets/';
const enquiryPreviewNote = isLocalPreview
  ? 'Local enquiries are saved only on this computer; no email or CRM delivery is connected.'
  : 'The Contact page shows whether online submission is available. Submitted enquiries are sent through Grama Development’s configured email service. Browser-only drafts are not sent.';

function Arrow({ diagonal = false, reverse = false, ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props} style={{ transform: reverse ? 'rotate(180deg)' : undefined }}><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M3 12h17m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.3" /></svg>;
}

function MotionIcon({ paused }) {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">{paused ? <path d="m7 4 9 6-9 6V4Z" fill="currentColor" /> : <><path d="M7 4v12M13 4v12" stroke="currentColor" strokeWidth="2" /></>}</svg>;
}

function App({ initialPath } = {}) {
  const route = getRoute(initialPath ?? (typeof window === 'undefined' ? '/' : window.location.pathname)) || notFoundRoute;
  const isHome = route.type === 'home';
  const root = useRef(null);
  const dialog = useRef(null);
  const chapterState = useRef('01');
  const [motion, setMotion] = useState(() => typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [consultationRequest, setConsultationRequest] = useState(() => typeof window === 'undefined' ? null : readEnquiryContext(window.location.search));
  const [chapter, setChapter] = useState('01');

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = event => { if (event.matches) setMotion(false); };
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const mobile = window.matchMedia('(max-width: 900px)');
    if (!mobile.matches) { setMenuOpen(false); return; }
    const header = root.current.querySelector('.site-header');
    const trigger = header.querySelector('.menu-button');
    const background = [...root.current.querySelectorAll('main, .site-footer, .skip-link, .chapter-index')];
    const previousInert = background.map(element => element.inert);
    const previousOverflow = document.body.style.overflow;
    background.forEach(element => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    header.querySelector('.main-nav a')?.focus({ preventScroll: true });
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        trigger.focus({ preventScroll: true });
      } else if (event.key === 'Tab') {
        const targets = [...header.querySelectorAll('a[href], button')].filter(element => element.getClientRects().length && !element.disabled);
        if (event.shiftKey && document.activeElement === targets[0]) {
          event.preventDefault(); targets.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === targets.at(-1)) {
          event.preventDefault(); targets[0]?.focus();
        }
      }
    };
    const onResize = event => { if (!event.matches) setMenuOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    mobile.addEventListener('change', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      mobile.removeEventListener('change', onResize);
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      document.body.style.overflow = previousOverflow;
    };
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
      if (isHome) {
      gsap.to('.hero-visual', { yPercent: 3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.hero-copy', { y: 80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '25% top', end: 'bottom top', scrub: .6 } });
      }
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

  useEffect(() => {
    if (!isHome) return;
    const legacy = { '#services': '/about#services', '#process': '/partnerships#process', '#partnerships': '/partnerships', '#interest': '/contact', '#architecture': '/projects/dexter-acres#architecture', '#community': '/projects/dexter-acres#community' };
    const destination = legacy[window.location.hash];
    if (destination) window.location.replace(destination);
  }, []);

  function navigate() { setMenuOpen(false); }
  function openConsultation(options = {}) {
    setMenuOpen(false);
    const request = { path: 'development', topic: 'Development partnership', ...options };
    if (route.type === 'contact') {
      setConsultationRequest(request);
      document.querySelector('#interest')?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant' });
    } else window.location.assign(enquiryHref(request));
  }
  function current(path) { return route.path === path ? 'page' : undefined; }


  return (
    <div ref={root} className={"experience" + (isHome ? " heritage-home" : " interior-page") + (route.type === 'animated' ? " animated-route" : "")} data-motion={motion ? 'on' : 'off'}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={"site-header" + (isHome ? "" : " site-header--solid")}>
        <a className="brand development-lockup" href="/" aria-label="Grama Development — home" onClick={navigate}><img className="development-g" src="/assets/brand/grama-g.svg" alt="" width="100" height="100" /><img className="development-wordmark" src="/assets/brand/grama-development.svg" alt="Grama Development" width="780" height="240" /></a>
        <button type="button" className="menu-button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        <nav id="mobile-menu" className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          <a href="/about" aria-current={current('/about')} onClick={navigate}>About</a>
          <a href="/projects" aria-current={current('/projects')} data-active={route.type === 'project' ? 'true' : undefined} onClick={navigate}>Projects</a>
          <a href="/partnerships" aria-current={current('/partnerships')} onClick={navigate}>Partnerships</a>
          <a href="/projects/dexter-acres" aria-current={current('/projects/dexter-acres')} onClick={navigate}>Dexter Acres</a>
          <a href="/animated-experience" aria-current={current('/animated-experience')} onClick={navigate}>Animated Experience</a>
          <a className="nav-cta" href="/contact" aria-current={current('/contact')} onClick={navigate}>Contact <Arrow diagonal /></a>
        </nav>
        <div className="header-progress" />
      </header>

      <main id="main-content" tabIndex={-1}>
        {isHome && <>
        <section className="hero" id="home" data-chapter="01" aria-labelledby="hero-title">
          <div className="hero-visual">
            <img className="hero-image" src={assets + 'original-home-hero.webp'} alt="Original Grama company photograph of three neighboring houses with masonry façades" width="1536" height="983" fetchPriority="high" />
          </div>
          <div className="hero-shade" />
          <div className="hero-copy">
            <p className="eyebrow light">Grama Development / Chicagoland</p>
            <h1 id="hero-title">Luxury homes.<br /><em>Complete development.</em></h1>
            <p className="hero-positioning">From site planning and design coordination through construction.</p>
            <div className="hero-actions"><a className="text-link light-link" href="/projects">View completed projects <Arrow diagonal /></a><a className="text-link light-link" href="/contact">Discuss your project <Arrow /></a></div>
          </div>
          <div className="hero-bottom"><a href="#properties" className="scroll-cue"><span />EXPLORE COMPLETED WORK</a><span className="image-disclosure">Original company photography</span><button className="motion-button" onClick={() => setMotion(!motion)} aria-label={motion ? 'Pause motion' : 'Enable motion'}><MotionIcon paused={!motion} /><span>{motion ? 'PAUSE MOTION' : 'PLAY MOTION'}</span></button></div>
        </section>
        <AboutGrama onConsultation={() => openConsultation()} />
        <PropertyCollection motion={motion} showConceptPreview={false} />
        <section className="animated-invitation animated-invitation--text"><div><p className="eyebrow light">ARCHITECTURAL CONCEPT STUDY</p><h2>A closer look at the architecture.</h2><p>Explore the separate Animated Experience and proposed Dexter Acres project. Concept visualizations are distinct from the completed-project photography shown here.</p><a className="text-link light-link" href="/animated-experience">Enter the concept experience <Arrow diagonal /></a></div><a className="text-link light-link" href="/projects/dexter-acres">Explore Dexter Acres and the lot plan <Arrow diagonal /></a></section>
        <TrustedPartners />
        <section className="page-invitation section-pad" data-chapter="08"><p className="eyebrow">WORK WITH GRAMA DEVELOPMENT</p><h2 className="display">A site, a home<br /><em>or a development.</em></h2><p>Meet the team, review our work and tell us about your project.</p><ul className="opportunity-links"><li><a href={enquiryHref({path:'development',topic:'Landowner opportunity'})}>I have land <Arrow diagonal /></a></li><li><a href={enquiryHref({path:'development',topic:'Development partnership'})}>I have a development <Arrow diagonal /></a></li><li><a href={enquiryHref({path:'development',topic:'Investment partnership'})}>I’m interested in partnering <Arrow diagonal /></a></li></ul><div><a className="button button-dark" href="/partnerships">Development partnerships <Arrow diagonal /></a><a className="text-link" href="/contact">Contact Grama Development <Arrow diagonal /></a></div></section>
        </>}
        {route.type === 'animated' && <AnimatedExperience motion={motion} />}
        {route.type === 'about' && <AboutPage onConsultation={openConsultation} />}
        {route.type === 'projects' && <ProjectsPage />}
        {route.type === 'project' && <ProjectCase project={route.project} onView={setModal} />}
        {route.type === 'partnerships' && <PartnershipsPage onExplore={openConsultation} />}
        {route.type === 'contact' && <ContactPage request={consultationRequest} motion={motion} />}
        {route.type === 'dexter' && <>
          <header className="page-masthead section-pad"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/projects">Projects</a><span aria-hidden="true">/</span><span>Dexter Acres</span></nav><p className="eyebrow">DES PLAINES / PROPOSED DEVELOPMENT</p><h1>Dexter Acres.<br /><em>14 planned homes.</em></h1><p>Explore the architectural concept and supplied lot plan for the proposed neighborhood at Webster and Dexter Lanes.</p><div className="page-masthead-actions"><a className="text-link" href="#community">Explore the lot plan <Arrow diagonal /></a><button className="text-link" aria-label={motion ? 'Pause motion' : 'Enable motion'} onClick={() => setMotion(!motion)}><MotionIcon paused={!motion} />{motion ? 'Pause motion' : 'Enable motion'}</button></div></header>
          <DexterExperience motion={motion} onView={setModal} onConsultation={openConsultation} />
          <section className="page-invitation section-pad"><p className="eyebrow">DEXTER ACRES ENQUIRIES</p><h2 className="display">Discuss the project<br /><em>with Grama Development.</em></h2><p>For development partnerships, project details or interest in a home, speak with our team.</p><a className="button button-dark" href={enquiryHref({path:'home',topic:'Dexter Acres'})}>Enquire about Dexter Acres <Arrow diagonal /></a></section>
        </>}
        {route.type === 'not-found' && <section className="page-masthead not-found-page section-pad"><p className="eyebrow">404 / PAGE NOT FOUND</p><h1>This page<br /><em>could not be found.</em></h1><p>Explore Grama Development’s work or contact us about your project.</p><div><a className="button button-dark" href="/projects">Explore projects <Arrow diagonal /></a><a className="text-link" href="/">Return home <Arrow /></a></div></section>}
      </main>

      <footer className="site-footer"><div className="footer-navigation"><a href="/about">About Grama Development</a><a href="/projects">Projects</a><a href="/about#services">Services</a><a href="/partnerships#process">The process</a><a href="/partnerships">Development partnerships</a><a href="/animated-experience">Animated Experience</a><a href="/contact">Contact</a></div><div className="footer-main"><a className="footer-brand development-lockup" href="/" aria-label="Grama Development — home"><img className="development-g" src="/assets/brand/grama-g.svg" alt="" width="100" height="100" /><img className="development-wordmark" src="/assets/brand/grama-development.svg" alt="Grama Development" width="780" height="240" /></a><p>A family construction business.<br />Chicago & Chicagoland residential development.</p><a className="footer-phone" href="tel:+17738499634">+1 773 849 9634 <Arrow diagonal /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Grama Development</span><span>Chicago & the surrounding Illinois suburbs</span><button onClick={() => setModal({ title: 'About this preview', text: 'Dexter Acres is an upcoming, owner-described 14-home development. House images are architectural renderings; the aerial is an AI-generated concept. The interactive map follows the supplied C5 drawing for lot organization and numbering. Project approval status, infrastructure specifications, dates, final designs, pricing and availability have not been confirmed. Completed-project photographs are separately identified and sourced from Grama Development’s official website. This preview sends no marketing emails and does not reserve a property. ' + enquiryPreviewNote })}>Project & image notes</button></div></footer>
      {isHome && <div className="chapter-index" aria-hidden="true"><span>{chapter}</span><i />08</div>}
      {modal && <dialog ref={dialog} aria-labelledby="preview-dialog-title" className={modal.image ? 'media-dialog' : 'notes-dialog'} onCancel={() => setModal(null)} onClick={event => { if (event.target === event.currentTarget) setModal(null); }}><div className="dialog-sticky-toolbar"><button className="dialog-close" autoFocus aria-label="Close preview" onClick={() => setModal(null)}>×</button></div>{modal.image && <><img src={assets + (modal.images?.[modal.index || 0]?.image || modal.image)} alt={modal.images?.[modal.index || 0]?.alt || modal.title} />{modal.images?.length > 1 && <div className="dialog-gallery-controls"><button aria-label="Previous project photograph" onClick={() => setModal(current => ({ ...current, index: ((current.index || 0) + current.images.length - 1) % current.images.length }))}><Arrow reverse /></button><span>{String((modal.index || 0) + 1).padStart(2, '0')} / {String(modal.images.length).padStart(2, '0')}</span><button aria-label="Next project photograph" onClick={() => setModal(current => ({ ...current, index: ((current.index || 0) + 1) % current.images.length }))}><Arrow /></button></div>}</>}<div className="dialog-caption"><h2 id="preview-dialog-title">{modal.title}</h2><p>{modal.caption || modal.text}</p>{modal.source && <a href={modal.source} target="_blank" rel="noreferrer">Original project page <Arrow diagonal /></a>}</div></dialog>}
    </div>
  );
}

export default App;
