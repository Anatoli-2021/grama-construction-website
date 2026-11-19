import test from 'node:test';
import assert from 'node:assert/strict';
import { contactEmailLink, publicContactEmail } from '../../src/contact-email.js';

test('the public email handoff accepts one bare destination and rejects headers or address lists', () => {
  assert.equal(publicContactEmail(' enquiries@example.test '), 'enquiries@example.test');
  for (const address of ['', 'Name <enquiries@example.test>', 'a@example.test,b@example.test', 'a@example.test?bcc=other@example.test', 'a@example.test\r\nBcc:other@example.test']) {
    assert.equal(publicContactEmail(address), '');
    assert.equal(contactEmailLink(address, {}), '');
  }
});

test('each enquiry context is retained with encoded visitor content and no extra mail headers', () => {
  for (const interest of ['Dexter Acres', 'Custom home', 'Landowner opportunity', 'Investment partnership', 'Development partnership']) {
    const url = new URL(contactEmailLink('enquiries@example.test', { name: 'A & B', email: 'visitor@example.test', interest, lot: '4', details: 'A site?\n&bcc=unwanted@example.test' }));
    assert.equal(url.pathname, 'enquiries@example.test');
    assert.deepEqual([...url.searchParams.keys()], ['subject', 'body']);
    assert.equal(url.searchParams.get('subject'), 'GRAMA — ' + interest);
    assert.match(url.searchParams.get('body'), /Name: A & B/);
    assert.match(url.searchParams.get('body'), /&bcc=unwanted@example.test/);
    assert.ok(url.href.includes('%0D%0A'), 'Mail body line breaks use RFC6068 CRLF encoding');
    assert.doesNotMatch(url.searchParams.get('body'), /(?<!\r)\n/);
    assert.equal(url.searchParams.get('body').includes('Dexter Acres lot: 4'), interest === 'Dexter Acres');
  }
});
