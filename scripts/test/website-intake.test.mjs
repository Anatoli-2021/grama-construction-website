import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIntakeUrl } from '../../src/website-intake.js';

const form = 'https://app.smartsheet.com/b/form/0123456789abcdef0123456789abcdef';

test('all three website enquiry types use the same Smartsheet form and a safe lot prefill', () => {
  assert.equal(buildIntakeUrl(form, 'General Contact', 4), form + '?Lead%20type=General%20Contact');
  assert.equal(buildIntakeUrl(form, 'Grama Kitchens'), form + '?Lead%20type=Grama%20Kitchens');
  assert.equal(buildIntakeUrl(form, 'Dexter Acres', 14), form + '?Lead%20type=Dexter%20Acres&Dexter%20lot=14');
  for (const invalidLot of [0, 15, '14&Email=abc@example.com', '2.5']) {
    assert.equal(buildIntakeUrl(form, 'Dexter Acres', invalidLot), form + '?Lead%20type=Dexter%20Acres');
  }
});

test('unknown form hosts, private sheet URLs, extra parameters and unsupported categories are rejected', () => {
  for (const badForm of [
    '', '/sheets/internal', 'https://app.smartsheet.com/sheets/private',
    form.replace('https:', 'http:'), form.replace('.com/', '.com.example.org/'),
    form.replace('https://', 'https://user:password@'),
    form + '?Email=abc@example.com', form + '#details',
  ]) {
    assert.equal(buildIntakeUrl(badForm, 'General Contact'), '');
  }
  assert.equal(buildIntakeUrl(form, 'unexpected category'), '');
});
