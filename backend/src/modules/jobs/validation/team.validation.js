/**
 * Jobs Validation - Team Schemas (Enhanced)
 * Supports: SUPERVISOR, CHIEF_OPERATOR, DAQ, ENGINEER roles
 */
const { z } = require('zod');

const TEAM_ROLES = ['SUPERVISOR', 'CHIEF_OPERATOR', 'DAQ', 'ENGINEER'];

const addTeamMemberSchema = z.object({
  body: z.object({
    user_id: z.string().uuid(),
    role: z.enum(TEAM_ROLES)
  })
});

const addTeamMembersSchema = z.object({
  body: z.object({
    members: z.array(z.object({
      user_id: z.string().uuid(),
      role: z.enum(TEAM_ROLES)
    })).min(1)
  })
});

const updateTeamRoleSchema = z.object({
  body: z.object({
    role: z.enum(TEAM_ROLES)
  })
});

module.exports = { addTeamMemberSchema, addTeamMembersSchema, updateTeamRoleSchema };
