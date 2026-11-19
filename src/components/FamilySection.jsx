import './FamilySection.css';

export default function FamilySection({ full = false }) {
  return <section className={'family-section' + (full ? ' family-section--full' : '')} aria-labelledby="family-section-title">
    <div className="family-section-heading">
      <p className="site-label">THE PEOPLE BEHIND GRAMA</p>
      <h2 id="family-section-title">The Grama family.</h2>
      <div><p>Based in Chicagoland, Anatoly Grama leads the company and Alina Grama is its exclusive realtor.</p>{!full && <a className="site-link" href="/about">Meet the family <span aria-hidden="true">↗</span></a>}</div>
    </div>
    <div className="family-portraits">
      <figure className="family-portrait family-tony">
        <div className="family-portrait-frame"><img src="/assets/tony-grama.webp" alt="Anatoly Grama beside a company vehicle" width="1280" height="853" loading="lazy" /></div>
        <figcaption className="family-caption"><span>Anatoly Grama</span><span>Founder</span></figcaption>
      </figure>
      <figure className="family-portrait family-alina">
        <div className="family-portrait-frame"><img src={full ? '/assets/photo/alina-realtor.jpg' : '/assets/photo/alina-portrait.jpg'} alt="Alina Grama, Grama Development’s exclusive realtor" width={full ? 786 : 794} height="1128" loading="lazy" /></div>
        <figcaption className="family-caption"><span>Alina Grama</span><span>Exclusive realtor</span></figcaption>
      </figure>
    </div>
  </section>;
}
