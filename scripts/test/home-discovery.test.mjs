import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { siteRoutes, previewOrigin } from '../../src/site-routes.js';

test('homepage uses completed-project photography consistently without an autoplay hero film', async () => {
  const html = await readFile('dist/index.html', 'utf8');
  assert.match(html, /1847 Dexter Lane/);
  assert.match(html, /src="\/assets\/portfolio-dexter\.webp"/);
  assert.ok(!html.includes('srcset="/assets/portfolio-1914-entry.webp"'), 'The same credited project must be shown on mobile');
  assert.ok(!/<video\b/.test(html), 'The homepage introduction must not require the concept film');
  assert.ok(html.includes('href="/partnerships"'));
  assert.ok(html.includes('/contact?path=home&amp;topic=Custom+home'));
  assert.ok(html.includes('href="/projects/dexter-acres"'));
  for (const route of siteRoutes.filter(route => route.type === 'project')) {
    assert.ok(html.includes(`href="${route.path}"`), 'Completed work must link to its real case: ' + route.path);
  }
});

test('discovery metadata describes the current brand and omits unverified commercial claims', async () => {
  const html = await readFile('dist/index.html', 'utf8');
  const data = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  const business = data.find(item => item['@type'] === 'HomeAndConstructionBusiness');
  assert.equal(business?.name, 'Grama Construction');
  assert.equal(business?.telephone, '+1-773-849-9634');
  assert.ok(business.image.endsWith('/assets/portfolio-dexter.webp'));
  for (const key of ['legalName', 'address', 'aggregateRating', 'review', 'priceRange', 'makesOffer']) {
    assert.equal(business[key], undefined, key + ' needs separate verified information');
  }
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  const head = html.slice(0, html.indexOf('</head>'));
  assert.match(head, /general-sans\.ttf/);
  assert.ok(!head.includes('portfolio-1914-entry.webp'));
  assert.ok(!head.includes('general-sans.woff2'), 'Use the existing font, without introducing an unverified converted copy');
});

test('review sitemap lists exactly public pages and crawler rules keep the review target blocked', async () => {
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(urls, siteRoutes.map(route => new URL(route.path, process.env.SITE_URL || previewOrigin).href));
  assert.ok(!/presentation|\/api\/|access_code|token=/.test(sitemap));
  const robots = await readFile('dist/robots.txt', 'utf8');
  assert.match(robots, /^User-agent: \*\nDisallow: \/\n/);
  assert.ok(!robots.includes('Allow:'));
});
