import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DexterExperience from './components/DexterExperience.jsx';
import AnimatedExperience from './components/AnimatedExperience.jsx';
import { AboutPage, PartnershipsPage, ContactPage, DevelopmentsPage } from './components/CompanyPages.jsx';
import { ProjectsPage, ProjectCase } from './components/ProjectPages.jsx';
import { getRoute, notFoundRoute } from './site-routes.js';
import { readEnquiryContext, enquiryHref } from './enquiry-context.js';
import HomePage from './components/HomePage.jsx';
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
  const [motion, setMotion] = useState(() => typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [consultationRequest, setConsultationRequest] = useState(() => typeof window === 'undefined' ? null : readEnquiryContext(window.location.search));

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
        const targets = [...header.querySelectorAll('a[href], button')]
          .filter(element => element.getClientRects().length && !element.disabled);
        if (event.shiftKey && document.activeElement === targets[0]) {
          event.preventDefault();
          targets.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === targets.at(-1)) {
          event.preventDefault();
          targets[0]?.focus();
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
    const update = () => {
      const range = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty('--scroll-progress', String(range > 0 ? scrollY / range : 0));
      if (isHome) {
        const hero = root.current?.querySelector('.home-hero');
        const header = root.current?.querySelector('.site-header');
        if (header) header.dataset.scrolled = String(scrollY >= (hero?.offsetHeight || innerHeight) - header.offsetHeight);
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [isHome]);

  useLayoutEffect(() => {
    if (!motion) return;
    const mm = gsap.matchMedia();
    mm.add('all', () => {
      if (isHome) {
      gsap.fromTo('.hero-visual', { scale: 1.045 }, { scale: 1.14, yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
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

  function moveGalleryImage(destination) {
    setModal(current => {
      if (!current?.images?.length) return current;
      const count = current.images.length;
      const index = destination === 'first' ? 0
        : destination === 'last' ? count - 1
          : ((current.index || 0) + destination + count) % count;
      return { ...current, index };
    });
  }

  function onGalleryKeyDown(event) {
    if (!modal?.images?.length || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"], [role="slider"]')) return;
    const destinations = { ArrowLeft: -1, ArrowRight: 1, Home: 'first', End: 'last' };
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    moveGalleryImage(destinations[event.key]);
  }

  const activePhoto = modal?.images?.[modal.index || 0];


  return (
    <div ref={root} className={"experience" + (isHome ? "" : " interior-page") + (route.type === 'animated' ? " animated-route" : "")} data-motion={motion ? 'on' : 'off'}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={"site-header" + (isHome ? "" : " site-header--solid")}>
        <a className="brand development-lockup" href="/" aria-label="Grama Development — home" onClick={navigate}><img className="development-g" src="/assets/brand/grama-g.svg" alt="" width="100" height="100" /><img className="development-wordmark" src="/assets/brand/grama-development.svg" alt="Grama Development" width="780" height="240" /></a>
        <button type="button" className="menu-button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        <nav id="mobile-menu" className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          <a href="/developments" aria-current={current('/developments')} data-active={route.type === 'dexter' ? 'true' : undefined} onClick={navigate}>Developments</a>
          <a href="/about" aria-current={current('/about')} onClick={navigate}>About</a>
          <a href="/projects" aria-current={current('/projects')} data-active={route.type === 'project' ? 'true' : undefined} onClick={navigate}>Portfolio</a>
          <a href="/partnerships" aria-current={current('/partnerships')} onClick={navigate}>Partnerships</a>
          <a href="/animated-experience" aria-current={current('/animated-experience')} onClick={navigate}>Experience</a>
          <a className="nav-cta" href="/contact" aria-current={current('/contact')} onClick={navigate}>Contact <Arrow diagonal /></a>
        </nav>
        <div className="header-progress" />
      </header>

      <main id="main-content" tabIndex={-1}>
        {isHome && <HomePage />}
        {route.type === 'developments' && <DevelopmentsPage />}
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

      <footer className="site-footer"><div className="footer-navigation"><a href="/developments">Developments</a><a href="/projects">Portfolio</a><a href="/about">About</a><a href="/partnerships">Development partnerships</a><a href="/animated-experience">Animated Experience</a><a href="/contact">Contact</a></div><div className="footer-main"><a className="footer-brand development-lockup" href="/" aria-label="Grama Development — home"><img className="development-g" src="/assets/brand/grama-g.svg" alt="" width="100" height="100" /><img className="development-wordmark" src="/assets/brand/grama-development.svg" alt="Grama Development" width="780" height="240" /></a><p>Luxury homes and residential development.<br />Chicago & Chicagoland.</p><a className="footer-phone" href="tel:+17738499634">+1 773 849 9634 <Arrow diagonal /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Grama Development</span><span>Chicago & the surrounding Illinois suburbs</span><button onClick={() => setModal({ title: 'About this preview', text: 'Dexter Acres is an upcoming, owner-described 14-home development. House images are architectural renderings; the aerial is an AI-generated concept. The interactive map follows the supplied C5 drawing for lot organization and numbering. Project approval status, infrastructure specifications, dates, final designs, pricing and availability have not been confirmed. Completed-project photographs are separately identified and sourced from Grama Development’s official website. This preview sends no marketing emails and does not reserve a property. ' + enquiryPreviewNote })}>Project & image notes</button></div></footer>
      {modal && <dialog ref={dialog} aria-labelledby="preview-dialog-title" className={modal.image ? 'media-dialog' : 'notes-dialog'} onKeyDown={onGalleryKeyDown} onCancel={() => setModal(null)} onClick={event => { if (event.target === event.currentTarget) setModal(null); }}>
        <div className="dialog-sticky-toolbar"><button type="button" className="dialog-close" autoFocus aria-label="Close preview" onClick={() => setModal(null)}>×</button></div>
        {modal.image && <>
          <img src={assets + (activePhoto?.image || modal.image)} alt={activePhoto?.alt || modal.title} />
          {modal.images?.length > 1 && <div className="dialog-gallery-controls">
            <button type="button" aria-label="Previous project photograph" aria-keyshortcuts="ArrowLeft" onClick={() => moveGalleryImage(-1)}><Arrow reverse /></button>
            <span role="status" aria-live="polite" aria-atomic="true">{String((modal.index || 0) + 1).padStart(2, '0')} / {String(modal.images.length).padStart(2, '0')}</span>
            <button type="button" aria-label="Next project photograph" aria-keyshortcuts="ArrowRight" onClick={() => moveGalleryImage(1)}><Arrow /></button>
          </div>}
        </>}
        <div className="dialog-caption"><h2 id="preview-dialog-title">{modal.title}</h2><p>{activePhoto?.caption || modal.caption || modal.text}</p>{modal.source && <a href={modal.source} target="_blank" rel="noreferrer">Original project page <Arrow diagonal /></a>}</div>
      </dialog>}
    </div>
  );
}

export default App;
