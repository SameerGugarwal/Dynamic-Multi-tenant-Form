import express from 'express';
import { createNewForm, fetchMasterForms, fetchMyOrgForms, cloneFormToOrg, updateFormDetails, deleteFormRecord } from './form.controller.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';
import { authorizeRoles } from '../../middleware/role.middleware.mjs';

const router = express.Router();
router.use(protect);

// for creating a form if superAdmin = master temp if org = local
router.post('/',authorizeRoles('Organization Admin', 'Center Admin', 'Super Admin'), createNewForm);

// View  Template Library
router.get('/master',authorizeRoles('Organization Admin', 'Center Admin', 'Super Admin'), fetchMasterForms);

// View Local Company Forms
router.get('/organization',authorizeRoles('Organization Admin', 'Center Admin'), fetchMyOrgForms);

//Deep Clone a Master Form
router.post('/clone',authorizeRoles('Organization Admin', 'Center Admin'), cloneFormToOrg);

//Update a Form
router.put('/:id',authorizeRoles('Organization Admin', 'Center Admin'), updateFormDetails);

//Delete a Form 
router.put('/:id',authorizeRoles('Organization Admin', 'Center Admin'), deleteFormRecord);
export default router;
