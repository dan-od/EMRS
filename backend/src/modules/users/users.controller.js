const usersService = require('./users.service');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('../../utils/activityLogger');

const getAll = async (req, res, next) => {
  try {
    const result = await usersService.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await usersService.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const existing = await usersService.getByEmail(req.body.email);
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const user = await usersService.create(req.body);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.USER_CREATED,
      entityType: ENTITY_TYPES.USER,
      entityId: user.id,
      entityName: `${user.first_name} ${user.last_name}`,
      department: req.user.department,
      details: { 
        newUserEmail: user.email, 
        newUserRole: user.role,
        newUserDepartment: user.department 
      },
      req
    });
    
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    // Get old values for audit trail
    const oldUser = await usersService.getById(req.params.id);
    const user = await usersService.update(req.params.id, req.body);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if role changed
    const roleChanged = oldUser && oldUser.role !== user.role;
    const action = roleChanged ? ACTIONS.ROLE_CHANGED : ACTIONS.USER_UPDATED;
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action,
      entityType: ENTITY_TYPES.USER,
      entityId: req.params.id,
      entityName: `${user.first_name} ${user.last_name}`,
      department: req.user.department,
      details: { 
        before: oldUser ? { role: oldUser.role, department: oldUser.department } : null,
        after: { role: user.role, department: user.department }
      },
      req
    });
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const targetUser = await usersService.getById(req.params.id);
    await usersService.updatePassword(req.params.id, req.body.password);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.PASSWORD_RESET_COMPLETED,
      entityType: ENTITY_TYPES.USER,
      entityId: req.params.id,
      entityName: targetUser ? `${targetUser.first_name} ${targetUser.last_name}` : null,
      department: req.user.department,
      details: { resetBy: 'admin', targetEmail: targetUser?.email },
      req
    });
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

const toggleActive = async (req, res, next) => {
  try {
    const user = await usersService.toggleActive(req.params.id, req.body.isActive);
    const action = req.body.isActive ? ACTIONS.USER_REACTIVATED : ACTIONS.USER_DEACTIVATED;
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action,
      entityType: ENTITY_TYPES.USER,
      entityId: req.params.id,
      entityName: `${user.first_name} ${user.last_name}`,
      department: req.user.department,
      details: { isActive: req.body.isActive, targetEmail: user.email },
      req
    });
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const targetUser = await usersService.getById(req.params.id);
    await usersService.remove(req.params.id);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.USER_DELETED,
      entityType: ENTITY_TYPES.USER,
      entityId: req.params.id,
      entityName: targetUser ? `${targetUser.first_name} ${targetUser.last_name}` : null,
      department: req.user.department,
      details: { deletedEmail: targetUser?.email },
      req
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, resetPassword, toggleActive, remove };
