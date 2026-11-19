import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { hashAccessCode } from './presentation-access.mjs';

// Run locally after Tony approves the exact recipient. This creates local
// configuration and a private credential receipt; it never sends an invitation.
const options = Object.fromEntries(process.argv.slice(2).map(arg => {
  const index = arg.indexOf('='); return [arg.slice(0, index).replace(/^--/, ''), arg.slice(index + 1)];
}));
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.email || '') || !options.name || !/^[A-Za-z0-9_-]+$/.test(options.deck || '')) {
  console.error('Usage: node scripts/provision-presentation-access.mjs --email=approved@example.com --name="Approved name" --deck=approved-deck-id');
  process.exitCode = 1;
} else {
  const folder = '.data/investor-presentation';
  await mkdir(folder, { recursive: true });
  let accounts = [];
  try { accounts = JSON.parse(await readFile(folder + '/access.json', 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const email = options.email.toLowerCase();
  if (accounts.some(account => account.email === email)) throw new Error('An account already exists. Review it explicitly before rotating or replacing access.');
  const code = randomBytes(30).toString('base64url');
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  accounts.push({ email, name: options.name, deckId: options.deck, active: true, expiresAt, ...await hashAccessCode(code) });
  await writeFile(folder + '/access.json', JSON.stringify(accounts, null, 2), { mode: 0o600 });
  await writeFile(folder + '/private-access-receipt.json', JSON.stringify({ email, code, expiresAt, note: 'Local credential receipt. Do not commit or place in the public build. Share only through an approved recipient-specific channel.' }, null, 2), { mode: 0o600 });
  console.log('Created local account configuration and private receipt under .data/investor-presentation/. No credentials printed or invitations sent.');
}
