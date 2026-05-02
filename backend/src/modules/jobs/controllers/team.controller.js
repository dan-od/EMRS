/**
 * Jobs Controller - Team Management
 * Handles team member CRUD with activity logging
 */
const service = require('../services');
const { query } = require('../../../config/db');
const { logActivity, ENTITY_TYPES, ACTIONS } = require('../../../utils/activityLogger');
const logger = require('../../../utils/logger');

const getUserName = async (userId) => {
  const result = await query('SELECT first_name, last_name FROM users WHERE id = $1', [userId]);
  return result.rows[0] ? `${result.rows[0].first_name} ${result.rows[0].last_name}` : userId;
};

const getJobInfo = async (jobId) => {
  const result = await query('SELECT job_number, client FROM jobs WHERE id = $1', [jobId]);
  return result.rows[0] || { job_number: jobId, client: '' };
};

const getTeam = async (req, res, next) => {
  try {
    const team = await service.getTeam(req.params.id);
    res.json({ team });
  } catch (error) { next(error); }
};

const addTeamMember = async (req, res, next) => {
  try {
    const member = await service.addTeamMember(req.params.id, req.body.user_id, req.body.role, req.user.id);
    const memberName = await getUserName(req.body.user_id);
    const jobInfo = await getJobInfo(req.params.id);
    
    // Log activity with department
    try {
      await logActivity({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        department: req.user.department,
        action: ACTIONS.TEAM_MEMBER_ADDED || 'TEAM_MEMBER_ADDED',
        entityType: ENTITY_TYPES.JOB || 'JOB',
        entityId: req.params.id,
        entityName: jobInfo.job_number,
        details: { 
          member: memberName, 
          role: req.body.role,
          jobNumber: jobInfo.job_number,
          client: jobInfo.client
        },
        req
      });
    } catch (logErr) {
      logger.error('Activity log error', { message: logErr.message });
    }
    
    res.status(201).json({ member });
  } catch (error) { next(error); }
};

const addTeamMembers = async (req, res, next) => {
  try {
    const members = await service.addTeamMembers(req.params.id, req.body.members, req.user.id);
    const jobInfo = await getJobInfo(req.params.id);
    
    // Log each member added
    for (const m of req.body.members) {
      const memberName = await getUserName(m.user_id);
      try {
        await logActivity({
          userId: req.user.id,
          userEmail: req.user.email,
          userRole: req.user.role,
          department: req.user.department,
          action: ACTIONS.TEAM_MEMBER_ADDED || 'TEAM_MEMBER_ADDED',
          entityType: ENTITY_TYPES.JOB || 'JOB',
          entityId: req.params.id,
          entityName: jobInfo.job_number,
          details: { 
            member: memberName, 
            role: m.role,
            jobNumber: jobInfo.job_number
          },
          req
        });
      } catch (logErr) {
        logger.error('Activity log error', { message: logErr.message });
      }
    }
    
    res.status(201).json({ members, count: members.length });
  } catch (error) { next(error); }
};

const removeTeamMember = async (req, res, next) => {
  try {
    const memberName = await getUserName(req.params.userId);
    const jobInfo = await getJobInfo(req.params.id);
    
    await service.removeTeamMember(req.params.id, req.params.userId);
    
    // Log activity with department
    try {
      await logActivity({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        department: req.user.department,
        action: ACTIONS.TEAM_MEMBER_REMOVED || 'TEAM_MEMBER_REMOVED',
        entityType: ENTITY_TYPES.JOB || 'JOB',
        entityId: req.params.id,
        entityName: jobInfo.job_number,
        details: { 
          member: memberName,
          jobNumber: jobInfo.job_number
        },
        req
      });
    } catch (logErr) {
      logger.error('Activity log error', { message: logErr.message });
    }
    
    res.status(204).send();
  } catch (error) { next(error); }
};

const updateTeamRole = async (req, res, next) => {
  try {
    const memberName = await getUserName(req.params.userId);
    const jobInfo = await getJobInfo(req.params.id);
    
    // Get old role for logging
    const oldMember = await query(
      'SELECT role FROM job_team WHERE job_id = $1 AND user_id = $2',
      [req.params.id, req.params.userId]
    );
    const oldRole = oldMember.rows[0]?.role;
    
    const member = await service.updateTeamRole(req.params.id, req.params.userId, req.body.role);
    
    try {
      await logActivity({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        department: req.user.department,
        action: ACTIONS.TEAM_ROLE_CHANGED,
        entityType: ENTITY_TYPES.JOB,
        entityId: req.params.id,
        entityName: jobInfo.job_number,
        details: { 
          member: memberName,
          oldRole,
          newRole: req.body.role,
          jobNumber: jobInfo.job_number,
          changedBy: { name: `${req.user.first_name} ${req.user.last_name}`, role: req.user.role }
        },
        req
      });
    } catch (logErr) {
      logger.error('Activity log error', { message: logErr.message });
    }
    
    res.json({ member });
  } catch (error) { next(error); }
};

module.exports = { getTeam, addTeamMember, addTeamMembers, removeTeamMember, updateTeamRole };
