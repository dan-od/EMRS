import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import { ROLES, SEED_PASSWORD, emailFor, storageStateFor } from './roles';

/**
 * Logs in once per role and saves the session.
 *
 * Every later test starts already authenticated as the right user, so the
 * login form is exercised here and nowhere else.
 */

setup.beforeAll(() => {
  fs.mkdirSync('e2e/.auth', { recursive: true });
});

for (const role of Object.keys(ROLES)) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    await page.goto('/login');

    await page.locator('#email').fill(emailFor(role));
    await page.locator('#password').fill(SEED_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Landing on /change-password means the seed left must_change_password set.
    await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
    await expect(page, `${role} was forced to change password`).not.toHaveURL(/change-password/);

    await page.context().storageState({ path: storageStateFor(role) });
  });
}
