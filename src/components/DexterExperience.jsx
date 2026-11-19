import { useState } from 'react';
import SitePlan, { lotData } from './SitePlan.jsx';
import CinematicStory from './CinematicStory.jsx';
import './DexterExperience.css';

const masterplan = {
  image: 'masterplan/dexter-acres-828082967e9d.webp',
  title: 'Dexter Acres masterplan',
  caption: 'Architectural concept based on the supplied Webster–Dexter lot layout.',
};

function Arrow({ diagonal = false }) { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M3 12h17m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.3" /></svg>; }

export default function DexterExperience({ motion, onView, onConsultation }) {
  const [selectedLot, setSelectedLot] = useState(10);
  const lot = lotData.find(item => item.id === selectedLot);
  function enquireLot() { onConsultation({ path: 'home', topic: 'Dexter Acres', lot: String(selectedLot) }); }
  return <>
        <section className="dexter-overview section-pad" aria-label="Dexter Acres project overview">
          <div className="dexter-overview-inner">
            <figure className="dexter-masterplan">
              <img
                src={`/assets/${masterplan.image}`}
                alt="Aerial concept of the fourteen planned Dexter Acres homes and their street layout"
                width="2048"
                height="1152"
                fetchPriority="high"
              />
              <figcaption>
                <span>{masterplan.caption}</span>
                <button type="button" onClick={() => onView(masterplan)}>
                  View masterplan <Arrow diagonal />
                </button>
              </figcaption>
            </figure>
            <dl className="dexter-facts">
              <div><dt>Site</dt><dd>Webster &amp; Dexter Lanes</dd></div>
              <div><dt>Planned homes</dt><dd>14</dd></div>
              <div><dt>Status</dt><dd>Proposed development</dd></div>
            </dl>
          </div>
        </section>
        <CinematicStory motion={motion} />
        <section className="community section-pad" id="community" data-chapter="05" aria-labelledby="community-title">
          <div className="section-heading reveal"><div className="heading-row"><h2 className="display" id="community-title">The lot plan.</h2><p>Select a lot to see its area and street frontage from the supplied plan.</p></div></div>
          <div className="community-layout"><div className="map-frame"><div className="map-topline"><span>EXPLORE THE PROPOSED LOTS</span><span>SELECT A LOT <Arrow diagonal /></span></div><SitePlan selectedLot={selectedLot} onSelectLot={setSelectedLot} /></div><aside className="lot-panel" aria-live="polite"><div className="lot-panel-top"><span className="eyebrow">LOT DETAILS</span><span className="lot-status">PLANNED COMMUNITY</span></div><div className="lot-number"><span>LOT</span><strong>{String(selectedLot).padStart(2, '0')}</strong></div><h3>{lot.frontage === 'Internal street' ? 'Within the neighborhood.' : 'Along ' + lot.frontage + '.'}</h3><dl><div><dt>Drawing-reported area</dt><dd>{lot.area.toLocaleString('en-US')} <span>sq ft</span></dd></div><div><dt>Frontage</dt><dd>{lot.frontage}</dd></div></dl><button className="button button-dark" onClick={enquireLot}>Enquire about this lot <Arrow diagonal /></button><button className="text-link plan-link" onClick={() => onView({ image: 'site-plan-original.png', title: 'Supplied subdivision drawing — C5', caption: 'The supplied drawing is the reference for lot numbering. Approval status and current engineering revisions have not been established.' })}>View the source drawing <span>+</span></button><p className="fineprint">Lot selection expresses interest only. Availability, dimensions, home designs and project details are subject to confirmation and the current approved documents.</p></aside></div>
          <div className="community-notes"><div><span className="tiny-number">I.</span><h3>14 planned homes</h3><p>A residential development concept at Webster and Dexter Lanes in Des Plaines.</p></div><div><span className="tiny-number">II.</span><h3>Site coordination</h3><p>Street access, utilities, landscape and drainage depend on the project’s engineering and approved plans.</p></div><div><span className="tiny-number">III.</span><h3>Development enquiries</h3><p>Speak with Grama Development about the project, a potential collaboration or your interest in a home.</p></div></div>
        </section>
  </>;
}
