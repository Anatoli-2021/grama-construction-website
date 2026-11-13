import { TrustedPartners } from './BrandSections.jsx';
import DevelopmentProcess from './DevelopmentProcess.jsx';
import Consultation from './Consultation.jsx';
import FamilySection from './FamilySection.jsx';
import { enquiryHref } from '../enquiry-context.js';
import './CompanyPages.css';

const developmentEnquiry = { path: 'development', topic: 'Development partnership' };

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.3" /></svg>;
}

function ContactLink({ onContact, context = developmentEnquiry, children, className = 'button button-dark' }) {
  function follow(event) {
    if (!onContact || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onContact(context);
  }
  return <a className={className} href={enquiryHref(context)} onClick={follow}>{children}<Arrow /></a>;
}

export function GenericPageIntro({ current, eyebrow, title, description, children }) {
  return (
    <header className="company-page-intro">
      <nav className="company-breadcrumb" aria-label="Breadcrumb">
        <ol><li><a href="/">Home</a></li><li><span aria-current="page">{current}</span></li></ol>
      </nav>
      <div className="company-intro-layout">
        <div><p className="company-label">{eyebrow}</p><h1 id="company-page-title" className="company-page-title">{title}</h1></div>
        <div className="company-intro-copy"><p>{description}</p>{children && <div className="company-page-actions">{children}</div>}</div>
      </div>
    </header>
  );
}

export function AboutPage({ onConsultation }) {
  return (
    <div className="company-page company-page--about">
      <GenericPageIntro
        current="About"
        eyebrow="A FAMILY BUSINESS / CHICAGOLAND"
        title={<>Grama<br /><em>Development.</em></>}
        description="A family business building luxury custom homes and residential projects in Chicago and Chicagoland. Led by Anatoli (Tony) Grama, with Alina as the company’s exclusive realtor."
      >
        <ContactLink onContact={onConsultation}>Discuss a project</ContactLink>
        <a className="text-link" href="/projects">View the portfolio <Arrow /></a>
      </GenericPageIntro>

      <FamilySection full />

      <section className="company-work company-page-section" id="services" aria-labelledby="company-work-title">
        <figure className="company-work-photo"><a href="/projects/1847-dexter-lane"><img src="/assets/portfolio-dexter.webp" alt="Garden terrace and outdoor fireplace at 1847 Dexter Lane in Des Plaines" width="1800" height="1200" loading="lazy" /></a><figcaption>1847 Dexter Lane · Des Plaines · Project photography</figcaption></figure>
        <div className="company-work-copy">
          <p className="company-label">OUR WORK</p>
          <h2 id="company-work-title">Custom homes.<br /><em>Residential development.</em></h2>
          <p>Our work connects site planning, architectural coordination, construction budgeting and delivery, alongside the architects, engineers and trades involved in each project.</p>
          <ul><li>Luxury custom residential construction</li><li>Home renovation</li><li>Residential development partnerships</li></ul>
          <a className="text-link" href="/partnerships">Explore partnerships <Arrow /></a>
        </div>
      </section>

      <TrustedPartners />
      <section className="company-page-callout company-page-section" aria-labelledby="company-about-contact-title">
        <div><p className="company-label">WORK WITH GRAMA</p><h2 id="company-about-contact-title">Tell us about<br /><em>your project.</em></h2></div>
        <ContactLink onContact={onConsultation}>Start a conversation</ContactLink>
      </section>
    </div>
  );
}

const partnershipPaths = [
  { name: 'Landowners', topic: 'Landowner opportunity', description: 'Share your property’s location and the residential use you are considering. Begin with the site and its possibilities.', action: 'Discuss your land' },
  { name: 'Developers', topic: 'Development partnership', description: 'Bring a residential project for construction planning, budget coordination or delivery. Define the scope and who is involved.', action: 'Discuss your project' },
  { name: 'Investment partners', topic: 'Investment partnership', description: 'Start a conversation about a specific development, the proposed partnership structure and the information needed to assess it.', action: 'Discuss a partnership' },
];

export function PartnershipsPage({ onExplore }) {
  return (
    <div className="company-page company-page--partnerships">
      <GenericPageIntro
        current="Partnerships"
        eyebrow="LANDOWNERS / DEVELOPERS / INVESTMENT PARTNERS"
        title={<>Development<br /><em>partnerships.</em></>}
        description="For landowners, developers and investment partners considering a residential project in Chicago or Chicagoland. Start with a site, a scope and a conversation."
      >
        <ContactLink onContact={onExplore}>Discuss a development</ContactLink>
        <a className="text-link" href="#process">Our development process <Arrow /></a>
      </GenericPageIntro>

      <section className="company-pathways company-page-section" aria-labelledby="company-pathways-title">
        <div className="company-section-heading"><p className="company-label">THREE WAYS TO WORK TOGETHER</p><h2 id="company-pathways-title">Your starting point.</h2></div>
        <div className="company-pathway-grid">
          {partnershipPaths.map((item, index) => <article className="company-pathway" key={item.name}><span className="company-label">0{index + 1}</span><h3>{item.name}</h3><p>{item.description}</p><ContactLink className="text-link" onContact={onExplore} context={{ path: 'development', topic: item.topic }}>{item.action}</ContactLink></article>)}
        </div>
        <p className="company-scope-note">Project scope, terms and responsibilities are agreed individually.</p>
      </section>

      <DevelopmentProcess onConsultation={() => onExplore?.(developmentEnquiry)} />

      <section className="company-portfolio company-page-section" aria-labelledby="company-portfolio-title">
        <div className="company-section-heading"><div><p className="company-label">COMPLETED WORK</p><h2 id="company-portfolio-title">The work,<br /><em>in detail.</em></h2></div><a className="text-link" href="/projects">View the portfolio <Arrow /></a></div>
        <div className="company-portfolio-grid">
          <figure><a href="/projects/1847-dexter-lane"><img src="/assets/portfolio-dexter.webp" alt="Garden terrace and outdoor fireplace at 1847 Dexter Lane" width="1800" height="1200" loading="lazy" /></a><figcaption><span>1847 Dexter Lane</span><span>Des Plaines · Project photography</span></figcaption></figure>
          <figure><a href="/projects/1906-lee-street"><img src="/assets/portfolio-lee.webp" alt="Kitchen with wood cabinetry and a stone island at 1906 Lee Street" width="1800" height="1200" loading="lazy" /></a><figcaption><span>1906 Lee Street</span><span>Des Plaines · Project photography</span></figcaption></figure>
        </div>
      </section>

      <section className="company-page-callout company-page-section" aria-labelledby="company-partnership-contact-title">
        <div><p className="company-label">YOUR NEXT PROJECT</p><h2 id="company-partnership-contact-title">Discuss the site.<br /><em>Define the scope.</em></h2></div>
        <ContactLink onContact={onExplore}>Speak with Grama Development</ContactLink>
      </section>
    </div>
  );
}

export function DevelopmentsPage({ onConsultation }) {
  return (
    <div className="company-page company-page--developments">
      <GenericPageIntro
        current="Developments"
        eyebrow="RESIDENTIAL DEVELOPMENT / CHICAGOLAND"
        title={<>Residential<br /><em>development.</em></>}
        description="Explore Dexter Acres, a proposed fourteen-home neighborhood in Des Plaines. View the community concept, supplied site plan and interactive lot map."
      >
        <a className="text-link" href="/projects/dexter-acres">Explore Dexter Acres <Arrow /></a>
      </GenericPageIntro>

      <section className="company-development company-page-section" aria-labelledby="development-dexter-title">
        <div className="company-development-heading"><div><p className="company-label">PROPOSED DEVELOPMENT</p><h2 id="development-dexter-title">Dexter Acres</h2></div><p>Webster & Dexter Lanes<br />Des Plaines, Illinois</p></div>
        <figure className="company-development-concept"><a href="/projects/dexter-acres"><img src="/assets/community.webp" alt="AI-generated architectural concept of the proposed fourteen-home Dexter Acres neighborhood" width="1800" height="817" loading="lazy" /></a><figcaption><span>Community concept · AI-generated architectural visualization</span><span>Proposed development · 14 planned homes</span></figcaption></figure>
        <div className="company-development-details">
          <div><p className="company-label">DEXTER ACRES / DES PLAINES</p><h3>A neighborhood<br /><em>in planning.</em></h3><p>A proposed residential community of fourteen homes at Webster and Dexter Lanes. The concept imagery and supplied plan introduce the project; explore the map for the individual lots.</p><a className="text-link" href="/projects/dexter-acres#community">Explore the fourteen-lot map <Arrow /></a></div>
          <dl><div><dt>Location</dt><dd>Des Plaines, Illinois</dd></div><div><dt>Planned homes</dt><dd>14</dd></div><div><dt>Project status</dt><dd>Proposed development</dd></div><div><dt>Visuals</dt><dd>Architectural concepts & supplied site plan</dd></div></dl>
        </div>
      </section>

      <section className="company-plan company-page-section" aria-labelledby="development-plan-title">
        <div className="company-section-heading"><div><p className="company-label">THE SITE</p><h2 id="development-plan-title">The supplied plan.</h2></div><p>Review the source drawing alongside the interactive map. The plan is presented as supplied; the map is an illustrated guide.</p></div>
        <figure><a href="/assets/site-plan-original.png" target="_blank" rel="noreferrer" aria-label="Open the supplied Dexter Acres site plan"><img src="/assets/site-plan-original.png" alt="Supplied Webster–Dexter subdivision drawing showing the fourteen planned lots" width="1345" height="933" loading="lazy" /></a><figcaption><span>Webster–Dexter · Supplied subdivision plan</span><a href="/assets/site-plan-original.png" target="_blank" rel="noreferrer">Open original plan <Arrow /></a></figcaption></figure>
        <div className="company-development-links"><a className="text-link" href="/projects/dexter-acres#community">Interactive lot map <Arrow /></a><a className="text-link" href="/animated-experience">Animated Experience <Arrow /></a><ContactLink className="text-link" onContact={onConsultation} context={{ path: 'home', topic: 'Dexter Acres' }}>Ask about Dexter Acres</ContactLink></div>
      </section>

      <section className="company-page-callout company-page-section" aria-labelledby="development-contact-title">
        <div><p className="company-label">DEVELOP WITH GRAMA</p><h2 id="development-contact-title">Bring your site.<br /><em>Start a conversation.</em></h2></div>
        <ContactLink onContact={onConsultation} context={{ path: 'development', topic: 'Landowner opportunity' }}>Discuss a land opportunity</ContactLink>
      </section>
    </div>
  );
}

export function ContactPage({ request, motion }) {
  return (
    <div className="company-page company-page--contact">
      <GenericPageIntro
        current="Contact"
        eyebrow="GRAMA DEVELOPMENT / CHICAGOLAND"
        title={<>Let’s<br /><em>talk.</em></>}
        description="Land, development partnerships or a custom home. Call us directly, or prepare your project details below."
      >
        <a className="company-contact-phone" href="tel:+17738499634"><span className="company-label">CALL GRAMA DEVELOPMENT</span><span>+1 773 849 9634 <Arrow /></span></a>
      </GenericPageIntro>
      <Consultation request={request} motion={motion} />
      <nav className="company-contact-links company-page-section" aria-label="Explore Grama Development"><a className="text-link" href="/partnerships">Partnerships <Arrow /></a><a className="text-link" href="/projects">Portfolio <Arrow /></a><a className="text-link" href="/about">Meet the family <Arrow /></a></nav>
    </div>
  );
}
