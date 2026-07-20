import express from 'express';
import { createNewOrg, getOrg, getAllOrgs, getCenterOrgs, updateOrganization, getOrganizationInfo, deleteOrganization } from './organization.controller.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';
import { authorizeRoles } from '../../middleware/role.middleware.mjs';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization management
 */

/**
 * @swagger
 * /organizations:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
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
 *                 example: "Global Tech Inc"
 *               contactEmail:
 *                 type: string
 *                 example: "contact@globaltech.com"
 *               centers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["6a350dcf89a69b19954db96e"]
 *     responses:
 *       201:
 *         description: Organization created successfully
 */
router.post('/', authorizeRoles('Center Admin', 'Super Admin'), createNewOrg);

/**
 * @swagger
 * /organizations/my-center:
 *   get:
 *     summary: Get organizations for a specific center
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organizations fetched successfully
 */
router.get('/my-center', authorizeRoles('Center Admin'), getOrg, getCenterOrgs);

/**
 * @swagger
 * /organizations:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All organizations fetched successfully
 */
router.get('/', authorizeRoles('Super Admin'), getAllOrgs);

router.patch('/:id', authorizeRoles('Super Admin', 'Center Admin'), updateOrganization);
router.delete('/:id', authorizeRoles('Super Admin'), deleteOrganization);
router.get('/:id/info', authorizeRoles('Super Admin', 'Center Admin'), getOrganizationInfo);

export default router;