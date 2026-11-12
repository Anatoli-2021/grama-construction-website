import './BrandReview.css';

// All letter outlines below are original geometric drawings, not font conversions.
const wordmarkA = [
  "M139 52C126 33 108 24 83 24C47 24 24 50 24 94C24 137 47 163 85 163C109 163 129 154 143 140V100H100",
  "M188 163V27H237C266 27 284 42 284 66C284 91 266 106 237 106H188M236 106L291 163",
  "M330 163L384 27L438 163M350 112H418",
  "M479 163V27L541 120L603 27V163",
  "M643 163L697 27L751 163M663 112H731"
];
const wordmarkC = [
  "M124 20H16V136H124V76H72V98H100V114H40V42H124Z",
  "M160 136V20H218C247 20 264 35 264 58C264 76 255 88 238 93L270 136H241L212 96H184V136ZM184 42V74H215C231 74 240 69 240 58C240 47 231 42 215 42Z",
  "M301 136L343 20H369L412 136H387L377 108H334L324 136ZM341 87H370L355 45Z",
  "M448 136V20H476L510 83L544 20H572V136H548V64L520 120H500L472 64V136Z",
  "M608 136L650 20H676L719 136H694L684 108H641L631 136ZM648 87H677L662 45Z"
];
const monogramB = 'M82 22L66 6H26L6 26V74L26 94H74L94 74V48H52V62H78V68L68 78H32L22 68V32L32 22H64L72 30Z';

export function BrandLogo({ concept = 'a', compact = false, className = '', label }) {
  const symbol = concept === 'b' && compact;
  const viewBox = symbol ? '0 0 100 100' : concept === 'a' ? (compact ? '0 0 780 188' : '0 0 780 240') : concept === 'b' ? '0 0 780 230' : '0 0 740 240';
  const accessibleLabel = label || (symbol ? 'GRAMA geometric G concept' : 'GRAMA ' + (concept === 'c' ? 'Group' : 'Development') + ' — proposed identity');
  return <svg className={'brand-logo brand-logo--' + concept + ' ' + className} viewBox={viewBox} role="img" aria-label={accessibleLabel}>
    {concept === 'a' && <><g fill="none" stroke="currentColor" strokeWidth="8.5" strokeLinecap="square" strokeLinejoin="miter">{wordmarkA.map((d, i) => <path d={d} key={i} />)}</g>{!compact && <text x="390" y="221" textAnchor="middle" fill="currentColor" fontFamily="Arial,sans-serif" fontSize="36" letterSpacing="9">DEVELOPMENT</text>}</>}
    {concept === 'b' && (symbol ? <path fill="currentColor" d={monogramB} /> : <><path fill="currentColor" transform="translate(10 30) scale(1.45)" d={monogramB} /><g transform="translate(211 35) scale(.72)" fill="currentColor" fillRule="evenodd">{wordmarkC.map((d, i) => <path d={d} key={i} />)}</g><text x="482" y="190" textAnchor="middle" fill="currentColor" fontFamily="Arial,sans-serif" fontSize="34" letterSpacing="7.5">DEVELOPMENT</text></>)}
    {concept === 'c' && <><g fill="currentColor" fillRule="evenodd">{wordmarkC.map((d, i) => <path d={d} key={i} />)}</g><path d="M16 163H719" fill="none" stroke="currentColor" strokeWidth="2" /><text x="369" y="219" textAnchor="middle" fill="currentColor" fontFamily="Arial,sans-serif" fontSize="34" letterSpacing="14">GROUP</text></>}
  </svg>;
}

const concepts = [
  { key: 'a', name: 'Architectural wordmark', descriptor: 'GRAMA / DEVELOPMENT', file: 'grama-development-a.svg', lead: 'The recommended master.', description: 'Open, custom-drawn letters create a quiet architectural signature. A low crossbar and deliberate spacing give the wordmark its own rhythm.', strength: 'Editorial websites, project covers and large-format signage.', tradeoff: 'The full descriptor needs room; use the wordmark alone in compact settings.', scale: 'Full lockup: 180px minimum width. Compact wordmark: 20px minimum cap height.' },
  { key: 'b', name: 'Geometric monogram', descriptor: 'G / GRAMA DEVELOPMENT', file: 'grama-monogram-b.svg', lead: 'A compact identity system.', description: 'A beveled G uses an open center and offset inner return. The symbol works independently from its accompanying wordmark.', strength: 'Social avatars, document tabs, wayfinding and small digital marks.', tradeoff: 'A symbol needs repeated, consistent use before it can identify the company on its own.', scale: 'G symbol: 20px minimum. Full lockup: 180px minimum width.' },
  { key: 'c', name: 'Institutional group', descriptor: 'GRAMA / GROUP', file: 'grama-group-c.svg', lead: 'The strongest corporate expression.', description: 'Solid, custom block letters and a measured rule give this direction a firmer institutional presence.', strength: 'Corporate documents, long-distance signage and a future umbrella identity.', tradeoff: '“Group” may imply a broader structure; naming and corporate scope need confirmation.', scale: 'Full lockup: 160px minimum width. Preserve the open counters at small sizes.' },
];
const applications = [
  ['website', 'Corporate website', 'A brand-led homepage using completed-project photography.'],
  ['project', 'Development project page', 'Dexter Acres remains proposed; its architectural visualization is labelled.'],
  ['investor', 'Investor presentation', 'A cover and section system, with no offering terms or financial claims.'],
  ['brochure', 'Architectural brochure', 'Editorial cover using the completed Prospect Lane project.'],
  ['card', 'Business cards', 'Front and reverse studies using only the public company telephone and website.'],
  ['letterhead', 'Letterhead', 'A restrained correspondence template, with space for project-specific content.'],
  ['email', 'Email signature', 'A generic project-enquiry signature; no invented person, title or email address.'],
  ['social', 'Social media identity', 'A square project post with a clear, reusable image and type hierarchy.'],
  ['construction', 'Construction-site signage', 'Corporate board composition; this is not a claim of work at a pictured site.'],
  ['development', 'Development-site signage', 'Proposed Dexter Acres presentation; no approvals, availability or timing implied.'],
  ['property', 'Property marketing sheet', 'Completed-portfolio facts only; no listing, sale status, price or area.'],
  ['cover', 'Project presentation cover', 'A project-specific cover for 1847 Dexter Lane.'],
  ['advertisement', 'Digital advertisement', 'An unlaunched brand advertisement concept, with no invented offer.'],
];
const photos = {
  dexter: { src: '/assets/portfolio-dexter.webp', alt: 'Garden terrace and outdoor fireplace at 1847 Dexter Lane at dusk' },
  prospect: { src: '/assets/portfolio-prospect.webp', alt: 'Masonry exterior and turret at 1171 Prospect Lane' },
  community: { src: '/assets/community.webp', alt: 'AI-generated architectural concept aerial of proposed Dexter Acres' },
};
function Photo({ name = 'dexter', className = '' }) {
  const photo = photos[name];
  return <img className={className} src={photo.src} alt={photo.alt} loading="lazy" width={name === 'community' ? 1800 : 1800} height={name === 'community' ? 817 : 1200} />;
}
function PublicContact() {
  return <div className="br-public-contact"><span>+1 773 849 9634</span><span>gramaconstruction.com</span></div>;
}
function ApplicationArtwork({ kind }) {
  switch (kind) {
    case 'website': return <div className="br-web"><div className="br-web-nav"><BrandLogo /><span>Projects / Company / Contact</span></div><div className="br-web-image"><Photo /><div><small>COMPLETED PORTFOLIO / DES PLAINES</small><h4>Custom homes.<br /><em>Residential development.</em></h4></div></div></div>;
    case 'project': return <div className="br-project"><div className="br-project-title"><BrandLogo /><span>PROPOSED DEVELOPMENT</span><h4>Dexter Acres</h4><p>Fourteen proposed homes.<br />Des Plaines, Illinois.</p></div><Photo name="community" /><span className="br-image-label">ARCHITECTURAL VISUALIZATION / AI CONCEPT</span></div>;
    case 'investor': return <div className="br-investor"><div><BrandLogo /><span>RESIDENTIAL DEVELOPMENT</span><h4>A project<br />conversation.</h4><p>Company & project overview</p><small>PRESENTATION CONCEPT / NO OFFERING TERMS</small></div><Photo /></div>;
    case 'brochure': return <div className="br-brochure"><BrandLogo /><h4>Residential<br /><em>perspectives.</em></h4><Photo name="prospect" /><div><span>1171 PROSPECT LANE</span><small>COMPLETED PORTFOLIO / DES PLAINES</small></div></div>;
    case 'card': return <div className="br-business-cards"><div className="br-card-back"><BrandLogo /><span>RESIDENTIAL DEVELOPMENT</span></div><div className="br-card-front"><BrandLogo compact /><span>PROJECT ENQUIRIES</span><PublicContact /></div></div>;
    case 'letterhead': return <div className="br-letterhead"><BrandLogo /><div><span>PROJECT CORRESPONDENCE</span><h4>Residential<br />development.</h4><p>A clear space for the project,<br />the people and the next step.</p><i /><i /><i /></div><PublicContact /></div>;
    case 'email': return <div className="br-email"><div className="br-email-top"><span>Project correspondence</span><i /><i /><i /></div><div className="br-email-signature"><BrandLogo /><div><strong>Project enquiries</strong><span>Grama Construction</span><PublicContact /></div></div></div>;
    case 'social': return <div className="br-social"><Photo name="prospect" /><div><BrandLogo /><span>COMPLETED PORTFOLIO</span><h4>1171 Prospect Lane</h4><p>Des Plaines, Illinois</p></div></div>;
    case 'construction': return <div className="br-construction"><div className="br-fence" /><div className="br-site-board"><BrandLogo /><span>PROJECT ENQUIRIES</span><PublicContact /></div></div>;
    case 'development': return <div className="br-development"><Photo name="community" /><div className="br-development-board"><BrandLogo /><h4>Dexter Acres</h4><p>Proposed fourteen-home neighborhood<br />Des Plaines, Illinois</p><span>ARCHITECTURAL VISUALIZATION / AI CONCEPT</span></div></div>;
    case 'property': return <div className="br-property"><div><BrandLogo /><span>PROJECT PROFILE</span></div><Photo name="prospect" /><section><span>COMPLETED PORTFOLIO</span><h4>1171 Prospect Lane</h4><p>Des Plaines, Illinois</p><dl><div><dt>Exterior</dt><dd>Masonry & turret</dd></div><div><dt>Interiors</dt><dd>Custom residential details</dd></div></dl></section></div>;
    case 'cover': return <div className="br-cover"><BrandLogo /><div><span>PROJECT PRESENTATION</span><h4>1847<br />Dexter Lane</h4><p>Des Plaines, Illinois<br />Completed portfolio</p></div><Photo /></div>;
    case 'advertisement': return <div className="br-advertisement"><Photo /><div><BrandLogo /><h4>Custom homes.<br />Residential development.</h4><span className="br-ad-cta">Discuss your project ↗</span><small>gramaconstruction.com</small></div></div>;
    default: return null;
  }
}

export function BrandReview() {
  return <article className="brand-review">
    <header className="br-intro">
      <p className="br-overline">GRAMA / IDENTITY STUDY / 2026</p>
      <div className="br-intro-heading"><h1>GRAMA.<br /><em>Development.</em></h1><div><p>Three original identities for Grama’s development positioning.</p><p className="br-approval">SPELLING CONFIRMED: Grama Development.<br />Design and production release await Tony’s approval. Grama Construction remains the current public brand and legal-name changes are not authorized.</p></div></div>
      <nav className="br-section-nav" aria-label="Brand review sections"><a href="#brand-concepts">The identities</a><a href="#brand-master">Recommended master</a><a href="#brand-system">The system</a><a href="#brand-applications">13 applications</a></nav>
    </header>

    <section className="br-concepts" id="brand-concepts" aria-labelledby="br-concepts-title">
      <div className="br-section-head"><p className="br-overline">01 / ORIGINAL DIRECTIONS</p><h2 id="br-concepts-title">One name.<br /><em>Three expressions.</em></h2></div>
      <div className="br-concept-grid">{concepts.map(concept => <article className={'br-concept br-concept--' + concept.key} key={concept.key}>
        <div className="br-concept-art"><span>CONCEPT {concept.key.toUpperCase()}</span><BrandLogo concept={concept.key} /><small>{concept.descriptor}</small></div>
        <div className="br-concept-copy"><p className="br-overline">{concept.key.toUpperCase()} / {concept.lead}</p><h3>{concept.name}</h3><p>{concept.description}</p><dl><div><dt>Best fit</dt><dd>{concept.strength}</dd></div><div><dt>Trade-off</dt><dd>{concept.tradeoff}</dd></div><div><dt>Scale</dt><dd>{concept.scale}</dd></div></dl><a href={'/assets/brand/' + concept.file} download>Download original SVG <span aria-hidden="true">↗</span></a></div>
      </article>)}</div>
      <p className="br-trademark-note">All three are original design studies. Similarity searches, name availability and professional trademark review remain pending; originality of the drawings does not establish legal clearance.</p>
    </section>

    <section className="br-master" id="brand-master" aria-labelledby="br-master-title">
      <div><p className="br-overline">02 / RECOMMENDED — CONCEPT A</p><h2 id="br-master-title">GRAMA<br /><em>Development.</em></h2><p>The family name leads. “Development” describes the proposed direction without borrowing the scale or claims of a larger institution.</p><p>A precise wordmark can move from a project document to an architectural facade while keeping the photography and the work in focus.</p></div>
      <div className="br-master-proof"><div className="br-master-lockup"><BrandLogo /><span>MASTER LOCKUP / SINGLE COLOR</span></div><div className="br-master-compact"><BrandLogo compact /><span>COMPACT WORDMARK / DESCRIPTOR OMITTED</span></div><div className="br-small-scale"><BrandLogo compact /><BrandLogo concept="b" compact /><span>20px cap-height / symbol study</span></div></div>
    </section>

    <section className="br-system" id="brand-system" aria-labelledby="br-system-title">
      <div className="br-section-head"><p className="br-overline">03 / VISUAL SYSTEM</p><h2 id="br-system-title">Warmth.<br /><em>With structure.</em></h2></div>
      <div className="br-swatches">{[['Ivory','#F3F0E7'],['White','#FFFFFF'],['Architectural black','#20231F'],['Charcoal','#444841'],['Stone','#D8D2C5'],['Bronze accent','#8B6F4F']].map(([name,color]) => <div key={name}><span style={{ background: color }} /><strong>{name}</strong><small>{color}</small></div>)}</div>
      <div className="br-type-grid"><div><p className="br-overline">EDITORIAL / SYSTEM GEORGIA</p><p className="br-serif-specimen">Architecture,<br /><em>in perspective.</em></p><span>Display 40–96px / regular / measured italic emphasis</span></div><div><p className="br-overline">INFORMATION / EXISTING GENERAL SANS</p><p className="br-sans-specimen">Clear by design.</p><p>Project names, locations and status are given space to read. Body text stays direct, factual and useful.</p><span>Body 15–16px / 1.7 line-height / metadata 11–12px</span></div></div>
      <div className="br-system-notes"><p><strong>Single color.</strong> Use architectural black on ivory or white on charcoal. The bronze is an accent, never a gradient.</p><p><strong>Clear space.</strong> Keep at least half a cap height around the wordmark. No stretching, outlines, effects or substitution of letterforms.</p><p><strong>Original vectors.</strong> Custom letter geometry; system-text descriptors. No converted font outlines, embedded fonts or copied brand symbols.</p></div>
    </section>

    <section className="br-applications" id="brand-applications" aria-labelledby="br-applications-title">
      <div className="br-section-head"><p className="br-overline">04 / IDENTITY IN USE</p><h2 id="br-applications-title">The identity.<br /><em>In use.</em></h2><p>All applications below are concepts. Existing photographs show completed-portfolio projects; Dexter Acres imagery is a proposed architectural visualization.</p></div>
      <div className="br-application-grid">{applications.map(([kind,title,note],index) => <figure className={'br-application br-application--' + kind} key={kind}><div className="br-artwork"><span className="br-concept-stamp">CONCEPT</span><ApplicationArtwork kind={kind} /></div><figcaption><span>{String(index + 1).padStart(2,'0')} / {title}</span><p>{note}</p></figcaption></figure>)}</div>
    </section>

    <footer className="br-review-footer"><div><p className="br-overline">NEXT DECISION / CLIENT REVIEW</p><h2>Choose the identity.<br /><em>Review the experience.</em></h2><p>Concept A is recommended. Tony’s approval is required before replacing the public identity, changing a legal name or deploying this rebrand to the production website.</p></div><div><a href="/">Return to website preview ↗</a><a href="/projects">Explore the existing project portfolio ↗</a><p>Photography sources: <a href="https://www.gramaconstruction.com/projects/1847-dexter-des-plaines" target="_blank" rel="noreferrer">1847 Dexter Lane</a> and <a href="https://www.gramaconstruction.com/projects/prospect-ln-des-plaines-il-60018" target="_blank" rel="noreferrer">1171 Prospect Lane</a>. Dexter Acres: existing supplied concept asset, not a completed project.</p></div></footer>
  </article>;
}

export default BrandReview;
