import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './presentation.css';

async function request(path, body) {
  const response = await fetch('/presentation/api/' + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' } : { credentials: 'same-origin', cache: 'no-store' });
  let result;
  try { result = await response.json(); } catch { throw new Error('The private presentation is being prepared. Please contact Grama.'); }
  if (!response.ok) throw new Error(result.error || 'Unable to load this presentation.');
  return result;
}

function Presentation() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const deckRoot = useRef(null);

  useEffect(() => {
    let active = true;
    request('deck').then(data => { if (active) setSession(data); }).catch(() => {}).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!session) return undefined;
    let timer;
    const refresh = () => request('deck').then(setSession).catch(() => { setSession(null); setError('Your private session has ended. Please sign in again.'); });
    timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    const handleVisibility = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', handleVisibility); };
  }, [Boolean(session)]);

  useEffect(() => {
    if (!session || !deckRoot.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
    deckRoot.current.querySelectorAll('.deck-reveal').forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [session]);

  async function login(event) {
    event.preventDefault(); setError(''); setBusy(true);
    const input = Object.fromEntries(new FormData(event.currentTarget));
    try { await request('login', input); setSession(await request('deck')); window.scrollTo({ top: 0, behavior: 'instant' }); }
    catch (problem) { setError(problem.message); }
    finally { setBusy(false); }
  }
  async function logout() {
    try { await request('logout', {}); setSession(null); setError(''); }
    catch { setError('Unable to sign out. Please try again.'); }
  }

  if (!session) return <main className="access-page">
    <a className="presentation-brand" href="/" aria-label="Grama Construction home"><img src="/assets/logo-dark.png" alt="Grama Construction" /></a>
    <div className="access-layout">
      <div className="access-image"><img src="/assets/portfolio-dexter.webp" alt="Completed Grama residence and garden terrace" /><span>Grama Construction · Des Plaines</span></div>
      <section className="access-form"><p className="deck-label">By individual invitation</p><h1>A closer look<br />at what’s next.</h1><p>Private project presentations for Grama’s investment partners. Use the access details issued to you.</p>
        <form onSubmit={login}>
          <label>Email address<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
          <label>Private access code<input name="code" type="password" autoComplete="current-password" required minLength={12} maxLength={200} /></label>
          <button className="deck-button" disabled={checking || busy}>{checking ? 'Checking access…' : busy ? 'Opening presentation…' : 'Open my presentation'}<span aria-hidden="true">↗</span></button>
          <p className="access-error" role="alert">{error}</p>
        </form>
        <p className="access-help">For an invitation, <a href="tel:+17738499634">speak with Tony Grama</a>.</p>
      </section>
    </div>
  </main>;

  const deck = session.deck;
  const financial = deck.financial;
  return <div className="investor-deck" ref={deckRoot}>
    <header className="deck-header"><a className="presentation-brand" href="/"><img src="/assets/logo-dark.png" alt="Grama Construction" /></a><span>Prepared for {session.preparedFor}</span><button onClick={logout}>Sign out</button></header>
    <main>
      <section className="deck-cover"><div className="deck-cover-copy"><p className="deck-label">Private presentation · {deck.dateLabel}</p><h1>{deck.title}</h1><p>{deck.introduction}</p><a className="deck-text-link" href="#investment-approach">Explore the proposal <span aria-hidden="true">↓</span></a></div><img src="/assets/portfolio-prospect-interior.webp" alt="Interior detail of a completed Grama residence" /></section>
      <section className="deck-section deck-intro deck-reveal" id="investment-approach"><p className="deck-label">Your development partner</p><h2>{deck.approachTitle}</h2><p className="deck-lead">{deck.approach}</p><div className="deck-principles">{deck.principles?.map((item,index)=><article key={item.title}><span>0{index+1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
      <section className="deck-section deck-proof deck-reveal"><div className="deck-section-heading"><div><p className="deck-label">Completed work</p><h2>Experience you can see.</h2></div><p>{deck.portfolioNote}</p></div><div className="deck-projects">{deck.projects?.map(project=><article key={project.name}><img src={project.image?.startsWith('/assets/') ? project.image : '/assets/portfolio-prospect.webp'} alt={project.alt || project.name} loading="lazy" /><p>{project.location}</p><h3>{project.name}</h3><div>{project.description}</div></article>)}</div></section>
      <section className="deck-community deck-reveal"><img src="/assets/community.webp" alt="Illustrative fourteen-home Dexter Acres architectural concept" loading="lazy" /><div><p className="deck-label">The larger vision</p><h2>Dexter Acres.<br />14 planned homes.</h2><p>{deck.community}</p><small>Architectural concept. Scope, phasing and approvals follow the project’s current documents.</small></div></section>
      {financial && <section className="deck-section deck-financial deck-reveal" id="project-numbers"><p className="deck-label">{financial.project} · {financial.currency}</p><h2>{financial.title}</h2><p className="deck-lead">{financial.basis}</p><div className="deck-financial-source">{financial.sourceLabel}</div><div className="deck-metrics">{financial.metrics?.map(metric=><article key={metric.label}><p>{metric.label}</p><strong>{metric.display}</strong><small>{metric.status}</small></article>)}</div><div className="deck-economics"><div><h3>Project screening model</h3><table><tbody>{financial.lines?.map(line=><tr key={line.label}><th scope="row">{line.label}</th><td>{line.display}</td></tr>)}</tbody></table></div><aside><h3>What the model still needs</h3><ul>{financial.openItems?.map(item=><li key={item}>{item}</li>)}</ul></aside></div><p className="deck-model-note">{financial.limitation}</p></section>}
      <section className="deck-section deck-plan deck-reveal"><p className="deck-label">The proposed working relationship</p><h2>{deck.partnershipTitle}</h2><p className="deck-lead">{deck.partnershipNote}</p><ol>{deck.steps?.map(step=><li key={step.title}><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol></section>
      <section className="deck-section deck-next deck-reveal"><p className="deck-label">The next conversation</p><h2>{deck.nextTitle}</h2><p>{deck.nextBody}</p><a className="deck-button" href="tel:+17738499634">Speak with Tony <span aria-hidden="true">↗</span></a><small>{deck.disclosure}</small></section>
    </main><footer className="deck-footer"><span>Grama Construction</span><span>Private · Prepared for {session.preparedFor}</span><button onClick={()=>window.print()}>Print presentation</button></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<Presentation />);
