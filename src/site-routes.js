import { projects } from './data/projects.js';

export const previewOrigin = 'https://grama-construction-website-production.up.railway.app';
export const siteRoutes = [
  { path: '/', title: 'Grama Construction — Luxury Custom Homes & Residential Development', description: 'A family construction business serving Chicago and Chicagoland. Explore completed homes, development partnerships and the proposed Dexter Acres neighborhood.', image: 'residence.webp', type: 'home' },
  { path: '/about', title: 'About Grama Construction — Tony, Alina & the Company', description: 'Meet Anatoli (Tony) Grama and Alina, the family behind Grama Construction. Luxury custom homes, renovation and residential development in Chicago and the Illinois suburbs.', image: 'tony-grama.webp', type: 'about' },
  { path: '/projects', title: 'Projects — Grama Construction', description: 'Explore eight completed Grama portfolio projects and the proposed Dexter Acres development. View individual cases, authentic photographs and project details.', image: 'portfolio-prospect.webp', type: 'projects' },
  { path: '/partnerships', title: 'Development Partnerships — Grama Construction', description: 'Discuss residential development with Grama Construction. Information for investors, developers and landowners, from site review through construction and delivery.', image: 'portfolio-dexter.webp', type: 'partnerships' },
  { path: '/contact', title: 'Contact Grama Construction — Discuss Your Project', description: 'Speak with Grama about a development partnership, a custom home or Dexter Acres. Call +1 773 849 9634 or review an enquiry draft on this website preview.', image: 'portfolio-lee.webp', type: 'contact' },
  { path: '/projects/dexter-acres', title: 'Dexter Acres — Proposed 14-Home Development | Grama Construction', description: 'Explore the Dexter Acres architectural concept and interactive fourteen-lot plan at Webster and Dexter Lanes in Des Plaines, Illinois. Proposed development; details subject to confirmation.', image: 'community.webp', type: 'dexter' },
  ...projects.map(project => ({ path: '/projects/' + project.slug, title: project.name + ' — Completed Project | Grama Construction', description: project.summary, image: project.image, type: 'project', project })),
];
export const notFoundRoute = { path: '/404', title: 'Page Not Found — Grama Construction', description: 'This page could not be found. Explore Grama Construction projects, company information and contact options.', type: 'not-found' };

export function normalizePath(value = '/') {
  if (typeof value !== 'string') return '/404';
  let path;
  try { path = decodeURIComponent(value.split(/[?#]/)[0]); } catch { return '/404'; }
  if (!path.startsWith('/') || /[\\\0]/.test(path) || path.split('/').some(part => part.startsWith('.'))) return '/404';
  path = path.replace(/\/index\.html$/, '/');
  return path === '/' ? '/' : path.replace(/\/+$/, '');
}
export function getRoute(path) { return siteRoutes.find(route => route.path === normalizePath(path)); }
