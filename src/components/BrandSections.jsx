import { useRef, useState } from 'react';
import './BrandSections.css';

function Arrow({ down = false }) { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={down ? 'M12 3v17m-6-6 6 6 6-6' : 'M5 19 19 5M5 5h14v14'} stroke="currentColor" strokeWidth="1.3" /></svg>; }

const projects = [
  { name: '1847 Dexter Lane', image: 'portfolio-dexter.webp', category: 'completed', label: 'Completed signature home', detail: 'The garden, after hours.', description: 'A rear terrace, an outdoor fireplace and the warmth of the home beyond. A completed residence from Grama’s Des Plaines portfolio.', alt: 'Actual completed Dexter Lane residence, with a lit garden terrace and outdoor fireplace at dusk', source: 'https://www.gramaconstruction.com/projects/1847-dexter-des-plaines' },
  { name: '1906 Lee Street', image: 'portfolio-lee.webp', gallery: [{ image: 'portfolio-lee-bath.webp', alt: 'Actual 1906 Lee bathroom with a double vanity, veined stone and a broad mirror' }], category: 'completed', label: 'Completed signature home', detail: 'The heart of the home.', description: 'Warm wood cabinetry and a veined stone island shape the kitchen of this completed Des Plaines home.', alt: 'Actual completed Lee Street kitchen with warm wood cabinetry and a veined stone island', source: 'https://www.gramaconstruction.com/projects/1906-lee-st-des-plaines-il' },
  { name: '1171 Prospect Lane', image: 'portfolio-prospect.webp', gallery: [{ image: 'portfolio-prospect-interior.webp', alt: 'Actual Prospect Lane kitchen with white cabinetry, a wood island and sculptural pendant lights' }], category: 'completed', label: 'Completed signature home', detail: 'A distinctive arrival.', description: 'A sculpted roofline, masonry façade and turret give this completed Prospect Lane home its individual character.', alt: 'Actual completed Prospect Lane residence with gray masonry, a turret and paired garage doors', source: 'https://www.gramaconstruction.com/projects/prospect-ln-des-plaines-il-60018' },
];

export function AboutGrama({ onConsultation }) {
  return <section className="about-grama section-pad" id="about" data-chapter="02" aria-labelledby="about-title">
    <div className="about-topline"><p className="eyebrow">01 / ABOUT GRAMA</p><span>CHICAGO & THE ILLINOIS SUBURBS</span></div>
    <div className="about-editorial"><div className="about-statement reveal"><h2 className="display" id="about-title">A personal vision.<br /><em>A place to call home.</em></h2><p className="about-lead">Signature luxury homes.<br />Full-service residential development.</p><p>Grama Construction brings the vision for a home and the work of developing it into one conversation. Led by Tony Grama, our family-oriented business builds for the people who will make a life there.</p><p>Tony’s hands-on involvement connects architectural character with construction detail—from the first assessment of a site to the choices that make a finished home feel individual.</p><div className="about-founder"><span>TONY GRAMA</span><p>Personal vision. Close involvement.<br />A considered approach to every home.</p></div><button className="text-link" onClick={onConsultation}>Meet us through your project <Arrow /></button></div><figure className="about-photograph reveal"><img src="/assets/portfolio-1914-entry.webp" alt="Actual project photograph of the 1914 Lee Street entrance at dusk, with white masonry, a glazed entry and landscaping" width="1200" height="1800" loading="lazy" /><figcaption><span>1914 LEE STREET / DES PLAINES</span><span>PROJECT PHOTOGRAPHY</span></figcaption></figure></div>
    <div className="about-philosophy"><span className="eyebrow">OUR POINT OF VIEW</span><p>Architecture with character.<br />Details with purpose.<br /><em>Homes with a sense of belonging.</em></p><span className="philosophy-note">Explore the real work<br />behind the vision.</span><a href="#properties" aria-label="Explore our properties"><Arrow down /></a></div>
  </section>;
}

export function PropertyCollection({ onView, motion }) {
  const [category, setCategory] = useState('all');
  const filters = useRef([]);
  const categories = [['all', 'All properties'], ['upcoming', 'Upcoming developments'], ['completed', 'Completed signature homes']];
  function keyDown(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
    setCategory(categories[next][0]); filters.current[next]?.focus();
  }
  const completed = category !== 'upcoming' ? projects : [];
  const showUpcoming = category !== 'completed';
  return <section className="property-collection section-pad" id="properties" data-chapter="05" aria-labelledby="properties-title">
    <div className="collection-heading"><div><p className="eyebrow light">03 / OUR PROPERTIES</p><h2 className="display" id="properties-title">Places with<br /><em>their own character.</em></h2></div><p>From an individual residence to a new neighborhood. Explore Grama’s completed work and the community we are planning next.</p></div>
    <div className="collection-toolbar"><div className="collection-tabs" role="tablist" aria-label="Property collections">{categories.map(([key, label], index) => <button ref={element => { filters.current[index] = element; }} key={key} role="tab" id={'collection-tab-' + key} aria-controls="collection-panel" aria-selected={category === key} tabIndex={category === key ? 0 : -1} onClick={() => setCategory(key)} onKeyDown={event => keyDown(event, index)}>{label}<span>{key === 'all' ? '04' : key === 'upcoming' ? '01' : '03'}</span></button>)}</div><span className="collection-location">DES PLAINES COLLECTION</span></div>
    <div id="collection-panel" role="tabpanel" aria-labelledby={'collection-tab-' + category} className="collection-grid" data-motion={motion ? 'on' : 'off'}>
      {showUpcoming && <article className="collection-development"><a className="collection-image" href="#architecture"><img src="/assets/community.webp" alt="Conceptual aerial visualization of Dexter Acres, a planned neighborhood of fourteen homes" width="1800" height="817" loading="lazy" /><span className="collection-image-tag">UPCOMING DEVELOPMENT</span><span className="collection-view"><Arrow /></span><span className="collection-image-note">AI CONCEPT VISUALIZATION</span></a><div className="collection-caption"><div><span>DEXTER ACRES / WEBSTER–DEXTER</span><h3>A new neighborhood. A shared vision.</h3></div><p>14 planned luxury homes<br />Des Plaines, Illinois</p></div><div className="development-line"><p>Individual homes, coordinated development. Explore the proposed neighborhood and begin a conversation about its possibilities.</p><a className="text-link light-link" href="#community">Explore Dexter Acres <Arrow /></a></div></article>}
      {completed.map((project, index) => <article className={'collection-project ' + (index === 0 ? 'collection-project-wide' : '')} key={project.name}><button className="collection-image" aria-label={'View ' + project.name + ' project'} onClick={() => onView({ image: project.image, images: [{ image: project.image, alt: project.alt }, ...(project.gallery || [])], title: project.name, caption: project.description + ' Actual photography from the official Grama portfolio and original project photo folders.', source: project.source })}><img src={'/assets/' + project.image} alt={project.alt} width="1800" height="1200" loading="lazy" /><span className="collection-view"><Arrow /></span><span className="collection-image-note">ACTUAL COMPLETED HOME</span></button><div className="collection-caption"><div><span>{project.label}</span><h3>{project.name}</h3></div><p>{project.detail}<br />Des Plaines, Illinois</p></div></article>)}
    </div>
    <div className="collection-footnote"><span>Concepts and completed homes are identified separately.</span><a className="text-link light-link" href="https://www.gramaconstruction.com/completed-projects" target="_blank" rel="noreferrer">Original Grama portfolio <Arrow /></a></div>
  </section>;
}

export function Capabilities() {
  const groups = [
    ['Land & opportunity', 'Land acquisition & development', 'Feasibility & project planning'],
    ['Design & coordination', 'Architecture & design coordination', 'Engineering, permitting & utilities coordination'],
    ['Budget & build', 'Detailed construction budgeting', 'Luxury custom-home construction'],
    ['Complete development', 'Residential development delivery', 'Investor & development partnerships'],
  ];
  return <section className="capabilities section-pad" id="services" aria-labelledby="capabilities-title"><div className="capabilities-heading"><p className="eyebrow">THE FULL PICTURE</p><h2 id="capabilities-title">One vision.<br /><em>A coordinated team.</em></h2><p>Grama brings the people, decisions and construction work together. Architects and engineers provide their professional services; municipalities and utility providers guide the approvals and connections.</p></div><div className="capabilities-list">{groups.map(([name, first, second], index) => <div className="capability" key={name}><span>0{index + 1}</span><div><h3>{name}</h3><p>{first}<br />{second}</p></div></div>)}</div></section>;
}

export function Partnerships({ onExplore }) {
  return <section className="partnerships" id="partnerships" data-chapter="07" aria-labelledby="partnership-title"><div className="partnership-photo"><img src="/assets/portfolio-dexter.webp" alt="Actual completed Grama residence and outdoor living space at 1847 Dexter Lane" width="1800" height="1200" loading="lazy" /><span>1847 DEXTER LANE / ACTUAL COMPLETED HOME</span></div><div className="partnership-copy"><p className="eyebrow light">04 / DEVELOPMENT & INVESTMENT</p><h2 className="display" id="partnership-title">See the potential.<br /><em>Shape what’s next.</em></h2><p>Bring a site, an idea or an interest in residential development. We work with landowners, investors and development partners to evaluate the opportunity and define a practical path forward.</p><div className="partnership-disciplines"><div><span>01</span><p>Identify the opportunity<br />& establish the project vision.</p></div><div><span>02</span><p>Define the structure,<br />scope & detailed budget.</p></div><div><span>03</span><p>Coordinate the team<br />& execute the development.</p></div></div><button className="text-link light-link" onClick={onExplore}>Explore investment partnerships <Arrow /></button><p className="partnership-note">Every opportunity is evaluated individually. A consultation explores fit; it is not an investment offer or a promise of returns.</p></div></section>;
}
