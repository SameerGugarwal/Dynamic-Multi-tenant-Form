import express from 'express';
import { createNewOrg, getOrg, getAllOrgs, getCenterOrgs } from './organization.controller.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';
import { authorizeRoles } from '../../middleware/role.middleware.mjs';

const router = express.Router();

router.use(protect);

// Only Center Admins (and Super Admins) can manage Organizations
router.post('/', authorizeRoles('Center Admin', 'Super Admin'), createNewOrg);
router.get('/my-center', authorizeRoles('Center Admin'), getOrg, getCenterOrgs);
router.get('/', authorizeRoles('Super Admin'), getAllOrgs);

export default router;