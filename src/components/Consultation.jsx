import { useEffect, useRef, useState } from 'react';
import { lotData } from './SitePlan.jsx';
import './Consultation.css';
import { isLocalPreview } from '../preview-mode.js';
import { checkContactDelivery, contactPayload, createSubmissionSession, sendContactSubmission } from '../contact-submission.js';

const topics = { home: ['Dexter Acres', 'Custom home'], development: ['Landowner opportunity', 'Investment partnership', 'Development partnership'] };
const paths = [
  ['development', '01', 'Development partnerships', 'For investors, developers and landowners.'],
  ['home', '02', 'Build a home', 'For custom homes and Dexter Acres enquiries.'],
];
const blank = { name: '', email: '', phone: '', location: '', timing: '', details: '', consent: false, website: '' };
function Arrow() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.3" /></svg>; }

export default function Consultation({ request, motion }) {
  const [interactive, setInteractive] = useState(false);
  const [path, setPath] = useState('development');
  const [topic, setTopic] = useState('Development partnership');
  const [lot, setLot] = useState('');
  const [values, setValues] = useState(blank);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [delivery, setDelivery] = useState({ state: 'checking', confirmed: false });
  const [readinessAttempt, setReadinessAttempt] = useState(0);
  const [draftOnly, setDraftOnly] = useState(false);
  const firstInput = useRef(null);
  const panel = useRef(null);
  const outcome = useRef(null);
  const errorMessage = useRef(null);
  const tabs = useRef([]);
  const inFlight = useRef(false);
  const submission = useRef(null);
  if (!submission.current) submission.current = createSubmissionSession();

  useEffect(() => {
    setInteractive(true);
    if (isLocalPreview) return undefined;
    let active = true;
    setDelivery({ state: 'checking', confirmed: false });
    checkContactDelivery().then(result => {
      if (active) setDelivery({ state: result.enabled ? 'enabled' : 'unavailable', confirmed: result.confirmed });
    });
    return () => { active = false; };
  }, [readinessAttempt]);

  useEffect(() => {
    if (!request || inFlight.current) return;
    submission.current.invalidate();
    setPath(request.path || 'development');
    setTopic(request.topic || topics[request.path || 'development'][0]);
    setLot(request.lot || '');
    setStatus({ state: 'idle', message: '' });
    const timer = window.setTimeout(() => (firstInput.current || panel.current)?.focus({ preventScroll: true }), motion ? 700 : 0);
    return () => clearTimeout(timer);
  }, [request]);

  useEffect(() => {
    if (!['draft', 'success', 'error'].includes(status.state)) return undefined;
    if (status.state === 'success') inFlight.current = false;
    const frame = requestAnimationFrame(() => {
      const target = status.state === 'error' ? errorMessage.current : outcome.current;
      target?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [status]);

  function edited() {
    submission.current.invalidate();
    setStatus({ state: 'idle', message: '' });
  }
  function choose(nextPath) {
    if (inFlight.current) return;
    edited();
    setPath(nextPath);
    setTopic(topics[nextPath][0]);
    setLot('');
  }
  function tabKey(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
    choose(paths[nextIndex][0]);
    tabs.current[nextIndex]?.focus();
  }
  function change(event) {
    const { name, type, checked, value } = event.target;
    edited();
    setValues(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }
  function focusFirstInput() {
    requestAnimationFrame(() => firstInput.current?.focus({ preventScroll: true }));
  }
  function changeMode(useDraft) {
    if (inFlight.current) return;
    setDraftOnly(useDraft);
    setStatus({ state: 'idle', message: '' });
    focusFirstInput();
  }
  function beginAnother() {
    inFlight.current = false;
    submission.current.invalidate();
    setValues(blank);
    setLot('');
    setStatus({ state: 'idle', message: '' });
    focusFirstInput();
  }

  const liveEnabled = !isLocalPreview && delivery.state === 'enabled' && !draftOnly;
  const sending = status.state === 'sending';
  const fieldsEnabled = interactive && (isLocalPreview || liveEnabled || draftOnly) && !sending;
  const isHome = path === 'home';

  async function submit(event) {
    event.preventDefault();
    if (!interactive || inFlight.current) return;
    if (!isLocalPreview && !liveEnabled) {
      if (draftOnly) setStatus({ state: 'draft', message: '' });
      else setStatus({ state: 'error', message: 'Online delivery is not available. Call Groma Development or prepare a browser-only draft.' });
      return;
    }
    if (!values.consent) {
      setStatus({ state: 'error', message: isLocalPreview ? 'Please confirm the local-save notice.' : 'Please confirm that Groma Development may contact you about this enquiry.' });
      return;
    }
    const payload = contactPayload(values, { path, topic, lot });
    inFlight.current = true;
    setStatus({ state: 'sending', message: '' });
    let accepted = false;
    try {
      if (isLocalPreview) {
        const response = await fetch('/api/interest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'The enquiry could not be saved locally. Please try again.');
        setStatus({ state: 'success', kind: 'local', message: 'Your enquiry has been saved on this computer for Tony’s review. This local preview does not send email.' });
      } else {
        const prepared = submission.current.prepare(payload);
        const reference = await sendContactSubmission(prepared);
        setStatus({ state: 'success', kind: 'live', reference, message: 'Your enquiry was accepted for delivery to Groma Development. Keep the reference below when you follow up.' });
      }
      accepted = true;
      setValues(blank);
      setLot('');
    } catch (error) {
      setStatus({ state: 'error', message: error.message || 'Acceptance could not be confirmed. Your details are still here; retry or call Groma Development.' });
    } finally {
      // Release successful requests after their success screen has committed.
      if (!accepted) inFlight.current = false;
    }
  }

  return <section className="consultation section-pad" id="interest" data-chapter="08" aria-labelledby="consultation-title">
    <div className="consultation-heading"><p className="eyebrow">CONTACT GROMA DEVELOPMENT</p><h2 className="display" id="consultation-title">Discuss your project.<br /><em>Speak with Groma Development.</em></h2><p>Have a site, a development proposal or a partnership in mind? Tell us what you would like to discuss. Custom-home enquiries are welcome too.</p></div>
    <div className="consultation-layout">
      <div className="consultation-paths" role="tablist" aria-label="Choose your consultation">
        {paths.map(([key, number, title, copy], index) => <button type="button" ref={element => { tabs.current[index] = element; }} key={key} id={'consultation-tab-' + key} role="tab" aria-controls="consultation-panel" aria-selected={path === key} tabIndex={path === key ? 0 : -1} disabled={sending} onClick={() => choose(key)} onKeyDown={event => tabKey(event, index)}><span className="path-index">{number}</span><span><strong>{title}</strong><span>{copy}</span></span><Arrow /></button>)}
        <div className="consultation-direct"><span className="eyebrow">PREFER A CONVERSATION?</span><a href="tel:+17738499634">+1 773 849 9634 <Arrow /></a><p>Chicago & the surrounding Illinois suburbs.</p></div>
      </div>
      <div ref={panel} className="consultation-panel" id="consultation-panel" role="tabpanel" aria-labelledby={'consultation-tab-' + path} tabIndex={-1}>
        <div className="consultation-form-title"><span className="eyebrow">{isHome ? 'YOUR HOME' : 'YOUR OPPORTUNITY'}</span><h3>{isHome ? 'Tell us about your home.' : 'Tell us about the opportunity.'}</h3></div>
        {!isLocalPreview && status.state !== 'success' && <div className="contact-delivery-notice">
          <p role="status">{draftOnly ? 'Browser-only draft: nothing entered here is sent or saved to a server.' : delivery.state === 'checking' ? 'Checking online enquiry delivery…' : delivery.state === 'enabled' ? 'Online enquiries are available. Submit your project details for Groma Development to follow up.' : delivery.confirmed ? 'Online enquiry delivery is not connected. Call Groma Development or prepare a browser-only draft.' : 'Online delivery could not be confirmed. Call Groma Development, try again, or prepare a browser-only draft.'}</p>
          <a href="tel:+17738499634">Call +1 773 849 9634</a>
          <div className="contact-delivery-actions">
            {delivery.state !== 'enabled' && <button type="button" disabled={delivery.state === 'checking' || sending} onClick={() => setReadinessAttempt(current => current + 1)}>{delivery.state === 'checking' ? 'Checking delivery…' : 'Check delivery again'}</button>}
            {!draftOnly && delivery.state === 'unavailable' && <button type="button" onClick={() => changeMode(true)}>Prepare a browser-only draft</button>}
            {draftOnly && delivery.state === 'enabled' && <button type="button" onClick={() => changeMode(false)}>Use online submission</button>}
          </div>
        </div>}
        {status.state === 'draft' ? <div ref={outcome} className="enquiry-draft" tabIndex={-1} role="region" aria-labelledby="enquiry-result-title"><p className="eyebrow">DRAFT ONLY — NOT SENT</p><h4 id="enquiry-result-title">Your enquiry draft</h4><p>This draft stays in this browser. It has not been submitted. Call Groma Development to discuss your project.</p><dl><div><dt>Name</dt><dd>{values.name}</dd></div><div><dt>Email</dt><dd>{values.email}</dd></div>{values.phone && <div><dt>Phone</dt><dd>{values.phone}</dd></div>}<div><dt>Topic</dt><dd>{topic}{isHome && topic === 'Dexter Acres' && lot ? ' · Lot ' + lot : ''}</dd></div>{values.location && <div><dt>Location</dt><dd>{values.location}</dd></div>}{values.timing && <div><dt>Timeframe</dt><dd>{values.timing}</dd></div>}{values.details && <div><dt>Details</dt><dd>{values.details}</dd></div>}</dl><a className="button button-dark" href="tel:+17738499634">Call +1 773 849 9634 <Arrow /></a><button type="button" className="text-link" onClick={() => { setStatus({ state: 'idle', message: '' }); focusFirstInput(); }}>Edit this draft <Arrow /></button></div>
          : status.state === 'success' ? <div ref={outcome} className="consultation-success" tabIndex={-1} role="region" aria-labelledby="enquiry-result-title"><span aria-hidden="true">✓</span><h4 id="enquiry-result-title">{status.kind === 'live' ? 'Enquiry submitted.' : 'Enquiry saved locally.'}</h4><p role="status">{status.message}</p>{status.reference && <p className="enquiry-reference">Reference: <strong>{status.reference}</strong></p>}<button type="button" className="text-link" onClick={beginAnother}>Begin another enquiry <Arrow /></button></div>
            : <form onSubmit={submit} aria-busy={sending}>
              <noscript><p className="form-preview-note">Enable JavaScript to use the enquiry form, or call +1 773 849 9634.</p></noscript>
              <fieldset className="enquiry-fields" disabled={!fieldsEnabled}>
                {liveEnabled && <p className="form-preview-note contact-privacy-note">Groma Development will use the contact details below to respond about this enquiry. No automatic confirmation email is sent.</p>}
                <div className="consultation-fields"><label className="form-field">Your name<input ref={firstInput} name="name" value={values.name} onChange={change} required minLength={2} maxLength={100} autoComplete="name" placeholder="Full name" /></label><label className="form-field">Email address<input name="email" value={values.email} onChange={change} type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" /></label></div>
                <div className="consultation-fields"><label className="form-field">Phone <span>(optional)</span><input name="phone" value={values.phone} onChange={change} type="tel" maxLength={60} autoComplete="tel" placeholder="Phone number" /></label><label className="form-field">{isHome ? 'I’m interested in' : 'Type of opportunity'}<select name="interest" value={topic} onChange={event => { edited(); setTopic(event.target.value); setLot(''); }} required>{topics[path].map(item => <option key={item}>{item}</option>)}</select></label></div>
                <div className="consultation-fields">{isHome && topic === 'Dexter Acres' ? <label className="form-field">Lot of interest <span>(optional)</span><select name="lot" value={lot} onChange={event => { edited(); setLot(event.target.value); }}><option value="">Let’s explore</option>{lotData.map(item => <option key={item.id} value={item.id}>Lot {item.id}</option>)}</select></label> : <label className="form-field">Project location <span>(optional)</span><input name="location" value={values.location} onChange={change} maxLength={200} placeholder="City or property location" /></label>}<label className="form-field">Your timeframe <span>(optional)</span><select name="timing" value={values.timing} onChange={change}><option value="">Still exploring</option><option>Within 6 months</option><option>6–12 months</option><option>More than a year</option></select></label></div>
                <label className="form-field consultation-details">{isHome ? 'Tell us about your home' : 'Tell us about the opportunity'} <span>(optional)</span><textarea name="details" value={values.details} onChange={change} maxLength={2000} rows={3} placeholder={isHome ? 'Your priorities, a site you have in mind, or what draws you to Dexter Acres…' : 'The land, development idea, or partnership you would like to discuss…'} /></label>
                <label className="honeypot" aria-hidden="true">Website<input name="website" value={values.website} onChange={change} tabIndex={-1} autoComplete="off" /></label>
                {(isLocalPreview || liveEnabled) && <label className="consent"><input name="consent" checked={values.consent} onChange={change} type="checkbox" required /><span>{isLocalPreview ? 'I understand this preview saves the enquiry only on this computer.' : 'Groma Development may contact me about this enquiry.'}</span></label>}
                <button className="button button-dark" type="submit" disabled={!fieldsEnabled}>{sending ? isLocalPreview ? 'Saving your enquiry…' : 'Submitting your enquiry…' : isLocalPreview ? 'Save enquiry locally' : liveEnabled ? 'Submit enquiry to Groma Development' : draftOnly ? 'Review enquiry draft' : 'Online delivery unavailable'}<Arrow /></button>
                <p className="form-preview-note">{isLocalPreview ? 'Local preview. No email or CRM submission is sent.' : liveEnabled ? 'Submission is accepted for delivery; it does not reserve a property.' : draftOnly ? 'Draft only. This form does not submit an enquiry or reserve a property.' : 'Online submission is disabled until delivery is confirmed. You can call Groma Development instead.'}</p>
              </fieldset>
              {status.state === 'error' && <p ref={errorMessage} className="form-error" role="alert" tabIndex={-1}>{status.message}</p>}
            </form>}
      </div>
    </div>
  </section>;
}
