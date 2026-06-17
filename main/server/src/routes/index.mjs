import express from 'express';
import authRoutes from '../modules/auth/auth.routes.mjs';
import userRoutes from '../modules/users/user.routes.mjs'; 
import centerRoutes from '../modules/centers/center.routes.mjs'; 
import orgRoutes from '../modules/organizations/organization.routes.mjs';
import questionRoutes from '../modules/questions/question.routes.mjs';
import formsRoutes from '../modules/forms/form.routes.mjs';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes); 
router.use('/centers',centerRoutes);
router.use('/organizations', orgRoutes);
router.use('/questions', questionRoutes);
router.use('/forms', formsRoutes);

export default router;