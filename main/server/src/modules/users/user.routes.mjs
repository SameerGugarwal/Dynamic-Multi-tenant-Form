import express from 'express';
import { createNewUser, getOrgUser, updateUser } from './user.controller.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';
import { authorizeRoles } from '../../middleware/role.middleware.mjs';

const router = express.Router();
router.use(protect);

router.post('/', authorizeRoles('Organization Admin', 'Super Admin'), createNewUser);
router.get('/organization', authorizeRoles('Organization Admin'), getOrgUser);
router.patch('/:id', authorizeRoles('Organization Admin', 'Super Admin'), updateUser)
export default router;