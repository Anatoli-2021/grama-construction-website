import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { siteRoutes, notFoundRoute, normalizePath, previewOrigin } from '../src/site-routes.js';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const dist = resolve(root, 'dist');
const template = await readFile(resolve(dist, 'index.html'), 'utf8');
const origin = new URL(process.env.SITE_URL || previewOrigin);
assert.ok(['https:', 'http:'].includes(origin.protocol), 'SITE_URL must be an HTTP(S) origin');
assert.equal(new Set(siteRoutes.map(route => route.path)).size, siteRoutes.length, 'Public routes must be unique');
assert.equal(new Set(siteRoutes.map(route => route.title)).size, siteRoutes.length, 'Page titles must be unique');
assert.equal(new Set(siteRoutes.map(route => route.description)).size, siteRoutes.length, 'Page descriptions must be unique');

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
function renderDocument(route, markup) {
  const canonical = new URL(route.path, origin.origin).href;
  const image = route.image || 'residence.webp';
  const imageUrl = new URL(/^(?:https?:\/\/|\/)/.test(image) ? image : '/assets/' + image, origin.origin).href;
  let html = template
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, () => '<title>' + escapeHtml(route.title) + '</title>')
    .replace(/\s*<meta\b(?=[^>]*\bname\s*=\s*["'](?:description|twitter:[^"']*)["'])[^>]*>/gi, '')
    .replace(/\s*<meta\b(?=[^>]*\bproperty\s*=\s*["']og:[^"']*["'])[^>]*>/gi, '')
    .replace(/\s*<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/gi, '');
  // The concept hero belongs to the homepage. Other documents let their actual
  // above-the-fold images (and React's resource hints) drive image loading.
  if (route.path !== '/') html = html.replace(/\s*<link\b(?=[^>]*\brel\s*=\s*["']preload["'])(?=[^>]*\bas\s*=\s*["']image["'])[^>]*>/gi, '');
  const metadata = [
    `<meta name="description" content="${escapeHtml(route.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
  ].join('\n    ');
  assert.match(html, /<\/head>/i, 'Built template must have a head');
  html = html.replace(/<\/head>/i, () => '    ' + metadata + '\n  </head>');
  const outlet = /<div\s+id=(["'])root\1\s*><\/div>/;
  assert.match(html, outlet, 'Built template must have an empty React root');
  assert.match(markup, /<h1(?:\s|>)/, 'Every page must contain its heading before JavaScript runs');
  return html.replace(outlet, () => '<div id="root">' + markup + '</div>');
}

// Vite transforms JSX and CSS for the Node render without starting a public
// server. Only the resulting static HTML is added to the website artifact.
const vite = await createServer({
  root,
  appType: 'custom',
  logLevel: 'warn',
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});
try {
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
  for (const route of [...siteRoutes, notFoundRoute]) {
    assert.equal(normalizePath(route.path), route.path, 'Routes must use normalized public paths');
    const destination = route === notFoundRoute
      ? resolve(dist, '404.html')
      : resolve(dist, route.path === '/' ? 'index.html' : '.' + route.path + '/index.html');
    assert.ok(destination.startsWith(dist + sep), 'Generated page must stay inside dist');
    const markup = renderToString(createElement(App, { initialPath: route.path }));
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, renderDocument(route, markup));
  }
  console.log(`Prerendered ${siteRoutes.length} public pages and a separate 404 page.`);
} finally {
  await vite.close();
}
