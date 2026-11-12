import { useState } from 'react';
import './DevelopmentProcess.css';

const stages = [
  {
    name: 'Find or evaluate land',
    title: 'Evaluate the site.',
    description: 'We review land you own or a site you are considering, the proposed development and the questions to resolve before proceeding.',
    details: ['Site potential and project fit', 'Early feasibility and constraints', 'Acquisition considerations'],
    image: 'portfolio-dexter.webp',
    caption: '1847 Dexter Lane · Completed Groma Development residence',
    alt: 'Completed Groma Development residence at dusk with a landscaped garden terrace',
  },
  {
    name: 'Define the vision',
    title: 'Define the project brief.',
    description: 'We define the project brief, architectural direction and scope with the owner or development partners.',
    details: ['Lifestyle and project brief', 'Architectural character', 'Scope and priorities'],
    image: 'portfolio-lee.webp',
    caption: '1906 Lee Street · Completed Groma Development interior',
    alt: 'Completed Lee Street kitchen with warm wood cabinetry and a stone island',
  },
  {
    name: 'Architecture and design',
    title: 'Coordinate architecture and design.',
    description: 'We coordinate with architects and design professionals as layouts, elevations and materials are developed and reviewed.',
    details: ['Architect and design coordination', 'Plans, proportions and materials', 'Design review and decisions'],
    image: 'portfolio-prospect.webp',
    caption: 'Prospect Lane · Completed Groma Development residence',
    alt: 'Completed gray-brick Prospect Lane home with a turret and distinctive roofline',
  },
  {
    name: 'Detailed budgeting',
    title: 'Prepare the construction budget.',
    description: 'We develop a construction budget from the project scope, selections and supplier and trade input. The budget supports project decisions.',
    details: ['Scope-based construction budget', 'Supplier and trade input', 'Selections and cost alignment'],
    image: 'portfolio-lee.webp',
    caption: '1906 Lee Street · Completed Groma Development interior',
    alt: 'Stone island and custom cabinetry in the completed Lee Street kitchen',
  },
  {
    name: 'Permitting and coordination',
    title: 'Coordinate permits and utilities.',
    description: 'We coordinate with architects, engineers, the municipality and utility providers on the reviews and requirements for the project.',
    details: ['Engineering and permit coordination', 'Municipal review requirements', 'Utilities and site-work planning'],
    image: 'portfolio-dexter.webp',
    caption: '1847 Dexter Lane · Completed Groma Development residence',
    alt: 'Completed Dexter Lane home and its garden setting',
  },
  {
    name: 'Construction',
    title: 'Coordinate contractors and trades.',
    description: 'Groma Development coordinates contractors, trades and suppliers during construction, including sequencing and review of architectural and finishing details.',
    details: ['Contractor and supplier coordination', 'Construction sequencing', 'Ongoing detail and finish review'],
    image: 'portfolio-prospect.webp',
    caption: 'Prospect Lane · Completed Groma Development residence',
    alt: 'Finished masonry, windows and roof details of a completed Prospect Lane home',
  },
  {
    name: 'Final delivery',
    title: 'Coordinate project handover.',
    description: 'We coordinate finishing work, the walkthrough and handover, together with the inspections and closeout required for the project.',
    details: ['Finishing details and walkthrough', 'Inspection and closeout coordination', 'Home handover'],
    image: 'portfolio-dexter.webp',
    caption: '1847 Dexter Lane · Completed Groma Development residence',
    alt: 'Welcoming terrace and illuminated completed Dexter Lane home',
  },
];

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.3" /></svg>;
}

export default function DevelopmentProcess({ onConsultation }) {
  const [active, setActive] = useState(0);
  function selectStep(event, index) {
    const button = event.currentTarget;
    setActive(index);
    if (window.matchMedia('(max-width: 600px)').matches) {
      requestAnimationFrame(() => button.scrollIntoView({ block: 'start', behavior: 'instant' }));
    }
  }

  return (
    <section className="development-process section-pad" id="process" data-chapter="06" aria-labelledby="process-title">
      <div className="process-heading">
        <div>
          <p className="eyebrow">THE CUSTOM DEVELOPMENT PROCESS</p>
          <h2 className="display" id="process-title">A clear path.<br /><em>From land to living.</em></h2>
        </div>
        <div className="process-heading-copy">
          <p>Groma Development coordinates the people, plans and construction work across seven stages of a residential development, from site review through project handover.</p>
          <button className="text-link" onClick={onConsultation}>Discuss your project <Arrow /></button>
        </div>
      </div>

      <div className="process-explorer">
        <p className="process-selector-label">EXPLORE THE PROCESS <span>01 — 07</span></p>
        {stages.map((stage, index) => (
          <div className={'process-step' + (active === index ? ' is-active' : '')} key={stage.name}>
            <button className="process-step-button" id={'process-step-' + index} aria-expanded={active === index} aria-controls={'process-detail-' + index} onClick={event => selectStep(event, index)}>
              <span className="process-step-number">{String(index + 1).padStart(2, '0')}</span>
              <span>{stage.name}</span>
              <span className="process-step-marker" aria-hidden="true">{active === index ? '−' : '+'}</span>
            </button>
            <div className="process-detail" id={'process-detail-' + index} role="region" aria-labelledby={'process-step-' + index} hidden={active !== index}>
              <div className="process-detail-topline"><span>THE GROMA DEVELOPMENT APPROACH</span><span>{String(index + 1).padStart(2, '0')} / 07</span></div>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
              <ul>{stage.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
              <figure className="process-photo"><img src={'/assets/' + stage.image} alt={stage.alt} width="1800" height="1200" loading="lazy" /><figcaption>{stage.caption}</figcaption></figure>
            </div>
          </div>
        ))}
        <p className="process-coordination-note">Licensed architectural and engineering services are provided by the project’s relevant professionals. Scope and sequence depend on the site and the project.</p>
      </div>
    </section>
  );
}
