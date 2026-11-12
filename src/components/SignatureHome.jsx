import { useEffect, useRef, useState } from 'react';
import { projects } from '../data/projects.js';
import { enquiryHref } from '../enquiry-context.js';

// Architectural editorial homepage: completed work establishes the context;
// Dexter Acres remains a separately labelled proposed development.

function Arrow({ direction = 'right' }) {
  const paths = {
    right: 'M3 12h17m-6-6 6 6-6 6',
    left: 'M21 12H4m6-6-6 6 6 6',
    diagonal: 'M5 19 19 5M5 5h14v14',
  };
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={paths[direction]} stroke="currentColor" strokeWidth="1.3" /></svg>;
}

const completedCount = projects.filter(project => project.status === 'completed').length;
const paths = [
  { number: '01', label: 'Develop with Grama', note: 'For landowners, developers and partners.', href: '/partnerships' },
  { number: '02', label: 'Build a custom home', note: 'Discuss your home and project plans.', href: enquiryHref({ path: 'home', topic: 'Custom home' }) },
  { number: '03', label: 'Dexter Acres', note: 'Proposed · 14 homes · Des Plaines.', href: '/projects/dexter-acres' },
];

export function SignatureHero({ motion = true, onToggleMotion }) {
  return (
    <section className="sig-hero" id="home" data-chapter="01" aria-labelledby="hero-title">
      <div className="sig-hero__media">
        <picture>
          <img src="/assets/portfolio-dexter.webp" alt="Completed Grama residence at 1847 Dexter Lane, Des Plaines, lit at dusk" width="1800" height="1200" fetchPriority="high" />
        </picture>
      </div>
      <div className="sig-hero__shade" />
      <div className="sig-hero__inner">
        <p className="sig-hero__kicker"><span />Grama Development / Chicagoland</p>
        <h1 id="hero-title">Luxury custom homes.<br /><em>Residential development.</em></h1>
        <p className="sig-hero__lede">From site planning and design coordination through construction. For homeowners, landowners and development partners.</p>
        <nav className="sig-paths" aria-label="Start here">
          {paths.map(path => <a key={path.number} href={path.href} className="sig-path"><span className="sig-path__number">{path.number}</span><span className="sig-path__label">{path.label}<Arrow direction="diagonal" /></span><span className="sig-path__note">{path.note}</span></a>)}
        </nav>
      </div>
      <p className="sig-hero__credit"><span>1847 Dexter Lane / Des Plaines</span>{onToggleMotion && <button type="button" className="sig-motion" onClick={onToggleMotion} aria-pressed={!motion} aria-label={motion ? 'Pause page motion' : 'Enable page motion'}>{motion ? 'Pause motion' : 'Enable motion'}</button>}</p>
    </section>
  );
}

export function ProofBar() {
  return (
    <section className="sig-proof" aria-label="Grama at a glance">
      <div><strong>{String(completedCount).padStart(2, '0')}</strong><span>Projects in the<br />completed portfolio</span></div>
      <div><strong>14</strong><span>Homes proposed at<br />Dexter Acres</span></div>
      <div><strong>Chicago</strong><span>And the surrounding<br />Illinois suburbs</span></div>
      <div><strong>Family</strong><span>Tony &amp; Alina,<br />the people behind Grama</span></div>
    </section>
  );
}

export function SignatureResidences({ motion }) {
  const rail = useRef(null);
  const [active, setActive] = useState(0);
  const completed = projects.filter(project => project.status === 'completed');

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const cards = [...element.children];
        const atEnd = element.scrollLeft >= element.scrollWidth - element.clientWidth - 4;
        if (atEnd) return setActive(cards.length - 1);
        const start = element.scrollLeft;
        let nearest = 0;
        cards.forEach((card, index) => { if (Math.abs(card.offsetLeft - cards[0].offsetLeft - start) < Math.abs(cards[nearest].offsetLeft - cards[0].offsetLeft - start)) nearest = index; });
        setActive(nearest);
      });
    };
    element.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(element);
    update();
    return () => { element.removeEventListener('scroll', update); resize.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  function goTo(index) {
    const element = rail.current;
    const target = element?.children[Math.min(completed.length - 1, Math.max(0, index))];
    if (target) element.scrollTo({ left: target.offsetLeft - element.children[0].offsetLeft, behavior: motion ? 'smooth' : 'auto' });
  }

  function onRailKeyDown(event) {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const destinations = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: completed.length - 1 };
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    goTo(destinations[event.key]);
  }

  return (
    <section className="sig-residences" id="properties" data-chapter="03" aria-labelledby="residences-title">
      <div className="sig-residences__head">
        <div>
          <p className="sig-eyebrow">Selected work</p>
          <h2 id="residences-title">Selected projects.</h2>
        </div>
        <div className="sig-residences__intro">
          <p>Residential work across Chicago and the surrounding suburbs.</p>
          <div className="sig-rail-controls">
            <span aria-live="polite">{String(active + 1).padStart(2, '0')} / {String(completed.length).padStart(2, '0')}</span>
            <button type="button" aria-label="Previous project" onClick={() => goTo(active - 1)} disabled={active === 0}><Arrow direction="left" /></button>
            <button type="button" aria-label="Next project" onClick={() => goTo(active + 1)} disabled={active === completed.length - 1}><Arrow /></button>
          </div>
        </div>
      </div>
      <p className="sr-only" id="portfolio-keyboard-help">Use the left and right arrow keys to browse projects. Home and End move to the first and last project.</p>
      <ol className="sig-rail" ref={rail} aria-label="Completed projects" aria-describedby="portfolio-keyboard-help" onKeyDown={onRailKeyDown} tabIndex={0}>
        {completed.map((project, index) => (
          <li className="sig-card" key={project.slug}>
            <a href={'/projects/' + project.slug} aria-label={'View ' + project.name + ', ' + project.location}>
              <div className="sig-card__image"><img src={'/assets/' + project.image} alt={project.alt} width="1800" height="1200" loading="lazy" /></div>
              <div className="sig-card__caption">
                <span className="sig-card__index">{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{project.name}</h3><p>{project.location}</p></div>
                <p className="sig-card__summary">{project.highlights[0]}</p>
                <span className="sig-card__cta">View project <Arrow /></span>
              </div>
            </a>
          </li>
        ))}
      </ol>
      <div className="sig-residences__foot">
        <a className="sig-link" href="/projects">The full portfolio <Arrow /></a>
        <p><strong>Next: Dexter Acres.</strong> A proposed fourteen-home neighborhood in Des Plaines. <a href="#architecture">Explore the plan <Arrow /></a></p>
      </div>
    </section>
  );
}
