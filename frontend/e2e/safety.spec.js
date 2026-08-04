import { test, expect } from '@playwright/test';
import { storageStateFor, E2E_TAG } from './roles';

/**
 * Safety — the module where every known bug lived.
 *
 * Each of these would have caught a real defect: the missing Safety_Manager
 * entry in SAFETY_ADMIN_ROLES, the detail page crashing on report.report_type,
 * and the status update that never persisted.
 */

const STAT_CARDS = ['Open Reports', 'This Month', 'Critical', 'Resolved'];
// SafetyHub shows this only to users without full access.
const OWN_REPORTS_NOTICE = 'Showing your submitted reports';

// Scope to the stats grid: "Critical" also appears as a severity badge on
// every report row and as a filter option.
const statsGrid = (page) => page.locator('div.grid').filter({ hasText: 'Open Reports' }).first();

// SafetyStatCard renders <p>title</p><p>value</p> as adjacent siblings.
const statValue = async (page, title) => {
  const value = statsGrid(page).locator(`p:text-is("${title}") + p`);
  return Number((await value.innerText()).trim());
};

test.describe('Safety — Safety_Manager', () => {
  test.use({ storageState: storageStateFor('safety_manager') });

  test('sees the full list with filters and stats', async ({ page }) => {
    // Regression guard for SAFETY_ADMIN_ROLES missing Safety_Manager, which
    // silently downgraded them to the "my reports only" view.
    await page.goto('/safety');
    await expect(page.getByRole('heading', { name: 'Safety Reports' })).toBeVisible();

    for (const card of STAT_CARDS) {
      await expect(statsGrid(page).locator(`p:text-is("${card}")`)).toBeVisible();
    }
    // Filters render only for users with full access.
    await expect(page.getByPlaceholder('Search reports...')).toBeVisible();
    await expect(page.getByText(OWN_REPORTS_NOTICE)).toHaveCount(0);

    // Seeded reports are authored by other users; a downgraded view hides them.
    await expect(page.getByText('[SEED]').first()).toBeVisible();
  });

  test('opens a report detail without crashing', async ({ page }) => {
    // The ship blocker: SafetyReportDetail read report.report_type, which the
    // API never returns, so .replace() threw on every report.
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/safety');
    await page.getByText('[SEED]').first().click();

    await expect(page).toHaveURL(/\/safety\/[0-9a-f-]{36}/);
    await expect(page.getByText(/Report$/).first()).toBeVisible();
    expect(errors, `page errors: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('changing status to Resolved increments the Resolved stat', async ({ page }) => {
    await page.goto('/safety');
    const before = await statValue(page, 'Resolved');

    // Narrow to In_Progress: the seed also holds Resolved and Closed reports,
    // which correctly show no status controls. Filters are component state,
    // not URL params, so this has to go through the dropdown.
    await page.locator('select').filter({ has: page.locator('option[value="In_Progress"]') })
      .selectOption('In_Progress');
    await expect(page.getByText('[SEED]').first()).toBeVisible();

    await page.getByText('[SEED]').first().click();
    await expect(page).toHaveURL(/\/safety\/[0-9a-f-]{36}/);

    const markResolved = page.getByRole('button', { name: /Mark Resolved/i });
    await expect(markResolved, 'status controls must render for the Safety dept').toBeVisible();
    await markResolved.click();

    await page.goto('/safety');
    await expect
      .poll(() => statValue(page, 'Resolved'), { timeout: 15_000 })
      .toBe(before + 1);
  });
});

test.describe('Safety — Field_Engineer', () => {
  test.use({ storageState: storageStateFor('field_engineer') });

  /**
   * KNOWN FAILURE — routes/groups/safetyRoutes.jsx guards /safety, /safety/new
   * and /safety/:id with SAFETY_ROLES, so ordinary staff are redirected to
   * /unauthorized and cannot file an incident report at all.
   *
   * routeConfig.js declares the same routes as roles: 'all', and SafetyHub
   * carries a whole "Showing your submitted reports" branch for non-admins,
   * so the guard contradicts both. These tests assert the intended behaviour
   * and are left failing deliberately rather than relaxed to match the bug.
   */
  test('files a report and sees it in their own list', async ({ page }) => {
    const title = `${E2E_TAG} hazard ${Date.now()}`;

    await page.goto('/safety/new');
    await expect(page, 'Field_Engineer is redirected away from /safety/new — see note above')
      .not.toHaveURL(/unauthorized/);
    await page.getByRole('button', { name: /Hazard/i }).first().click();

    await page.locator('[name="incident_date"]').fill(new Date().toISOString().slice(0, 10));
    await page.locator('[name="location"]').fill(title);
    await page.locator('[name="description"]').fill('Filed by the E2E suite.');
    await page.locator('[name="severity"]').selectOption('Medium');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/safety(\?.*)?$/, { timeout: 20_000 });
    await expect(page.getByText(title).first()).toBeVisible();
  });

  test('does NOT see the full list, stats or filters', async ({ page }) => {
    await page.goto('/safety');
    await expect(page, 'Field_Engineer is redirected away from /safety — see note above')
      .not.toHaveURL(/unauthorized/);
    await expect(page.getByText(OWN_REPORTS_NOTICE)).toBeVisible();

    await expect(page.getByPlaceholder('Search reports...')).toHaveCount(0);
    await expect(statsGrid(page)).toHaveCount(0);
  });

  test('does NOT get status controls on a report detail', async ({ page }) => {
    await page.goto('/safety');
    await expect(page, 'Field_Engineer is redirected away from /safety — see note above')
      .not.toHaveURL(/unauthorized/);
    const own = page.getByText(E2E_TAG).first();
    await expect(own, 'expects a report filed by the previous test').toBeVisible();
    await own.click();

    await expect(page).toHaveURL(/\/safety\/[0-9a-f-]{36}/);
    await expect(page.getByRole('button', { name: /Mark Resolved/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Start Investigation/i })).toHaveCount(0);
  });
});
