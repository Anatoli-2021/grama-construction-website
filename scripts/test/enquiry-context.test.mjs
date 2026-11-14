import test from 'node:test';
import assert from 'node:assert/strict';
import { enquiryHref, readEnquiryContext } from '../../src/enquiry-context.js';

test('a selected Dexter lot survives navigation to the contact document', () => {
  const href = enquiryHref({ path: 'home', topic: 'Dexter Acres', lot: '14' });
  const url = new URL(href, 'https://example.invalid');
  assert.equal(url.pathname, '/contact');
  assert.deepEqual(readEnquiryContext(url.search), { path: 'home', topic: 'Dexter Acres', lot: '14' });
});
test('development context cannot carry a stale home lot', () => {
  const href = enquiryHref({ path: 'development', topic: 'Investment partnership', lot: '4' });
  assert.deepEqual(readEnquiryContext(new URL(href, 'https://example.invalid').search), { path: 'development', topic: 'Investment partnership' });
  assert.deepEqual(readEnquiryContext('?path=home&topic=Custom+home&lot=4'), { path: 'home', topic: 'Custom home' });
});
test('malformed inbound deep links do not invent an enquiry path or lot', () => {
  assert.equal(readEnquiryContext('?path=unknown&topic=anything&lot=10'), null);
  assert.equal(readEnquiryContext('?path=__proto__'), null);
  for (const lot of ['0', '15', '1.5', 'true', '4,5', '']) {
    assert.deepEqual(readEnquiryContext('?path=home&topic=Dexter+Acres&lot=' + encodeURIComponent(lot)), { path: 'home', topic: 'Dexter Acres' });
  }
});
