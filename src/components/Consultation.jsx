import { useEffect, useRef, useState } from 'react';
import { lotData } from './SitePlan.jsx';
import './Consultation.css';

const topics = { home: ['Dexter Acres', 'Custom home'], development: ['Landowner opportunity', 'Investment partnership', 'Development partnership'] };
const blank = { name: '', email: '', phone: '', location: '', timing: '', details: '', consent: false, website: '' };
function Arrow() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.3" /></svg>; }

export default function Consultation({ request, motion }) {
  const [path, setPath] = useState('home');
  const [topic, setTopic] = useState('Dexter Acres');
  const [lot, setLot] = useState('');
  const [values, setValues] = useState(blank);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const firstInput = useRef(null);
  const tabs = useRef([]);
  useEffect(() => {
    if (!request) return;
    setPath(request.path || 'home');
    setTopic(request.topic || topics[request.path || 'home'][0]);
    setLot(request.lot || '');
    setStatus({ state: 'idle', message: '' });
    const timer = window.setTimeout(() => firstInput.current?.focus({ preventScroll: true }), motion ? 700 : 0);
    return () => clearTimeout(timer);
  }, [request]);
  function choose(next) { setPath(next); setTopic(topics[next][0]); setLot(''); setStatus({ state: 'idle', message: '' }); }
  function tabKey(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
    choose(next === 0 ? 'home' : 'development');
    tabs.current[next]?.focus();
  }
  function change(event) { setValues(current => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    setStatus({ state: 'sending', message: '' });
    try {
      const response = await fetch('/api/interest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, path, interest: topic, lot: path === 'home' && topic === 'Dexter Acres' ? lot : '' }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      setStatus({ state: 'success', message: 'Your enquiry has been saved on this computer for Tony’s review. This private preview does not send email.' });
      setValues(blank);
      setLot('');
    } catch (error) { setStatus({ state: 'error', message: error.message }); }
  }
  const isHome = path === 'home';
  return <section className="consultation section-pad" id="interest" data-chapter="08" aria-labelledby="consultation-title">
    <div className="consultation-heading"><p className="eyebrow">05 / A PRIVATE CONSULTATION</p><h2 className="display" id="consultation-title">Every possibility begins<br /><em>with a conversation.</em></h2><p>A home you want to build. Land you see differently. A development worth exploring. Tell us where you would like to begin.</p></div>
    <div className="consultation-layout">
      <div className="consultation-paths" role="tablist" aria-label="Choose your consultation">
        {[['home', '01', 'Build your custom home', 'For future homeowners and Dexter Acres buyers.'], ['development', '02', 'Develop with Grama', 'For landowners, investors and development partners.']].map(([key, number, title, copy], index) => <button ref={element => { tabs.current[index] = element; }} key={key} id={'consultation-tab-' + key} role="tab" aria-controls="consultation-panel" aria-selected={path === key} tabIndex={path === key ? 0 : -1} onClick={() => choose(key)} onKeyDown={event => tabKey(event, index)}><span className="path-index">{number}</span><span><strong>{title}</strong><span>{copy}</span></span><Arrow /></button>)}
        <div className="consultation-direct"><span className="eyebrow">PREFER A CONVERSATION?</span><a href="tel:+17738499634">+1 773 849 9634 <Arrow /></a><p>Chicago & the surrounding Illinois suburbs.</p></div>
      </div>
      <div className="consultation-panel" id="consultation-panel" role="tabpanel" aria-labelledby={'consultation-tab-' + path}>
        <div className="consultation-form-title"><span className="eyebrow">{isHome ? 'YOUR HOME' : 'YOUR OPPORTUNITY'}</span><h3>{isHome ? 'Make room for your vision.' : 'Let’s consider the possibilities.'}</h3></div>
        {status.state === 'success' ? <div className="consultation-success" role="status"><span>✓</span><h4>A conversation started.</h4><p>{status.message}</p><button className="text-link" onClick={() => setStatus({ state: 'idle', message: '' })}>Begin another enquiry <Arrow /></button></div> : <form onSubmit={submit}>
          <div className="consultation-fields"><label className="form-field">Your name<input ref={firstInput} name="name" value={values.name} onChange={change} required minLength={2} maxLength={100} autoComplete="name" placeholder="Full name" /></label><label className="form-field">Email address<input name="email" value={values.email} onChange={change} type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" /></label></div>
          <div className="consultation-fields"><label className="form-field">Phone <span>(optional)</span><input name="phone" value={values.phone} onChange={change} type="tel" maxLength={60} autoComplete="tel" placeholder="Phone number" /></label><label className="form-field">{isHome ? 'I’m interested in' : 'Type of opportunity'}<select name="interest" value={topic} onChange={event => setTopic(event.target.value)} required>{topics[path].map(item => <option key={item}>{item}</option>)}</select></label></div>
          <div className="consultation-fields">{isHome && topic === 'Dexter Acres' ? <label className="form-field">Lot of interest <span>(optional)</span><select name="lot" value={lot} onChange={event => setLot(event.target.value)}><option value="">Let’s explore</option>{lotData.map(item => <option key={item.id} value={item.id}>Lot {item.id}</option>)}</select></label> : <label className="form-field">Project location <span>(optional)</span><input name="location" value={values.location} onChange={change} maxLength={200} placeholder="City or property location" /></label>}<label className="form-field">Your timeframe <span>(optional)</span><select name="timing" value={values.timing} onChange={change}><option value="">Still exploring</option><option>Within 6 months</option><option>6–12 months</option><option>More than a year</option></select></label></div>
          <label className="form-field consultation-details">{isHome ? 'Tell us about your home' : 'Tell us about the opportunity'} <span>(optional)</span><textarea name="details" value={values.details} onChange={change} maxLength={2000} rows={3} placeholder={isHome ? 'Your priorities, a site you have in mind, or what draws you to Dexter Acres…' : 'The land, development idea, or partnership you would like to discuss…'} /></label>
          <label className="honeypot" aria-hidden="true">Website<input name="website" value={values.website} onChange={change} tabIndex={-1} autoComplete="off" /></label>
          <label className="consent"><input name="consent" checked={values.consent} onChange={change} type="checkbox" required /><span>Grama Construction may contact me about this enquiry.</span></label>
          <button className="button button-dark" type="submit" disabled={status.state === 'sending'}>{status.state === 'sending' ? 'Saving your enquiry…' : 'Request a private consultation'}<Arrow /></button>
          {status.state === 'error' && <p className="form-error" role="alert">{status.message}</p>}
          <p className="form-preview-note">Private local preview. Enquiries stay on this computer; no email or CRM submission is sent.</p>
        </form>}
      </div>
    </div>
  </section>;
}
