import { useEffect, useRef, useState } from 'react';
import { publicContactEmail } from '../contact-email.js';
import { KITCHEN_PHOTO_PIXEL_LIMIT, kitchenPhotoError } from '../kitchen-photo.js';
import './KitchensPage.css';

const businessEmail = publicContactEmail(import.meta.env.VITE_CONTACT_EMAIL);
const services = ['Custom cabinetry', 'A complete kitchen remodel', 'I am exploring the possibilities'];

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.3" /></svg>;
}

function conceptEmail(service, notes) {
  if (!businessEmail) return '';
  const body = [
    'Hello Grama Development,', '',
    'I would like to discuss an initial Grama Kitchens concept.',
    'I am interested in: ' + service + '.',
    ...(notes.trim() ? ['', 'What I would like to change:', notes.trim()] : []),
    '', 'Please confirm the next steps and what the initial concept includes.',
    'I can add a kitchen photo to this email myself.',
  ].join('\r\n');
  return 'mailto:' + encodeURIComponent(businessEmail).replace(/%40/g, '@')
    + '?subject=' + encodeURIComponent('Grama Kitchens — initial concept enquiry') + '&body=' + encodeURIComponent(body);
}

function officialIntakeLink(value) {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export default function KitchensPage({ intakeUrl = '' } = {}) {
  const officialIntake = officialIntakeLink(intakeUrl);
  const [service, setService] = useState(services[0]);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [reading, setReading] = useState(false);
  const input = useRef(null);
  const selection = useRef(0);

  useEffect(() => () => { selection.current += 1; }, []);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url); }, [photo]);

  function removePhoto() {
    selection.current += 1;
    setPhoto(null);
    setPhotoError('');
    setReading(false);
    if (input.current) {
      input.current.value = '';
      input.current.focus();
    }
  }

  async function selectPhoto(event) {
    const file = event.currentTarget.files?.[0];
    const request = ++selection.current;
    setPhoto(null);
    setPhotoError('');
    setReading(Boolean(file));
    if (!file) return;
    const error = await kitchenPhotoError(file);
    if (request !== selection.current) return;
    setReading(false);
    if (error) {
      setPhotoError(error);
      if (input.current) input.current.value = '';
      return;
    }
    try {
      setPhoto({ url: URL.createObjectURL(file), name: file.name, request });
    } catch {
      setPhotoError('A local preview is not available in this browser. You can still contact us without a photo.');
      if (input.current) input.current.value = '';
    }
  }

  function rejectPreview(message, request) {
    if (request !== selection.current) return;
    setPhoto(null);
    setPhotoError(message);
    if (input.current) input.current.value = '';
  }

  return <div className="kitchens-page">
    <header className="kitchens-intro">
      <nav aria-label="Breadcrumb" className="kitchens-breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Grama Kitchens</span></nav>
      <div className="kitchens-intro-grid"><div><p className="kitchens-label">GRAMA KITCHENS / CHICAGOLAND</p><h1>Custom cabinetry.<br /><em>Kitchen remodeling.</em></h1></div><div className="kitchens-intro-copy"><p>Plan the storage, layout and finishes around your space.</p><p>Tell us what you have and what you would like to change. We will discuss the scope, design direction and next steps with you.</p><a className="kitchens-link" href="#kitchen-concept">Discuss your kitchen <Arrow /></a></div></div>
    </header>

    <figure className="kitchens-hero"><img src="/assets/photo/lee-kitchen-living.webp" alt="Kitchen island and open living spaces in Grama’s completed 1906 Lee Street project" width="2000" height="1334" fetchPriority="high" /><figcaption><span>1906 Lee Street, Des Plaines · Completed project photography</span><a href="/projects/1906-lee-street">Explore the project <Arrow /></a></figcaption></figure>

    <section className="kitchens-scope" aria-labelledby="kitchens-scope-title"><div><h2 id="kitchens-scope-title">Choose the scope<br /><em>you need.</em></h2></div><div className="kitchens-services"><article><h3>Custom cabinetry.</h3><p>Discuss storage, layout, materials and finishes. Cabinetry is coordinated through an independent manufacturing partner; Grama does not own the factory.</p></article><article><h3>Complete kitchen remodeling.</h3><p>For a complete remodel, Grama coordinates the design, cabinetry and construction work included in your agreement. Responsibilities, allowances and exclusions belong in a clear written proposal.</p></article></div></section>

    <section className="kitchens-journey" aria-labelledby="kitchens-journey-title"><div className="kitchens-section-heading"><h2 id="kitchens-journey-title">How to begin.</h2></div><ol><li><h3>Discuss the room.</h3><p>A photo and a short conversation help explain your space and priorities.</p></li><li><h3>Explore the design.</h3><p>We confirm what the initial concept includes before design work begins. Concepts remain preliminary until dimensions and specifications are checked.</p></li><li><h3>Review the proposal.</h3><p>Agree measurements, selections, scope and pricing before a cabinetry or construction commitment.</p></li></ol></section>

    <section className="kitchens-concept" id="kitchen-concept" aria-labelledby="kitchen-concept-title"><div className="kitchens-concept-copy"><h2 id="kitchen-concept-title">Tell us about<br /><em>your kitchen.</em></h2><p>{officialIntake ? 'Continue to our kitchen enquiry form to describe your project. We will confirm the available design service and next steps.' : 'Request an initial kitchen concept. Tell us what you are considering; we will confirm the available design service and next steps.'}</p><p>A photo is optional at this stage. This page lets you preview one on your device before deciding what to share.</p><a className="kitchens-phone" href="tel:+17738499634">Call +1 773 849 9634 <Arrow /></a></div>
      <div className="kitchens-concept-panel">
        {!officialIntake && <>
        <label className="kitchens-field" htmlFor="kitchen-service">What are you considering?<select id="kitchen-service" value={service} onChange={event => setService(event.target.value)}>{services.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="kitchens-field" htmlFor="kitchen-notes">What would you like to change? <span>Optional</span><textarea id="kitchen-notes" rows="4" maxLength="1000" value={notes} onChange={event => setNotes(event.target.value)} placeholder="A better layout, more storage, a different finish…" /></label>
        </>}
        <div className="kitchens-photo-picker"><label className="kitchens-field" htmlFor="kitchen-photo">Preview a kitchen photo <span>Optional · on this device only</span></label><p id="kitchen-photo-help">JPEG or PNG, up to 8 MB. Your photo is previewed on this device only. It is not uploaded, saved by this website or attached to an email. Remove it to clear the preview.</p><input ref={input} id="kitchen-photo" type="file" accept="image/jpeg,image/png" aria-describedby={'kitchen-photo-help' + (photoError ? ' kitchen-photo-error' : '')} aria-invalid={photoError ? 'true' : undefined} onChange={selectPhoto} />
          {reading && <p role="status">Reading your photo on this device…</p>}
          {photoError && <p className="kitchens-photo-error" id="kitchen-photo-error" role="alert">{photoError}</p>}
          {photo && <figure className="kitchens-local-photo"><img src={photo.url} alt="Your selected kitchen photo, shown only on this device" onError={() => rejectPreview('This photo could not be displayed. Try another JPEG or PNG, or contact us without a photo.', photo.request)} onLoad={event => { if (event.currentTarget.naturalWidth * event.currentTarget.naturalHeight > KITCHEN_PHOTO_PIXEL_LIMIT) rejectPreview('This photo is too large to preview comfortably. Choose a smaller version or contact us without a photo.', photo.request); }} /><figcaption><span>{photo.name}</span><button type="button" onClick={removePhoto}>Remove photo</button></figcaption></figure>}
        </div>
        <div className="kitchens-handoff">{officialIntake ? <><a className="kitchens-action" href={officialIntake}>Open the kitchen enquiry form <Arrow /></a><p>Describe your project in the form hosted by Smartsheet. Your photo stays on this device.</p></> : businessEmail ? <><a className="kitchens-action" href={conceptEmail(service, notes)}>Request an initial concept by email <Arrow /></a><p>This opens your email app with a draft. Add a photo yourself if you wish, then review and send it. Nothing is sent by this page.</p><p className="kitchens-email-fallback">No email app? Write to <a href={'mailto:' + businessEmail}>{businessEmail}</a> or call us.</p></> : <><a className="kitchens-action" href="/contact">Contact Grama about your kitchen <Arrow /></a><p>Mention Grama Kitchens when you contact us. Your photo and notes are not transferred to Contact. You can also call the number shown here.</p></>}<p className="kitchens-concept-note">A photo or concept is a starting point. Final scope, pricing and timing require measurement, selections and a written agreement.</p></div>
      </div>
    </section>
  </div>;
}
