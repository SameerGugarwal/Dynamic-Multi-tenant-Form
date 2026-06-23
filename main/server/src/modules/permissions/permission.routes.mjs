import express from 'express';
import Joi from 'joi';
import * as permissionService from './permission.service.mjs';
import * as roleService from './role.service.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';
import { authorizeRoles } from '../../middleware/role.middleware.mjs';
import validate from '../../middleware/validation.middleware.mjs';
import { successResponse, errorResponse } from '../../shared/utils/apiResponse.mjs';

const router = express.Router();

//data validation schema
const updateRolePermissionsSchema = Joi.object({
  roleName: Joi.string().valid('Super Admin', 'Center Admin', 'Organization Admin', 'User').required(),
  permissions: Joi.array().items(Joi.string().required()).required()
});

// Enforce authentication across this security control panel
router.use(protect);
// Restrict access exclusively to Super Admins 
router.use(authorizeRoles('Super Admin'));

// 1. Fetch all raw permission tokens existing on the system
router.get('/', async (req, res, next) => {
  try {
    const permissions = await permissionService.getAllPermissions();
    return successResponse(res, 200, "System permissions ledger compiled successfully", permissions);
  } catch (error) {
    next(error);
  }
});

// 2. Fetch the master Roles array fully populated with permission details
router.get('/roles', async (req, res, next) => {
  try {
    const roles = await roleService.getAllRolesWithPermissions();
    return successResponse(res, 200, "Role permission configurations fetched successfully", roles);
  } catch (error) {
    next(error);
  }
});

// 3. Update or append permission scopes assigned to an identity role container
router.post('/roles/configure', validate(updateRolePermissionsSchema, 'body'), async (req, res, next) => {
  try {
    const { roleName, permissions } = req.body;
    
    const data = await roleService.updateRolePermissions(roleName, permissions);
    return successResponse(res, 200, `Permissions for role '${roleName}' updated cleanly`, data);
  } catch (error) {
    if (error.message === 'ROLE_NOT_FOUND') {
      return errorResponse(res, 404, "The specified role target does not exist in the platform registry.");
    }
    next(error);
  }
});

export default router;