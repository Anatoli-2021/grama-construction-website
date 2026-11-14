import './FamilySection.css';

export default function FamilySection({ full = false }) {
  return <section className={'family-section' + (full ? ' family-section--full' : '')} aria-labelledby="family-section-title">
    <div className="family-section-heading">
      <p className="site-label">THE PEOPLE BEHIND GRAMA</p>
      <h2 id="family-section-title">Tony & Alina.</h2>
      <div><p>A family business in Chicago and Chicagoland. Tony leads the company; Alina is its exclusive realtor.</p>{!full && <a className="site-link" href="/about">Meet the family <span aria-hidden="true">↗</span></a>}</div>
    </div>
    <div className="family-portraits">
      <figure className="family-tony"><img src="/assets/tony-grama.webp" alt="Anatoli (Tony) Grama beside a company vehicle" width="1280" height="853" loading="lazy" /><figcaption><span>Anatoli (Tony) Grama</span><span>Founder</span></figcaption></figure>
      <div className="family-alina">
        <img src={full ? '/assets/photo/alina-realtor.jpg' : '/assets/photo/alina-portrait.jpg'} alt="Alina, Grama Development’s exclusive realtor" width={full ? 786 : 794} height="1128" loading="lazy" />
        <p className="family-caption"><span>Alina</span><span>Exclusive realtor</span></p>
      </div>
    </div>
  </section>;
}
