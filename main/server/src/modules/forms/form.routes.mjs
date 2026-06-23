import express from 'express';
import { createNewForm, fetchMasterForms, fetchMyOrgForms, cloneFormToOrg, updateFormDetails, deleteFormRecord } from './form.controller.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';
import { authorizeRoles } from '../../middleware/role.middleware.mjs';

const router = express.Router();
router.use(protect);

// for creating a form if superAdmin = master temp if org = local
/**
 * @swagger
 * /forms:
 *   post:
 *     summary: Create a new form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Form created successfully
 */
router.post('/',authorizeRoles('Organization Admin', 'Center Admin', 'Super Admin'), createNewForm);

// View  Template Library
/**
 * @swagger
 * /forms/master:
 *   get:
 *     summary: Fetch master forms
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Master forms fetched successfully
 */
router.get('/master',authorizeRoles('Organization Admin', 'Center Admin', 'Super Admin'), fetchMasterForms);

// View Local Company Forms
/**
 * @swagger
 * /forms/organization:
 *   get:
 *     summary: Fetch organization forms
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization forms fetched successfully
 */
router.get('/organization',authorizeRoles('Organization Admin', 'Center Admin'), fetchMyOrgForms);

//Deep Clone a Master Form
/**
 * @swagger
 * /forms/clone:
 *   post:
 *     summary: Deep clone a master form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Form cloned successfully
 */
router.post('/clone',authorizeRoles('Organization Admin', 'Center Admin'), cloneFormToOrg);

//Update a Form
/**
 * @swagger
 * /forms/{id}:
 *   put:
 *     summary: Update form details
 *     tags: [Forms]
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
 *         description: Form updated successfully
 */
router.put('/:id',authorizeRoles('Organization Admin', 'Center Admin'), updateFormDetails);

/*
// --- User's Original Code ---
//Delete a Form 
router.put('/:id',authorizeRoles('Organization Admin', 'Center Admin'), deleteFormRecord);
// --- End User's Original Code ---
*/

//Delete a Form 
/**
 * @swagger
 * /forms/{id}:
 *   delete:
 *     summary: Delete a form
 *     tags: [Forms]
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
 *         description: Form deleted successfully
 */
router.delete('/:id',authorizeRoles('Organization Admin', 'Center Admin'), deleteFormRecord);

export default router;
