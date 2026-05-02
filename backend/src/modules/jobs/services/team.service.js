/**
 * Jobs Service - Team Operations
 * Supports: SUPERVISOR, CHIEF_OPERATOR, DAQ, ENGINEER roles
 */
const { query } = require('../../../config/db');
const queries = require('../queries');

const getTeam = async (jobId) => {
  const result = await query(queries.team.getByJobId, [jobId]);
  return result.rows;
};

const addTeamMember = async (jobId, userId, role, assignedBy) => {
  const result = await query(queries.team.add, [jobId, userId, role, assignedBy]);
  return result.rows[0];
};

const addTeamMembers = async (jobId, members, assignedBy) => {
  const results = [];
  for (const member of members) {
    const result = await query(queries.team.add, [jobId, member.user_id, member.role, assignedBy]);
    results.push(result.rows[0]);
  }
  return results;
};

const removeTeamMember = async (jobId, userId) => {
  const result = await query(queries.team.remove, [jobId, userId]);
  return result.rows[0];
};

const updateTeamRole = async (jobId, userId, newRole) => {
  const result = await query(queries.team.updateRole, [jobId, userId, newRole]);
  return result.rows[0];
};

const getSupervisor = async (jobId) => {
  const result = await query(queries.team.getSupervisor, [jobId]);
  return result.rows[0];
};

const canRequestEquipment = async (jobId, userId) => {
  const result = await query(queries.team.canRequest, [jobId, userId]);
  return result.rows[0]?.can_request || false;
};

const isSupervisor = async (jobId, userId) => {
  const result = await query(queries.team.isSupervisor, [jobId, userId]);
  return result.rows[0]?.is_supervisor || false;
};

module.exports = { 
  getTeam, addTeamMember, addTeamMembers, removeTeamMember, 
  updateTeamRole, getSupervisor, canRequestEquipment, isSupervisor 
};
