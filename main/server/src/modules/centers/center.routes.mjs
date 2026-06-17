import express from 'express';
import { createCenter, getCenter } from './center.controller.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';
import { authorizeRoles } from '../../middleware/role.middleware.mjs';

const router = express.Router();

router.use(protect);

// Only Super Admins can manage Centers
router.post('/', authorizeRoles('Super Admin'), createCenter);
router.get('/', authorizeRoles('Super Admin'), getCenter);

export default router;