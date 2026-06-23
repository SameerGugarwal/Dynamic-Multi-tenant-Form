import express from 'express';
import { addQuestion, fetchFormQuestions } from './question.controller.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';
import { authorizeRoles } from '../../middleware/role.middleware.mjs';

import validate from '../../middleware/validation.middleware.mjs';
import { createQuestionSchema } from './question.validation.mjs';

const router = express.Router();

router.use(protect);

// only super admin rn 
router.post('/', authorizeRoles('Super Admin'), validate(createQuestionSchema), addQuestion);

// Route to Fetch all Questions for a Form (Anyone logged in can view them)
router.get('/form/:formId', fetchFormQuestions);

export default router;