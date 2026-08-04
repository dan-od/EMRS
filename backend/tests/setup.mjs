/**
 * Test guard — these tests write to a real database.
 *
 * The live deployment is at emrs.okoro.me. Refuse to run against anything
 * that is not local, rather than trusting whatever .env happens to hold.
 */
import dotenv from 'dotenv';
dotenv.config();

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];
const host = (process.env.DB_HOST || '').trim();

if (!LOCAL_HOSTS.includes(host)) {
  throw new Error(
    `Refusing to run tests: DB_HOST is "${host || '(unset)'}", not a local host. ` +
    `These tests write to the database and must never touch a remote or production instance.`
  );
}

// src/config/env.js only waives the JWT secrets when NODE_ENV === 'development'
// exactly, and Vitest sets it to 'test' — so config loading throws without
// these. Obviously-fake values: nothing here signs a token anyone will accept.
process.env.JWT_SECRET ||= 'test-only-jwt-secret';
process.env.JWT_REFRESH_SECRET ||= 'test-only-refresh-secret';
