import { useRef, useState } from 'react';
import './BrandSections.css';

function Arrow({ down = false }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={down ? 'M12 3v17m-6-6 6 6 6-6' : 'M5 19 19 5M5 5h14v14'} stroke="currentColor" strokeWidth="1.3" /></svg>;
}

const projects = [
  {
    name: '1847 Dexter Lane',
    image: 'portfolio-dexter.webp',
    detail: 'Garden terrace & outdoor fireplace',
    description: 'Garden terrace and outdoor fireplace at 1847 Dexter Lane, Des Plaines.',
    alt: 'Garden terrace and outdoor fireplace at 1847 Dexter Lane at dusk',
    source: 'https://www.gramaconstruction.com/projects/1847-dexter-des-plaines',
  },
  {
    name: '1906 Lee Street',
    image: 'portfolio-lee.webp',
    gallery: [{ image: 'portfolio-lee-bath.webp', alt: '1906 Lee Street bathroom with a double vanity and veined stone' }],
    detail: 'Custom kitchen & interior finishes',
    description: 'Wood cabinetry and a veined stone island in the kitchen at 1906 Lee Street, Des Plaines.',
    alt: '1906 Lee Street kitchen with wood cabinetry and a veined stone island',
    source: 'https://www.gramaconstruction.com/projects/1906-lee-st-des-plaines-il',
  },
  {
    name: '1171 Prospect Lane',
    image: 'portfolio-prospect.webp',
    gallery: [{ image: 'portfolio-prospect-interior.webp', alt: 'Prospect Lane kitchen with white cabinetry, a wood island and pendant lights' }],
    detail: 'Masonry exterior & residential interiors',
    description: 'Masonry exterior, turret and paired garage doors at 1171 Prospect Lane, Des Plaines.',
    alt: '1171 Prospect Lane residence with gray masonry, a turret and paired garage doors',
    source: 'https://www.gramaconstruction.com/projects/prospect-ln-des-plaines-il-60018',
  },
];

const archive = [
  { name: 'Chicago, IL 60618', location: 'Avondale / Chicago', source: 'https://www.gramaconstruction.com/projects/chicago-il-60618' },
  { name: 'Burr Ridge', location: 'Burr Ridge, Illinois', source: 'https://www.gramaconstruction.com/projects/burr-ridge-il-60527' },
  { name: 'South Barrington', location: 'South Barrington, Illinois', source: 'https://www.gramaconstruction.com/projects/south-barrington-il-60010' },
  { name: 'W Foster Avenue, Unit 1E', location: 'Chicago, IL 60640', source: 'https://www.gramaconstruction.com/projects/w-foster-ave-unit-1e-chicago-il-60640' },
  { name: 'N Sedgwick Street', location: 'Chicago, IL 60614', source: 'https://www.gramaconstruction.com/projects/n-sedgwick-st-chicago-il-60614' },
];

const partners = [
  ['Floor & Decor', 'floor-decor'],
  ['Featured on Houzz', 'houzz'],
  ['Lennox', 'lennox'],
  ['Pella', 'pella'],
  ['Sika', 'sika'],
  ['Andersen Windows & Doors', 'andersen'],
  ['Bosch', 'bosch'],
  ['Lowe’s', 'lowes'],
  ['Goodman', 'goodman'],
  ['ABC Supply', 'abc-supply'],
  ['The Home Depot', 'home-depot'],
];

export function AboutGrama({ onConsultation }) {
  return (
    <section className="about-grama section-pad" id="about" data-chapter="02" aria-labelledby="about-title">
      <div className="about-topline"><p className="eyebrow">ABOUT GRAMA</p><span>CHICAGO & THE ILLINOIS SUBURBS</span></div>
      <div className="about-editorial">
        <div className="about-statement reveal">
          <h2 className="display" id="about-title">A family business.<br /><em>Building in Chicago.</em></h2>
          <p className="about-lead">Luxury custom homes.<br />Residential development.</p>
          <p>Anatoli (Tony) Grama and his wife Alina are the people behind Grama Construction, a family business serving Chicago and the surrounding Illinois suburbs.</p>
          <p>We work with property owners, developers and investment partners on custom homes, renovation and residential development, coordinating the people and decisions from early planning through construction.</p>
          <div className="about-founder"><span>ANATOLI GRAMA</span><p>Known as Tony.<br />Founder, Grama Construction.</p></div>
          <button className="text-link" onClick={onConsultation}>Discuss a project with Grama <Arrow /></button>
        </div>
        <div className="about-people reveal">
          <figure className="about-photograph">
            <img src="/assets/tony-grama.webp" alt="Anatoli (Tony) Grama beside a Grama Construction vehicle" width="1280" height="853" loading="lazy" />
            <figcaption><span>ANATOLI (TONY) GRAMA</span><span>FOUNDER</span></figcaption>
          </figure>
          <figure className="about-realtor">
            <img src="/assets/grama-realtor.webp" alt="Alina, Grama Construction’s exclusive realtor and Tony’s wife" width="600" height="852" loading="lazy" />
            <figcaption>ALINA / REAL ESTATE</figcaption>
          </figure>
        </div>
      </div>
      <div className="about-philosophy"><span className="eyebrow">OUR WORK</span><p>Custom residential projects.<br />Construction & renovation.<br /><em>Development partnerships.</em></p><span className="philosophy-note">Explore the<br />completed portfolio.</span><a href="#properties" aria-label="Explore our properties"><Arrow down /></a></div>
    </section>
  );
}

export function PropertyCollection({ onView, motion }) {
  const [category, setCategory] = useState('all');
  const filters = useRef([]);
  const completedCount = projects.length + archive.length;
  const categories = [['all', 'All projects', completedCount + 1], ['upcoming', 'Upcoming development', 1], ['completed', 'Completed projects', completedCount]];
  function keyDown(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const count = categories.length;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : (index + (event.key === 'ArrowRight' ? 1 : count - 1)) % count;
    setCategory(categories[next][0]);
    filters.current[next]?.focus();
  }
  const completed = category !== 'upcoming' ? projects : [];
  const showUpcoming = category !== 'completed';
  return (
    <section className="property-collection section-pad" id="properties" data-chapter="03" aria-labelledby="properties-title">
      <div className="collection-heading"><div><p className="eyebrow light">PORTFOLIO & DEVELOPMENT</p><h2 className="display" id="properties-title">Completed projects.<br /><em>Future development.</em></h2></div><p>Explore eight projects from Grama’s completed portfolio and the proposed Dexter Acres development in Des Plaines.</p></div>
      <div className="collection-toolbar">
        <div className="collection-tabs" role="tablist" aria-label="Property collections">
          {categories.map(([key, label, count], index) => <button ref={element => { filters.current[index] = element; }} key={key} role="tab" id={'collection-tab-' + key} aria-controls="collection-panel" aria-selected={category === key} tabIndex={category === key ? 0 : -1} onClick={() => setCategory(key)} onKeyDown={event => keyDown(event, index)}>{label}<span>{String(count).padStart(2, '0')}</span></button>)}
        </div>
        <span className="collection-location">CHICAGO & THE SUBURBS</span>
      </div>
      <div id="collection-panel" role="tabpanel" aria-labelledby={'collection-tab-' + category} className="collection-grid" data-motion={motion ? 'on' : 'off'}>
        {showUpcoming && <article className="collection-development"><a className="collection-image" href="#architecture"><img src="/assets/community.webp" alt="AI-generated concept aerial of Dexter Acres, a proposed fourteen-home development" width="1800" height="817" loading="lazy" /><span className="collection-image-tag">PROPOSED DEVELOPMENT</span><span className="collection-view"><Arrow /></span><span className="collection-image-note">ARCHITECTURAL CONCEPT</span></a><div className="collection-caption"><div><span>WEBSTER–DEXTER / DES PLAINES</span><h3>Dexter Acres</h3></div><p>14 planned homes<br />Des Plaines, Illinois</p></div><div className="development-line"><p>A proposed residential neighborhood at Webster and Dexter Lanes. Explore the architectural concept and fourteen-lot plan.</p><a className="text-link light-link" href="#community">Explore Dexter Acres <Arrow /></a></div></article>}
        {completed.map((project, index) => <article className={'collection-project ' + (index === 0 ? 'collection-project-wide' : '')} key={project.name}><button className="collection-image" aria-label={'View ' + project.name + ' project'} onClick={() => onView({ image: project.image, images: [{ image: project.image, alt: project.alt }, ...(project.gallery || [])], title: project.name, caption: project.description, source: project.source })}><img src={'/assets/' + project.image} alt={project.alt} width="1800" height="1200" loading="lazy" /><span className="collection-view"><Arrow /></span></button><div className="collection-caption"><div><span>COMPLETED PROJECT / DES PLAINES</span><h3>{project.name}</h3></div><p>{project.detail}</p></div></article>)}
        {category !== 'upcoming' && <div className="collection-archive"><div className="collection-archive-heading"><p className="eyebrow light">MORE COMPLETED PROJECTS</p><a href="https://www.gramaconstruction.com/completed-projects" target="_blank" rel="noreferrer">View the original portfolio <Arrow /></a></div><div className="collection-archive-list">{archive.map(project => <a href={project.source} target="_blank" rel="noreferrer" key={project.name}><div><h3>{project.name}</h3><p>{project.location}</p></div><span>Completed project</span><Arrow /></a>)}</div></div>}
      </div>
      <div className="collection-current"><div><p className="eyebrow light">CURRENT LISTINGS</p><h3>Ask about current availability.</h3><p>No current listings are published on the company website. Contact Grama for the latest property information.</p></div><a className="text-link light-link" href="#interest">Discuss an opportunity <Arrow /></a></div>
    </section>
  );
}

export function Capabilities() {
  const groups = [
    ['Turnkey Development', 'Site and project planning', 'Coordination through construction and handover'],
    ['Investment Projects', 'Residential development opportunities', 'Property-owner and investment partnerships'],
    ['Custom Built', 'Custom residential construction', 'Renovation and architectural coordination'],
  ];
  return <section className="capabilities section-pad" id="services" aria-labelledby="capabilities-title"><div className="capabilities-heading"><p className="eyebrow">OUR SERVICES</p><h2 id="capabilities-title">Construction.<br /><em>Complete development.</em></h2><p>Grama works across land, planning and construction. Architects, engineers, municipalities and utility providers contribute their respective expertise and approvals.</p></div><div className="capabilities-list">{groups.map(([name, first, second], index) => <div className="capability" key={name}><span>0{index + 1}</span><div><h3>{name}</h3><p>{first}<br />{second}</p></div></div>)}</div></section>;
}

export function Partnerships({ onExplore }) {
  return <section className="partnerships" id="partnerships" data-chapter="07" aria-labelledby="partnership-title"><div className="partnership-photo"><img src="/assets/portfolio-dexter.webp" alt="Residence and outdoor living space at 1847 Dexter Lane" width="1800" height="1200" loading="lazy" /><span>1847 DEXTER LANE / DES PLAINES</span></div><div className="partnership-copy"><p className="eyebrow light">DEVELOPMENT & INVESTMENT</p><h2 className="display" id="partnership-title">Develop with Grama.<br /><em>From land to delivery.</em></h2><p>Bring a site, a development idea or an interest in residential real estate. We work with landowners, developers and investment partners to evaluate the project and define its scope.</p><div className="partnership-disciplines"><div><span>01</span><p>Evaluate the site<br />& establish the project brief.</p></div><div><span>02</span><p>Coordinate the design,<br />scope & construction budget.</p></div><div><span>03</span><p>Manage construction<br />& project delivery.</p></div></div><button className="text-link light-link" onClick={onExplore}>Discuss a development partnership <Arrow /></button><p className="partnership-note">Project scope, terms and responsibilities are agreed individually.</p></div></section>;
}

export function TrustedPartners() {
  return <section className="trusted-partners section-pad" id="trusted-partners" aria-labelledby="trusted-partners-title"><div className="trusted-partners-heading"><p className="eyebrow">OUR NETWORK</p><h2 id="trusted-partners-title">We are honored to be<br /><em>trusted partners for</em></h2></div><div className="trusted-partners-grid">{partners.map(([name, image]) => <div className="trusted-partner" key={image}><img src={'/assets/partner-' + image + '.png'} alt={name} width="440" height="180" loading="lazy" /></div>)}</div></section>;
}
