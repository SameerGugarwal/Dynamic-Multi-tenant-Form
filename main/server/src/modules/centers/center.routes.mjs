import express from 'express';
import { createCenter, getCenter, updateCenter } from './center.controller.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';
import { authorizeRoles } from '../../middleware/role.middleware.mjs';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Centers
 *   description: Center management for Super Admins
 */

/**
 * @swagger
 * /centers:
 *   post:
 *     summary: Create a new center
 *     tags: [Centers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contactEmail
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Delhi Main Center"
 *               contactEmail:
 *                 type: string
 *                 example: "delhi@centers.com"
 *               location:
 *                 type: string
 *                 example: "North Zone Delhi"
 *     responses:
 *       201:
 *         description: Center created successfully
 *       400:
 *         description: Validation Error
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 */
// Only Super Admins can manage Centers
router.post('/', authorizeRoles('Super Admin'), createCenter);

/**
 * @swagger
 * /centers:
 *   get:
 *     summary: Get all centers
 *     tags: [Centers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Centers fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorizeRoles('Super Admin'), getCenter);

/**
 * @swagger
 * /centers/{id}:
 *   patch:
 *     summary: Update a center
 *     tags: [Centers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Center updated successfully
 */
router.patch('/:id', authorizeRoles('Super Admin'), updateCenter);

export default router;