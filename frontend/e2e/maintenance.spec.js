import { test, expect } from '@playwright/test';
import { storageStateFor, E2E_TAG } from './roles';

/**
 * Maintenance — the Work Order link.
 *
 * Build Pass 1 fixed RequestDetailsSection so a standard Maintenance request
 * surfaces its work order, but only ever verified it at the database level.
 * This opens the request in a browser and clicks through.
 */

/**
 * KNOWN FAILURE — RequestDetail.jsx:224 branches on isMaintenance and renders
 * MaintenanceDetailsSection for Maintenance requests, so RequestDetailsSection
 * (where the work order link lives) is never mounted for this flow.
 * MaintenanceDetailsSection has no work-order reference at all.
 *
 * The Build Pass 1 fix is therefore only reachable for Jobs-module additional
 * requests, not the standard Maintenance request it was written for. Left
 * asserting the intended behaviour rather than relaxed to match the bug.
 */
test.describe('Maintenance — work order link', () => {
  test.use({ storageState: storageStateFor('super_admin') });

  // Finds a seeded Maintenance request that already carries a work order.
  const seededRequestWithWorkOrder = async (request) => {
    const res = await request.get('http://localhost:5000/api/requests?type=Maintenance&limit=100');
    expect(res.ok(), `requests API returned ${res.status()}`).toBeTruthy();
    const body = await res.json();
    const list = body.requests || body.data || [];
    return list.find((r) => r?.details?.seedTag === 'BUILD-PASS-1' && r?.details?.workOrderId);
  };

  test('shows the work order link on a standard maintenance request', async ({ page, request }) => {
    const req = await seededRequestWithWorkOrder(request);
    expect(req, 'no seeded Maintenance request with a workOrderId — run the seed').toBeTruthy();
    // Not an additional request: the old UI gated the block on that flag, so
    // this is exactly the case that used to render nothing.
    expect(req.details.isAdditionalRequest).toBeUndefined();

    await page.goto(`/requests/${req.id}`);

    const link = page.getByText(`#${req.details.workOrderId.slice(0, 8)}`);
    await expect(link, 'work order link is missing on a standard maintenance request').toBeVisible();
  });

  test('work order link navigates to the work order', async ({ page, request }) => {
    const req = await seededRequestWithWorkOrder(request);
    expect(req).toBeTruthy();

    await page.goto(`/requests/${req.id}`);
    await page.getByText(`#${req.details.workOrderId.slice(0, 8)}`).click();

    await expect(page).toHaveURL(new RegExp(`/maintenance/${req.details.workOrderId}`));
  });
});

test.describe('Maintenance — Field_Engineer submits a request', () => {
  test.use({ storageState: storageStateFor('field_engineer') });

  test('can open the maintenance request form', async ({ page }) => {
    await page.goto('/requests/new?type=MAINTENANCE');
    await expect(page, 'Field_Engineer cannot reach the request form').not.toHaveURL(/unauthorized/);
    await expect(page.locator('form, [role="form"]').first()).toBeVisible();
  });
});
