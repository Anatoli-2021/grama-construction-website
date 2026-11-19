import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

// Evaluate the actual production validator without importing server.mjs, which
// starts a listener. These tests make no requests and write no enquiry records.
const sourceFile = new URL('../../server.mjs', import.meta.url);
const source = await readFile(sourceFile, 'utf8');
const startMarker = 'function validateInterest(input) {';
const start = source.indexOf(startMarker);
const end = source.indexOf('\nconst server = http.createServer(', start);
assert.ok(start >= 0 && end > start, 'Production validator boundaries must exist');
assert.equal(source.indexOf(startMarker, start + 1), -1, 'Validator must be unique');
const validateInterest = runInNewContext(
  source.slice(start, end) + '\nvalidateInterest;',
  Object.create(null),
  { filename: sourceFile.pathname, timeout: 1000 },
);

const validEnquiry = {
  name: 'Synthetic Validator Check',
  email: 'validator-only@example.invalid',
  path: 'home',
  interest: 'Dexter Acres',
  consent: true,
};
const lotError = 'Please select a valid lot.';
const pathError = 'Lot selection is available for Dexter Acres enquiries.';
function check(name, patch, expected) {
  test(name, () => assert.equal(validateInterest({ ...validEnquiry, ...patch }), expected));
}

check('omitted lot remains optional', {}, null);
check('empty form selection remains optional', { lot: '' }, null);
check('null lot remains optional', { lot: null }, null);
for (let lot = 1; lot <= 14; lot++) {
  check('numeric lot ' + lot + ' is valid', { lot }, null);
  check('form select lot ' + lot + ' is valid', { lot: String(lot) }, null);
}
for (const [name, lot] of [
  ['boolean true', true],
  ['boolean false', false],
  ['array containing a lot number', [1]],
  ['array containing a form string', ['14']],
  ['nested array containing a lot', [[2]]],
  ['empty array', []],
  ['multiple-lot array', [1, 2]],
  ['empty object', {}],
  ['object with a lot property', { lot: 1 }],
  ['numeric zero', 0],
  ['negative lot', -1],
  ['lot above maximum', 15],
  ['fractional lot', 1.5],
  ['zero string', '0'],
  ['negative string', '-1'],
  ['string above maximum', '15'],
  ['fractional string', '1.5'],
  ['whitespace-only string', '   '],
  ['nonnumeric string', 'Lot 1'],
]) check(name + ' is rejected', { lot }, lotError);

check('custom-home lot is rejected', { interest: 'Custom home', lot: '3' }, pathError);
check('development lot is rejected', { path: 'development', interest: 'Investment partnership', lot: 3 }, pathError);
check('custom home without a lot remains valid', { interest: 'Custom home', lot: '' }, null);
check('development without a lot remains valid', { path: 'development', interest: 'Investment partnership', lot: '' }, null);
check('consent remains mandatory', { lot: '3', consent: false }, 'Please confirm that Grama Development may contact you about this enquiry.');
