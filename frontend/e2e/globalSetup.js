/**
 * Refuses to run the E2E suite against anything but a local database.
 *
 * These tests log in, create records and change statuses. The live deployment
 * is at emrs.okoro.me — pointing this suite at it would write production data.
 * The check reads backend/.env directly rather than trusting the ambient
 * environment, because that file is what the server under test will load.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];

const readEnv = (file) => {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const i = line.indexOf('=');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      })
  );
};

export default function globalSetup() {
  const envPath = path.resolve(__dirname, '../../backend/.env');
  const env = readEnv(envPath);
  const host = (process.env.DB_HOST || env.DB_HOST || '').trim();

  if (!LOCAL_HOSTS.includes(host)) {
    throw new Error(
      `Refusing to run E2E: DB_HOST is "${host || '(unset)'}", not a local host.\n` +
      `This suite writes to the database and must never run against a remote or ` +
      `production instance such as emrs.okoro.me.`
    );
  }

  const apiUrl = (process.env.VITE_API_URL || '').trim();
  if (apiUrl && !/localhost|127\.0\.0\.1/.test(apiUrl)) {
    throw new Error(`Refusing to run E2E: VITE_API_URL points off-box (${apiUrl}).`);
  }

  console.log(`E2E preflight OK — database host is "${host}".`);

  // Reset fixtures so every run starts from the same state. Specs consume
  // seeded data — marking an In_Progress report Resolved, filing new reports —
  // so without this a second run finds a different database than the first.
  // The seed is additive and marker-scoped; it never truncates a table.
  const backend = path.resolve(__dirname, '../../backend');
  execFileSync(process.execPath, ['seeds/index.js'], { cwd: backend, stdio: 'pipe' });
  console.log('E2E fixtures reseeded.');
}
