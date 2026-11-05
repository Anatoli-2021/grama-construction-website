import { useState } from 'react';
import './DevelopmentProcess.css';

const stages = [
  {
    name: 'Find or evaluate land',
    title: 'Begin with the possibilities.',
    description: 'A new site or land you already own. We begin by understanding the property, your ambitions and the questions that need to be resolved before a project moves forward.',
    details: ['Site potential and project fit', 'Early feasibility and constraints', 'Acquisition considerations'],
    image: 'portfolio-dexter.webp',
    caption: '1847 Dexter Lane · Completed Grama residence',
    alt: 'Completed Grama residence at dusk with a landscaped garden terrace',
  },
  {
    name: 'Define the vision',
    title: 'Give the project a point of view.',
    description: 'How should the home feel? How should it work? Together, we establish the priorities, architectural direction and scope that will guide the decisions ahead.',
    details: ['Lifestyle and project brief', 'Architectural character', 'Scope and priorities'],
    image: 'portfolio-lee.webp',
    caption: '1906 Lee Street · Completed Grama interior',
    alt: 'Completed Lee Street kitchen with warm wood cabinetry and a stone island',
  },
  {
    name: 'Architecture and design',
    title: 'Bring the vision into focus.',
    description: 'We coordinate with architects and design professionals as layouts, elevations and material choices develop. The details are considered together, with the finished home in mind.',
    details: ['Architect and design coordination', 'Plans, proportions and materials', 'Design review and decisions'],
    image: 'portfolio-prospect.webp',
    caption: 'Prospect Lane · Completed Grama residence',
    alt: 'Completed gray-brick Prospect Lane home with a turret and distinctive roofline',
  },
  {
    name: 'Detailed budgeting',
    title: 'Make the decisions tangible.',
    description: 'A considered design needs a considered budget. We develop construction budgets around the project scope, selections and input from suppliers and trades, so the next decisions have a clear basis.',
    details: ['Scope-based construction budget', 'Supplier and trade input', 'Selections and cost alignment'],
    image: 'portfolio-lee.webp',
    caption: '1906 Lee Street · Completed Grama interior',
    alt: 'Stone island and custom cabinetry in the completed Lee Street kitchen',
  },
  {
    name: 'Permitting and coordination',
    title: 'Connect the people and the plans.',
    description: 'The work extends beyond the home itself. We coordinate with the relevant architects, engineers, municipality and utility providers as the required reviews and project requirements are addressed.',
    details: ['Engineering and permit coordination', 'Municipal review requirements', 'Utilities and site-work planning'],
    image: 'portfolio-dexter.webp',
    caption: '1847 Dexter Lane · Completed Grama residence',
    alt: 'Completed Dexter Lane home and its garden setting',
  },
  {
    name: 'Construction',
    title: 'Keep the vision close to the work.',
    description: 'Plans become a place through many connected decisions. Grama coordinates contractors, trades and suppliers throughout construction, with hands-on attention to the architecture and finishing details.',
    details: ['Contractor and supplier coordination', 'Construction sequencing', 'Ongoing detail and finish review'],
    image: 'portfolio-prospect.webp',
    caption: 'Prospect Lane · Completed Grama residence',
    alt: 'Finished masonry, windows and roof details of a completed Prospect Lane home',
  },
  {
    name: 'Final delivery',
    title: 'A considered finish. A new beginning.',
    description: 'The final stage brings the details together. We coordinate the project’s finishing work, walkthrough and handover, with the required inspections and closeout addressed for the particular home.',
    details: ['Finishing details and walkthrough', 'Inspection and closeout coordination', 'Home handover'],
    image: 'portfolio-dexter.webp',
    caption: '1847 Dexter Lane · Completed Grama residence',
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
          <p>One connected conversation, from the first possibility to the final detail. We coordinate the people, plans and decisions that bring a home or a residential development to life.</p>
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
              <div className="process-detail-topline"><span>THE GRAMA APPROACH</span><span>{String(index + 1).padStart(2, '0')} / 07</span></div>
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
