import { test, expect } from '@playwright/test';
import { storageStateFor } from './roles';

/**
 * Jobs — status rendering.
 *
 * Build Pass 1 fixed JobStatusBadge and JobStatusTracker by bundling the
 * module and asserting on it directly; neither was ever seen in a browser.
 * These check the rendered output instead.
 *
 * Jobs routes are guarded by DEV_PREVIEW_ROLES (Super_Admin only), which is
 * deliberate while the module is IN DEVELOPMENT.
 */

test.use({ storageState: storageStateFor('super_admin') });

// Stored TitleCase -> the label the badge should render.
const EXPECTED_LABELS = {
  Draft: 'Draft',
  Team_Assigned: 'Pending Approval',
  Approved: 'Approved',
  In_Progress: 'In Progress',
  Post_Job: 'Post Job',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

/**
 * KNOWN FAILURE — /jobs renders "A server error occurred" instead of the list;
 * the jobs endpoints return 500, so no job reaches the page and the badge and
 * tracker rendering cannot be observed in a browser at all. The unit tests in
 * jobStatus.test.js still cover the mapping logic itself.
 */
test.describe('Jobs — status badges', () => {
  test('renders mapped labels, never the raw stored string', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.getByText('SEED-JOB-001')).toBeVisible();

    // The bug produced a gray badge labelled with the raw status. If any raw
    // underscored form is on the page, the lookup fell through again.
    for (const stored of ['Team_Assigned', 'In_Progress', 'Post_Job']) {
      await expect(
        page.getByText(stored, { exact: true }),
        `raw "${stored}" is rendered — the status lookup fell through`
      ).toHaveCount(0);
    }

    // Team_Assigned is the load-bearing case: uppercasing alone gives
    // TEAM_ASSIGNED, which the config has no key for.
    await expect(page.getByText(EXPECTED_LABELS.Team_Assigned).first()).toBeVisible();
    await expect(page.getByText(EXPECTED_LABELS.In_Progress).first()).toBeVisible();
    await expect(page.getByText(EXPECTED_LABELS.Post_Job).first()).toBeVisible();
  });
});

test.describe('Jobs — status tracker', () => {
  const openSeededJob = async (page, jobNumber) => {
    await page.goto('/jobs');
    await page.getByText(jobNumber).first().click();
    await expect(page).toHaveURL(/\/jobs\/[0-9a-f-]{36}/);
  };

  test('shows the cancelled banner for a cancelled job', async ({ page }) => {
    // Previously `currentStatus === 'CANCELLED'` never matched stored
    // 'Cancelled', so a cancelled job rendered the progress bar instead.
    await openSeededJob(page, 'SEED-JOB-007');
    await expect(page.getByText('Job Cancelled')).toBeVisible();
  });

  test('highlights the current step for an in-progress job', async ({ page }) => {
    // STATUS_FLOW.indexOf(raw) returned -1 for every job, so no step was ever
    // marked current and the bar sat at -20%.
    await openSeededJob(page, 'SEED-JOB-004');
    await expect(page.getByText('Job Cancelled')).toHaveCount(0);
    await expect(page.getByText('In Progress').first()).toBeVisible();
  });
});
