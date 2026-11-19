import { useState } from 'react';
import { enquiryHref } from '../enquiry-context.js';
import { websiteIntakeUrl } from '../website-intake.js';
import { lotData } from './SitePlan.jsx';

export default function DexterConsultation() {
  const [lotId, setLotId] = useState('');
  const lot = lotData.find(({ id }) => String(id) === lotId);
  const href = websiteIntakeUrl('Dexter Acres', lot?.id) ||
    enquiryHref({ path: 'home', topic: 'Dexter Acres', lot: lot?.id });

  return <section className="page-invitation dexter-consultation section-pad" aria-labelledby="dexter-consultation-title">
    <p className="eyebrow">DEXTER ACRES ENQUIRIES</p>
    <h2 className="display" id="dexter-consultation-title">Plan a home<br /><em>consultation.</em></h2>
    <p>Share what you are looking for in a home. You can reference a lot from the concept plan or leave the selection open.</p>
    <div className="dexter-consultation-choice">
      <label htmlFor="dexter-consultation-lot">Lot on the concept plan</label>
      <select id="dexter-consultation-lot" value={lotId} onChange={event => setLotId(event.target.value)}>
        <option value="">Leave the selection open</option>
        {lotData.map(({ id, frontage }) => <option key={id} value={id}>Lot {id} · {frontage}</option>)}
      </select>
      <p role="status">{lot ? `Lot ${lot.id} · ${lot.area.toLocaleString('en-US')} sq ft on the supplied C5 drawing.` : 'Selecting a lot adds it to your enquiry.'}</p>
    </div>
    <p>Lots and dimensions are conceptual. Availability and designs require confirmation.</p>
    <a className="button button-dark" href={href}>Enquire about Dexter Acres <span aria-hidden="true">↗</span></a>
  </section>;
}
