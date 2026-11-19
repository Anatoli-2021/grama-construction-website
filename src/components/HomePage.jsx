import { projects } from '../data/projects.js';
import { enquiryHref } from '../enquiry-context.js';
import { TrustedPartners } from './BrandSections.jsx';
import FamilySection from './FamilySection.jsx';
import { CONSTRUCTION_ATLAS_BASE } from './construction-timeline.js';
import './HomePage.css';

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.2" /></svg>;
}

const featured = ['1171-prospect-lane', '1906-lee-street', 'sedgwick-street']
  .map(slug => projects.find(project => project.slug === slug)).filter(Boolean);
const opportunities = [
  { label: 'Landowners', action: 'Discuss your land', topic: 'Landowner opportunity' },
  { label: 'Developers', action: 'Discuss a project', topic: 'Development partnership' },
  { label: 'Investment partners', action: 'Explore a partnership', topic: 'Investment partnership' },
];

export default function HomePage() {
  return <div className="home-page">
    <section className="home-hero hero" id="home" data-chapter="01" aria-labelledby="hero-title">
      <div className="hero-visual home-hero-media"><img src="/assets/photo/residences.webp" alt="Residential project photography of neighboring masonry homes from Grama’s original company website" width="1536" height="983" fetchPriority="high" /></div>
      <div className="home-hero-shade" />
      <div className="home-hero-top"><span>CHICAGO & CHICAGOLAND</span><span>RESIDENTIAL DEVELOPMENT</span></div>
      <div className="home-hero-copy hero-copy"><h1 id="hero-title">GRAMA</h1><p>Luxury Real Estate Development.</p></div>
      <div className="home-hero-bottom"><a href="/projects">Explore the portfolio <Arrow /></a><a href="/projects/dexter-acres">Discover Dexter Acres <Arrow /></a><span>Residential project photography</span></div>
    </section>

    <section className="home-construction" aria-labelledby="home-construction-title">
      <img className="home-construction-image" src={`${CONSTRUCTION_ATLAS_BASE}/residence.webp`} alt="Conceptual gabled residence within the proposed neighborhood" width="1920" height="1080" loading="lazy" decoding="async" fetchPriority="low" />
      <div className="home-construction-shade" aria-hidden="true" />
      <div className="home-construction-copy">
        <p className="site-label">THE GRAMA EXPERIENCE / ARCHITECTURAL CONCEPT</p>
        <h2 id="home-construction-title">A closer<br />look.</h2>
        <p>From a neighborhood to the spaces within.</p>
        <a className="site-link" href="/animated-experience">Explore the story <Arrow /></a>
      </div>
      <div className="home-construction-footer">
        <p className="home-construction-stages">
          <span className="home-construction-stages-full">Land <span aria-hidden="true">→</span> Community <span aria-hidden="true">→</span> Approach <span aria-hidden="true">→</span> Interior <span aria-hidden="true">→</span> Structure <span aria-hidden="true">→</span> Reassembly <span aria-hidden="true">→</span> Reveal</span>
          <span className="home-construction-stages-compact">Neighborhood <span aria-hidden="true">→</span> Residence <span aria-hidden="true">→</span> Structure</span>
        </p>
        <p className="home-construction-caption">Illustrative construction sequence.</p>
      </div>
    </section>

    <section className="home-work" aria-labelledby="home-work-title">
      <div className="home-section-heading"><div><p className="site-label">CHICAGO & THE SURROUNDING SUBURBS</p><h2 id="home-work-title">Selected work.</h2></div><a className="site-link" href="/projects">View the portfolio <Arrow /></a></div>
      <div className="home-projects">{featured.map((project, index) => <article key={project.slug} className={'home-project home-project--' + index}>
        <a href={'/projects/' + project.slug} aria-label={'Explore ' + project.name}><div className="home-project-photo"><img src={'/assets/' + project.image} alt={project.alt} width="1600" height="1067" loading="lazy" /><span aria-hidden="true"><Arrow /></span></div><div className="home-project-caption"><div><span>{project.location}</span><h3>{project.name}</h3></div><span>Completed</span></div></a>
      </article>)}</div>
    </section>

    <FamilySection />

    <section className="home-development" aria-labelledby="home-development-title">
      <div className="home-development-heading"><p className="site-label">PROPOSED DEVELOPMENT / DES PLAINES</p><h2 id="home-development-title">Dexter Acres.</h2><div><p>Fourteen planned homes.<br />Webster and Dexter Lanes.</p><a className="site-link" href="/projects/dexter-acres">Explore the development <Arrow /></a></div></div>
      <a className="home-development-image" href="/projects/dexter-acres"><img src="/assets/masterplan/dexter-acres-828082967e9d.webp" alt="Architectural concept of the proposed fourteen-home Dexter Acres neighborhood" width="2048" height="1152" loading="lazy" /><span>Architectural concept</span></a>
      <div className="home-development-links"><span>DES PLAINES, ILLINOIS</span><a href="/projects/dexter-acres#community">Explore the fourteen-lot plan <Arrow /></a></div>
    </section>

    <section className="home-partnerships" aria-labelledby="home-partnerships-title"><div className="home-section-heading"><div><p className="site-label">WORK WITH GRAMA</p><h2 id="home-partnerships-title">The next project.</h2></div><a className="site-link" href="/partnerships">Development partnerships <Arrow /></a></div><div className="home-opportunities">{opportunities.map(item => <a key={item.topic} href={enquiryHref({ path: 'development', topic: item.topic })}><span>{item.label}</span><h3>{item.action}</h3><Arrow /></a>)}</div><p className="home-partnerships-note">Project scope, terms and responsibilities are agreed individually.</p></section>
    <TrustedPartners />
  </div>;
}
