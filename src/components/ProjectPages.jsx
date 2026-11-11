import { useState } from 'react';
import { projects } from '../data/projects.js';
import './ProjectPages.css';

function Arrow({ reverse = false }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={reverse ? { transform: 'rotate(180deg)' } : undefined}><path d="M3 12h17m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.3" /></svg>;
}

const filters = [['all', 'All projects'], ['completed', 'Completed'], ['upcoming', 'Upcoming'], ['current', 'Current listings']];

export function ProjectsPage() {
  const [filter, setFilter] = useState('all');
  const showCompleted = filter === 'all' || filter === 'completed';
  const showUpcoming = filter === 'all' || filter === 'upcoming';
  const resultText = filter === 'all'
    ? 'Eight completed projects and one proposed development.'
    : filter === 'completed' ? 'Eight completed projects.'
      : filter === 'upcoming' ? 'One proposed development.' : 'No current listings are published.';

  return (
    <div className="projects-page">
      <header className="projects-page-intro">
        <p className="eyebrow">THE GRAMA PORTFOLIO</p>
        <h1>Completed work.<br /><em>Future development.</em></h1>
        <p>Residential projects across Chicago and the surrounding suburbs, from individual homes to the proposed Dexter Acres neighborhood.</p>
      </header>
      <div className="projects-page-content">
        <div className="projects-page-filters" role="group" aria-label="Filter projects by status">
          {filters.map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
        <p className="projects-page-results" role="status">{resultText}</p>
        {filter === 'current' ? (
          <section className="projects-page-empty" aria-labelledby="current-listings-title">
            <p className="eyebrow">CURRENT LISTINGS</p>
            <h2 id="current-listings-title">Ask about current availability.</h2>
            <p>Contact Grama for the latest property information or to discuss a home or development project.</p>
            <a className="text-link" href="/contact">Discuss an opportunity <Arrow /></a>
          </section>
        ) : (
          <div className="projects-page-grid">
            {showCompleted && projects.map(project => (
              <article className="projects-page-card" key={project.slug}>
                <a href={'/projects/' + project.slug}>
                  <div className="projects-page-card-image"><img src={'/assets/' + project.image} alt={project.alt} width="1600" height="1067" loading="lazy" /><span>COMPLETED PROJECT</span></div>
                  <div className="projects-page-card-copy"><p>{project.location}</p><h2>{project.name}</h2><p>{project.summary}</p><span>Explore the project <Arrow /></span></div>
                </a>
              </article>
            ))}
            {showUpcoming && <article className="projects-page-card projects-page-card--upcoming"><a href="/projects/dexter-acres"><div className="projects-page-card-image"><img src="/assets/community.webp" alt="AI-generated architectural concept of the proposed fourteen-home Dexter Acres neighborhood" width="1800" height="817" loading="lazy" /><span>PROPOSED DEVELOPMENT</span></div><div className="projects-page-card-copy"><p>Des Plaines, Illinois</p><h2>Dexter Acres</h2><p>A planned neighborhood at Webster and Dexter Lanes. Explore the architectural concept, cinematic sequence and fourteen-lot plan.</p><span>Explore Dexter Acres <Arrow /></span></div></a></article>}
          </div>
        )}
        <div className="projects-page-contact"><p>Planning your next home or development?</p><a className="text-link" href="/contact">Start a conversation <Arrow /></a></div>
      </div>
    </div>
  );
}

export function ProjectCase({ project, onView }) {
  if (!project) return null;
  const index = projects.findIndex(item => item.slug === project.slug);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  function openGallery(imageIndex) {
    onView({
      image: project.gallery[imageIndex].image,
      images: project.gallery,
      index: imageIndex,
      title: project.name,
      caption: project.summary,
      source: project.source,
    });
  }

  return (
    <article className="project-case" data-project={project.slug}>
      <header className="project-case-heading">
        <a className="project-case-back" href="/projects"><Arrow reverse /> All projects</a>
        <div className="project-case-topline"><p className="eyebrow">COMPLETED PROJECT</p><p>{project.location}</p></div>
        <h1>{project.name}</h1>
        <p className="project-case-summary">{project.summary}</p>
      </header>
      <div className="project-case-content">
        <figure className="project-case-hero">
          <button type="button" onClick={() => openGallery(0)} aria-label={'View ' + project.name + ' photograph'}><img src={'/assets/' + project.image} alt={project.alt} width="1600" height="1067" fetchPriority="high" /><span>View photograph <Arrow /></span></button>
          <figcaption>{project.gallery[0].caption}</figcaption>
        </figure>
        <section className="project-case-overview" aria-labelledby="project-overview-title">
          <div><p className="eyebrow">PROJECT OVERVIEW</p><h2 id="project-overview-title">{project.location}</h2><p>{project.description}</p><a className="project-case-source" href={project.source} target="_blank" rel="noreferrer">View the original Grama project <Arrow /></a></div>
          <div className="project-case-details"><h3>Project details</h3><ul>{project.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul></div>
        </section>
        <section className="project-case-gallery" aria-labelledby="project-gallery-title">
          <div className="project-case-gallery-heading"><p className="eyebrow">PROJECT PHOTOGRAPHY</p><h2 id="project-gallery-title">A closer look.</h2></div>
          <div className="project-case-gallery-grid">{project.gallery.map((photo, photoIndex) => <figure key={photo.image}><button type="button" onClick={() => openGallery(photoIndex)} aria-label={'Enlarge ' + photo.caption}><img src={'/assets/' + photo.image} alt={photo.alt} width="1600" height="1067" loading="lazy" /><span><Arrow /></span></button><figcaption>{photo.caption}</figcaption></figure>)}</div>
        </section>
        <section className="project-case-cta" aria-labelledby="project-contact-title"><div><p className="eyebrow">BUILD WITH GRAMA</p><h2 id="project-contact-title">Discuss your home<br /><em>or development.</em></h2></div><a className="text-link" href="/contact">Talk to Grama <Arrow /></a></section>
        <nav className="project-case-navigation" aria-label="More completed projects"><a href={'/projects/' + previous.slug}><span>PREVIOUS PROJECT</span><strong><Arrow reverse />{previous.name}</strong></a><a href={'/projects/' + next.slug}><span>NEXT PROJECT</span><strong>{next.name}<Arrow /></strong></a></nav>
      </div>
    </article>
  );
}
