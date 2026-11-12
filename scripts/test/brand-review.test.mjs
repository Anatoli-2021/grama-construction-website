import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { siteRoutes, previewOrigin } from '../../src/site-routes.js';

const dist = new URL('../../dist/', import.meta.url);
const origin = new URL(process.env.SITE_URL || previewOrigin).origin;
const logos = ['grama-development-a.svg', 'grama-monogram-b.svg', 'grama-group-c.svg', 'grama-monogram-symbol.svg', 'grama-wordmark-a.svg'];
const expectedPaths = [
  '/', '/brand-review', '/about', '/projects', '/partnerships', '/contact',
  '/projects/dexter-acres', '/projects/1847-dexter-lane', '/projects/1906-lee-street',
  '/projects/1171-prospect-lane', '/projects/chicago-avondale', '/projects/burr-ridge',
  '/projects/south-barrington', '/projects/foster-avenue', '/projects/sedgwick-street',
];
const plain = value => value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&(?:amp|quot|#39|lt|gt);/g, ' ').replace(/\s+/g, ' ').trim();

test('identity review is a real prerendered, unindexed concept page with distinct metadata', async () => {
  const html = await readFile(new URL('brand-review/index.html', dist), 'utf8');
  assert.match(html, /SPELLING CONFIRMED: Grama Development/);
  const route = siteRoutes.find(route => route.path === '/brand-review');
  assert.ok(route, 'Register the public feature-review route');
  assert.equal(route.type, 'brand-review');
  assert.equal(route.title, 'GRAMA Development — Identity Review');
  assert.ok(html.includes('<title>' + route.title + '</title>'));
  assert.ok(html.includes('<meta name="description" content="' + route.description + '"'));
  assert.ok(html.includes('rel="canonical" href="' + origin + '/brand-review"'));
  assert.ok(html.includes('property="og:url" content="' + origin + '/brand-review"'));
  assert.ok(html.includes('property="og:image" content="' + origin + '/assets/portfolio-dexter.webp"'));
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(headings.length, 1);
  assert.ok(plain(headings[0][1]).length > 10, 'Review content must exist before JavaScript');
  for (const file of logos.slice(0, 3)) assert.ok(html.includes('/assets/brand/' + file), 'The original concept SVG must be downloadable: ' + file);
});

test('review copy labels the proposal and its applications without legal or investment promises', async () => {
  const html = await readFile(new URL('brand-review/index.html', dist), 'utf8');
  const text = plain(html);
  assert.match(text, /SPELLING CONFIRMED: Grama Development/i);
  assert.match(text, /Design and production release await Tony[’']s approval/i);
  assert.match(text, /Grama Construction remains the current public brand/i);
  assert.match(text, /legal-name changes are not authorized/i);
  assert.match(text, /professional trademark review remain[s]? pending/i);
  assert.match(text, /does not establish legal clearance/i);
  assert.match(text, /approval is required before replacing the public identity/i);
  assert.equal((html.match(/class="br-application br-application--/g) || []).length, 13, 'All thirteen requested brand applications are reviewable');
  assert.equal((html.match(/class="br-concept-stamp">CONCEPT<\/span>/g) || []).length, 13, 'Every application is marked as a concept');
  assert.match(text, /Dexter Acres.*proposed architectural visualization/i);
  assert.doesNotMatch(text, /\b(?:trademark|name)\s+(?:is\s+)?(?:cleared|registered|approved)\b/i);
  assert.doesNotMatch(text, /\b(?:guaranteed|assured)\s+(?:returns?|profits?)\b/i);
  assert.doesNotMatch(text, /(?:[$€£]\s*\d|\bUSD\s*\d|\d(?:[\d,.]*\d)?\s*%|\b(?:ROI|IRR)\s*[:=]\s*\d)/i);
  assert.doesNotMatch(text, /\b\d[\d,.]*\s+(?:million|billion)\s+(?:in\s+)?(?:sales|revenue|returns|profit)\b/i);
});

test('brand assets are valid native SVG vectors without scripts, raster images or external font resources', async t => {
  for (const file of logos) {
    await t.test(file, async () => {
      const source = await readFile(new URL('assets/brand/' + file, dist), 'utf8');
      assert.match(source, /<svg\b[^>]*\bxmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
      assert.match(source, /<path\b[^>]*\bd="[^"]+"/);
      assert.match(source, /<title\b[^>]*>[^<]+<\/title>/);
      assert.match(source, /<desc\b[^>]*>[^<]+<\/desc>/);
      const bounds = source.match(/\bviewBox="([^"]+)"/)?.[1].trim().split(/[\s,]+/).map(Number);
      assert.equal(bounds?.length, 4);
      assert.ok(bounds.every(Number.isFinite) && bounds[2] > 0 && bounds[3] > 0);
      assert.doesNotMatch(source, /<(?:script|foreignObject|image|iframe|object|embed|font|font-face)\b/i);
      assert.doesNotMatch(source, /<!DOCTYPE|<!ENTITY|\son[a-z]+\s*=|@font-face|@import|data:/i);
      assert.doesNotMatch(source, /\b(?:href|src)\s*=\s*["'](?!#)/i);
      assert.doesNotMatch(source, /url\(\s*(?!#)/i);
      // System SVG text descriptors are permitted. No embedded/downloaded
      // typeface or converted-font assumption is required for the master paths.
      const metadata = await sharp(Buffer.from(source)).metadata();
      assert.equal(metadata.format, 'svg');
      assert.ok(metadata.width > 0 && metadata.height > 0);
      const { info } = await sharp(Buffer.from(source)).resize({ width: 320 }).png().toBuffer({ resolveWithObject: true });
      assert.equal(info.width, 320, 'The standalone logo must actually render');
      assert.ok(info.height > 0);
    });
  }
});

test('sitemap contains exactly the fifteen public feature routes and no private investor URLs', async () => {
  assert.deepEqual(siteRoutes.map(route => route.path).sort(), [...expectedPaths].sort());
  const xml = await readFile(new URL('sitemap.xml', dist), 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
  assert.equal(urls.length, expectedPaths.length);
  assert.equal(new Set(urls.map(url => url.href)).size, expectedPaths.length);
  assert.deepEqual(urls.map(url => url.pathname).sort(), [...expectedPaths].sort());
  for (const url of urls) {
    assert.equal(url.origin, origin);
    assert.equal(url.search, '');
    assert.equal(url.hash, '');
    assert.ok(!/^\/(?:presentation|api|apps|\.data)(?:\/|$)/.test(url.pathname));
  }
  assert.doesNotMatch(xml, /\/presentation|\/api\/|\/\.data\//);
  const robots = await readFile(new URL('robots.txt', dist), 'utf8');
  assert.match(robots, /^User-agent: \*\nDisallow: \/\n/m);
  assert.doesNotMatch(robots, /^Allow:/m);
});
