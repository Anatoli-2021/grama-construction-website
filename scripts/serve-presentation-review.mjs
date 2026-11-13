import { readFile } from 'node:fs/promises';
import { createWebsiteServer } from './serve-website.mjs';

// Local private files are explicitly outside the build and repository.
// Start only after building. Provisioned accounts and actual decks are optional;
// missing configuration leaves the login gate closed.
for (const [name, path] of [
  ['PRESENTATION_ACCESS_JSON', '.data/investor-presentation/access.json'],
  ['PRESENTATION_DECKS_JSON', '.data/investor-presentation/decks.json'],
]) {
  try { process.env[name] = await readFile(path, 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const port = Number(process.env.PRESENTATION_REVIEW_PORT || 5190);
const server = createWebsiteServer();
server.listen(port, '127.0.0.1', () => console.log(`Private presentation review: http://localhost:${port}/presentation\nLocal files only. No investor invitations sent.`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
