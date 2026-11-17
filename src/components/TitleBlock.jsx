// Design-system pieces from the November 2026 design specification.
// A title block states confirmed facts as short labelled cells, the way a
// drawing sheet does. Values come from existing project data; nothing here
// introduces prices, dates, approvals or availability.
import { lotData } from './SitePlan.jsx';
import { projects } from '../data/projects.js';
import { enquiryHref } from '../enquiry-context.js';

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.2" /></svg>;
}

export const completedProjectCount = projects.filter(project => project.status === 'completed').length;
export const plannedHomeCount = lotData.length;
const lotAreas = lotData.map(lot => lot.area);
const area = value => value.toLocaleString('en-US');
// Drawing-reported areas, exactly as transcribed in SitePlan.jsx.
export const lotAreaRange = area(Math.min(...lotAreas)) + ' to ' + area(Math.max(...lotAreas)) + ' sq ft';

export function TitleBlock({ items, label, className = '' }) {
  return <dl className={'ds-titleblock ' + className} aria-label={label} style={{ '--ds-cells': items.length }}>
    {items.map(item => <div key={item.label} className={item.href ? 'ds-titleblock-link' : undefined}>
      <dt>{item.label}</dt>
      <dd>{item.href ? <a href={item.href}>{item.value}<Arrow /></a> : item.value}{item.note && <small>{item.note}</small>}</dd>
    </div>)}
  </dl>;
}

export function DexterTitleBlock() {
  return <TitleBlock className="ds-titleblock--record" label="Dexter Acres project record" items={[
    { label: 'Location', value: 'Webster & Dexter Lanes, Des Plaines, Illinois' },
    { label: 'Scope', value: plannedHomeCount + ' planned homes' },
    { label: 'Lot areas', value: lotAreaRange, note: 'Reported on the supplied drawing' },
    { label: 'Status', value: 'Proposed development', note: 'Details subject to confirmation' },
  ]} />;
}

// Enquiry choices that carry only the topics the Contact page already allows.
export function DexterEnquiryCards() {
  const cards = [
    { title: 'A home or a lot at Dexter Acres.', action: 'Home enquiry', href: enquiryHref({ path: 'home', topic: 'Dexter Acres' }) },
    { title: 'Investing in or partnering on the project.', action: 'Partnership enquiry', href: enquiryHref({ path: 'development', topic: 'Investment partnership' }) },
    { title: 'Prefer to talk it through?', action: '+1 773 849 9634', href: 'tel:+17738499634' },
  ];
  return <div className="ds-enquiry">{cards.map(card => <a key={card.action} href={card.href}><strong>{card.title}</strong><span>{card.action}<Arrow /></span></a>)}</div>;
}
