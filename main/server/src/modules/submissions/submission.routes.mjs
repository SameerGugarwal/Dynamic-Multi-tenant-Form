import express from 'express';
/*
// import Joi from 'joi'; 
*/
import { createSubmission, updateDraft, fetchFormSubmissions } from './submission.controller.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';
import { authorizeRoles } from '../../middleware/role.middleware.mjs';
import validate from '../../middleware/validation.middleware.mjs';

const router = express.Router();

/*
// --- User's Original Code ---
const answerItemSchema = Joi.object({
  questionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid questionId identifier format. Must be a 24-character hexadecimal ObjectId.'
  }),
  value: Joi.any().required()
});

const createSubmissionSchema = Joi.object({
  formId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  organizationId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  status: Joi.string().valid('DRAFT', 'SUBMITTED').default('DRAFT'),
  answers: Joi.array().items(answerItemSchema).required()
});

const updateDraftSchema = Joi.object({
  status: Joi.string().valid('DRAFT', 'SUBMITTED'),
  answers: Joi.array().items(answerItemSchema)
}).min(1);
// --- End User's Original Code ---
*/

import { z } from 'zod';

const answerItemSchema = z.object({
  questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid questionId identifier format. Must be a 24-character hexadecimal ObjectId.'),
  value: z.any()
});

const createSubmissionSchema = z.object({
  formId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  organizationId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  status: z.enum(['DRAFT', 'SUBMITTED']).default('DRAFT'),
  answers: z.array(answerItemSchema)
});

const updateDraftSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED']).optional(),
  answers: z.array(answerItemSchema).optional()
}).refine(data => data.status !== undefined || data.answers !== undefined, {
  message: 'At least one field must be provided for update'
});

// endpoint regis.
router.use(protect);

/*
// --- User's Original Code ---
// core submission
router.post('/', validate(createSubmissionSchema, 'body'), createSubmission);

// draft modification
router.patch('/:id', validate(updateDraftSchema, 'body'), updateDraft);
// --- End User's Original Code ---
*/

/**
 * @swagger
 * /submissions:
 *   post:
 *     summary: Create a new submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Submission created successfully
 */
// core submission
router.post('/', validate(z.object({ body: createSubmissionSchema })), createSubmission);

/**
 * @swagger
 * /submissions/{id}:
 *   patch:
 *     summary: Update submission draft
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Draft updated successfully
 */
// draft modification
router.patch('/:id', validate(z.object({ body: updateDraftSchema })), updateDraft);

/**
 * @swagger
 * /submissions/form/{formId}:
 *   get:
 *     summary: Fetch submissions by form ID
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submissions fetched successfully
 */
// administration analytics
router.get('/form/:formId', authorizeRoles('Organization Admin', 'Center Admin', 'Super Admin'), fetchFormSubmissions);

export default router;