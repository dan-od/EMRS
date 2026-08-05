const safetyService = require('./safety.service');
const { SAFETY_ROLES } = require('./safety.constants');

/**
 * Authorises access to a single safety report: you may open one you filed,
 * and the safety roles may open any. Nobody else.
 *
 * GET /safety/:id previously had no guard at all, so any authenticated user
 * holding a report UUID could read full detail including a named reporter's
 * identity and department.
 *
 * Anonymous reports have reporter_id NULL, so they have no owner and remain
 * visible only to the safety roles — which is the point of filing anonymously.
 *
 * The report is attached to the request so the controller does not refetch it.
 */
const canAccessReport = async (req, res, next) => {
  try {
    const report = await safetyService.getById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const isSafetyRole = SAFETY_ROLES.includes(req.user?.role);
    const isOwner =
      report.reporter_id != null && String(report.reporter_id) === String(req.user?.id);

    if (!isSafetyRole && !isOwner) {
      return res.status(403).json({ message: 'You do not have access to this report' });
    }

    req.safetyReport = report;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { canAccessReport };
