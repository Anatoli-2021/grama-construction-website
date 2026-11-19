import { useEffect, useState } from 'react';
import { enquiryHref } from '../enquiry-context.js';
import { websiteIntakeUrl } from '../website-intake.js';
import { lotData } from './SitePlan.jsx';

export default function DexterConsultation() {
  const [lotId, setLotId] = useState('');
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  const lot = lotData.find(({ id }) => String(id) === lotId);
  const intakeUrl = websiteIntakeUrl('Dexter Acres', lot?.id);
  const href = intakeUrl ||
    enquiryHref({ path: 'home', topic: 'Dexter Acres', lot: lot?.id });

  return <section className="page-invitation dexter-consultation section-pad" aria-labelledby="dexter-consultation-title">
    <p className="eyebrow">DEXTER ACRES ENQUIRIES</p>
    <h2 className="display" id="dexter-consultation-title">Plan a home<br /><em>consultation.</em></h2>
    <p>Share what you are looking for in a home. You can reference a lot from the concept plan or leave the selection open.</p>
    <div className="dexter-consultation-choice">
      <label htmlFor="dexter-consultation-lot">Lot on the concept plan</label>
      <select id="dexter-consultation-lot" value={lotId} disabled={!interactive} onChange={event => setLotId(event.target.value)}>
        <option value="">Leave the selection open</option>
        {lotData.map(({ id, frontage }) => <option key={id} value={id}>Lot {id} · {frontage}</option>)}
      </select>
      {interactive && <p role="status">{lot ? `Lot ${lot.id} · ${lot.area.toLocaleString('en-US')} sq ft on the supplied C5 drawing.` : 'Selecting a lot adds it to your enquiry.'}</p>}
      <noscript><p>Include your preferred lot when you make an enquiry.</p></noscript>
    </div>
    <p>Lots and dimensions are conceptual. Availability and designs require confirmation.</p>
    <a className="button button-dark" href={href}>Enquire about Dexter Acres <span aria-hidden="true">↗</span></a>
    {intakeUrl && <p>Continue to the enquiry form hosted by Smartsheet.</p>}
  </section>;
}
