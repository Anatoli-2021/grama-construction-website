import { TrustedPartners } from './BrandSections.jsx';
import DevelopmentProcess from './DevelopmentProcess.jsx';
import Consultation from './Consultation.jsx';
import './CompanyPages.css';

const developmentEnquiry = { path: 'development', topic: 'Development partnership' };

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.3" /></svg>;
}

function ContactLink({ onContact, context = developmentEnquiry, children, className = 'button button-dark' }) {
  const query = new URLSearchParams(context).toString();
  function follow(event) {
    if (!onContact || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onContact(context);
  }
  return <a className={className} href={'/contact?' + query} onClick={follow}>{children}<Arrow /></a>;
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
        current="About Grama"
        eyebrow="GRAMA CONSTRUCTION / CHICAGO"
        title={<>Meet Grama.<br /><em>A family business.</em></>}
        description="Luxury custom homes, renovation and residential development in Chicago and the surrounding Illinois suburbs. Meet the family behind the company and explore the work."
      >
        <ContactLink onContact={onConsultation}>Discuss a project</ContactLink>
        <a className="text-link" href="/projects">View our projects <Arrow /></a>
      </GenericPageIntro>

      <section className="company-family company-page-section" aria-labelledby="company-family-title">
        <div className="company-section-heading">
          <h2 id="company-family-title">Tony and Alina.<br /><em>The people behind Grama.</em></h2>
          <p>Anatoli, known as Tony, founded Grama Construction. His wife Alina is the company’s exclusive realtor. Together, they are the family behind the business.</p>
        </div>
        <div className="company-people-grid">
          <article className="company-person company-person--tony">
            <figure className="company-person-photo"><img src="/assets/tony-grama.webp" alt="Anatoli (Tony) Grama beside a Grama Construction vehicle" width="1280" height="853" loading="lazy" /><figcaption>FOUNDER / GRAMA CONSTRUCTION</figcaption></figure>
            <h3>Anatoli (Tony) Grama</h3>
            <p>Tony founded Grama Construction. He works with property owners, developers and investment partners on custom homes, renovation and residential development.</p>
          </article>
          <article className="company-person company-person--alina">
            <figure className="company-person-photo"><img src="/assets/grama-realtor.webp" alt="Alina, Grama Construction’s exclusive realtor" width="600" height="852" loading="lazy" /><figcaption>EXCLUSIVE REALTOR</figcaption></figure>
            <h3>Alina</h3>
            <p>Alina is Grama Construction’s exclusive realtor and Tony’s wife. She is part of the family behind the company.</p>
          </article>
        </div>
      </section>

      <section className="company-work company-page-section" id="services" aria-labelledby="company-work-title">
        <figure className="company-work-photo"><img src="/assets/portfolio-dexter.webp" alt="Garden terrace and outdoor fireplace at 1847 Dexter Lane in Des Plaines" width="1800" height="1200" loading="lazy" /><figcaption>1847 DEXTER LANE / DES PLAINES · PROJECT PHOTOGRAPHY</figcaption></figure>
        <div className="company-work-copy">
          <p className="company-label">CUSTOM HOMES & DEVELOPMENT</p>
          <h2 id="company-work-title">From the site.<br /><em>Through construction.</em></h2>
          <p>Grama works across site planning, architectural coordination, construction budgeting and project delivery. Architects, engineers, trades and other project professionals contribute their respective expertise.</p>
          <ul><li>Luxury custom residential construction</li><li>Home renovation</li><li>Residential development partnerships</li></ul>
          <a className="text-link" href="/partnerships">Explore development partnerships <Arrow /></a>
        </div>
      </section>

      <TrustedPartners />
      <section className="company-page-callout company-page-section" aria-labelledby="company-about-contact-title">
        <div><p className="company-label">SPEAK WITH GRAMA</p><h2 id="company-about-contact-title">Have a project in mind?</h2><p>Discuss a site, a custom home or a residential development with Grama.</p></div>
        <ContactLink onContact={onConsultation}>Start a project discussion</ContactLink>
      </section>
    </div>
  );
}

const partnershipPaths = [
  { name: 'Landowners', topic: 'Landowner opportunity', description: 'Discuss land you own, the residential use you have in mind and the early questions that need review.', action: 'Discuss your land' },
  { name: 'Developers', topic: 'Development partnership', description: 'Discuss the project scope, design coordination, construction budget and work needed to deliver a residential development.', action: 'Discuss your project' },
  { name: 'Investment partners', topic: 'Investment partnership', description: 'Discuss a specific residential development proposal, Grama’s role and the responsibilities of the project partners.', action: 'Discuss a partnership' },
];

export function PartnershipsPage({ onExplore }) {
  return (
    <div className="company-page company-page--partnerships">
      <GenericPageIntro
        current="Partnerships"
        eyebrow="LANDOWNERS / DEVELOPERS / INVESTMENT PARTNERS"
        title={<>Development<br /><em>partnerships.</em></>}
        description="Bring a site, a residential development proposal or an interest in working with Grama. Start with the project, its scope and the role each partner will play."
      >
        <ContactLink onContact={onExplore}>Discuss a development</ContactLink>
        <a className="text-link" href="/projects">Explore the portfolio <Arrow /></a>
      </GenericPageIntro>

      <section className="company-pathways company-page-section" aria-labelledby="company-pathways-title">
        <div className="company-section-heading"><h2 id="company-pathways-title">Where would you<br /><em>like to begin?</em></h2><p>Different projects begin at different stages. Tell us what you have, what you are considering and where you would like Grama to be involved.</p></div>
        <div className="company-pathway-grid">
          {partnershipPaths.map((item, index) => <article className="company-pathway" key={item.name}><span className="company-label">0{index + 1}</span><h3>{item.name}</h3><p>{item.description}</p><ContactLink className="text-link" onContact={onExplore} context={{ path: 'development', topic: item.topic }}>{item.action}</ContactLink></article>)}
        </div>
        <p className="company-scope-note">Project scope, terms and responsibilities are agreed individually.</p>
      </section>

      <DevelopmentProcess onConsultation={() => onExplore?.(developmentEnquiry)} />

      <section className="company-portfolio company-page-section" aria-labelledby="company-portfolio-title">
        <div className="company-section-heading"><h2 id="company-portfolio-title">See the<br /><em>completed portfolio.</em></h2><div><p>Explore project photography from Grama’s residential work in Des Plaines and the Chicago area.</p><a className="text-link" href="/projects">View completed projects <Arrow /></a></div></div>
        <div className="company-portfolio-grid">
          <figure><a href="/projects"><img src="/assets/portfolio-dexter.webp" alt="Garden terrace and outdoor fireplace at 1847 Dexter Lane" width="1800" height="1200" loading="lazy" /></a><figcaption><span>1847 Dexter Lane</span><span>Des Plaines / Project photography</span></figcaption></figure>
          <figure><a href="/projects"><img src="/assets/portfolio-lee.webp" alt="Kitchen with wood cabinetry and a stone island at 1906 Lee Street" width="1800" height="1200" loading="lazy" /></a><figcaption><span>1906 Lee Street</span><span>Des Plaines / Project photography</span></figcaption></figure>
        </div>
      </section>

      <section className="company-page-callout company-page-section" aria-labelledby="company-partnership-contact-title">
        <div><p className="company-label">YOUR NEXT PROJECT</p><h2 id="company-partnership-contact-title">Discuss the site.<br /><em>Define the next steps.</em></h2><p>Talk through the development, construction work or partnership you have in mind.</p></div>
        <ContactLink onContact={onExplore}>Speak with Grama</ContactLink>
      </section>
    </div>
  );
}

export function ContactPage({ request, motion }) {
  return (
    <div className="company-page company-page--contact">
      <GenericPageIntro
        current="Contact"
        eyebrow="CHICAGO & THE SURROUNDING ILLINOIS SUBURBS"
        title={<>Contact<br /><em>Grama Construction.</em></>}
        description="Discuss a site, a residential development or a custom home. Call Grama directly, or use the form below to prepare your project details."
      >
        <a className="company-contact-phone" href="tel:+17738499634"><span className="company-label">CALL GRAMA</span><span>+1 773 849 9634 <Arrow /></span></a>
      </GenericPageIntro>
      <Consultation request={request} motion={motion} />
      <nav className="company-contact-links company-page-section" aria-label="Explore Grama"><a className="text-link" href="/partnerships">Development partnerships <Arrow /></a><a className="text-link" href="/projects">Completed projects <Arrow /></a><a className="text-link" href="/about">Meet the family <Arrow /></a></nav>
    </div>
  );
}
