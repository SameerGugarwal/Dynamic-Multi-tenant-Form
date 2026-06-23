import express from 'express';
import authRoutes from '../modules/auth/auth.routes.mjs';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.mjs';
import userRoutes from '../modules/users/user.routes.mjs'; 
import centerRoutes from '../modules/centers/center.routes.mjs'; 
import orgRoutes from '../modules/organizations/organization.routes.mjs';
import questionRoutes from '../modules/questions/question.routes.mjs';
import formsRoutes from '../modules/forms/form.routes.mjs';
import submissionRoutes from '../modules/submissions/submission.routes.mjs';
import otpRoutes from '../modules/otp/otp.routes.mjs';
import permissionRoutes from '../modules/permissions/permission.routes.mjs';
import reportRoutes from '../modules/reports/report.routes.mjs';


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes); 
router.use('/centers',centerRoutes);
router.use('/organizations', orgRoutes);
router.use('/questions', questionRoutes);
router.use('/forms', formsRoutes);
router.use('/submissions', submissionRoutes);
router.use('/otp', otpRoutes);
router.use('/permissions', permissionRoutes);
router.use('/reports', reportRoutes);

export default router;