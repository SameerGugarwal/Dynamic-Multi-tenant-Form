//The controller automatically detects who is creating the form and sets isMaster and organizationId correctly so the user doesn't have to

import * as formService from './form.service.mjs';
import * as userService from '../users/user.service.mjs';
import { successResponse, errorResponse } from '../../shared/utils/apiResponse.mjs';

export const getFormRecord = async (req, res, next) => {
    try {
        const formId = req.params.id;
        const form = await formService.getFormById(formId);
        if(!form) return errorResponse(res, 404, "Form not found");
        return successResponse(res, 200, "Form fetched successfully", form);
    } catch(error) {
        next(error);
    }
};

export const createNewForm = async (req, res, next) => {
    try{

        const userID = req.user._id || req.user.id;
        const currentUser = await userService.getUserById(userID);
        const isSuperAdmin = currentUser?.role?.name === 'Super Admin';
        const organizationId = isSuperAdmin ? null : currentUser.organizationId;
        
        // Prevent multiple clones of the same master form by an organization
        if (req.body.clonedFromId && organizationId) {
            const existingClone = await formService.getOrgForms(organizationId);
            const hasCloned = existingClone.some(f => String(f.clonedFromId) === String(req.body.clonedFromId));
            if (hasCloned) {
                return errorResponse(res, 400, "Your organization has already cloned this master template.");
            }
        }

        // apane app form banjaye ga
        const formData = {
            ...req.body,
            createdBy:userID,
            //super admin he tho master temp , otherwise it belongs to an org 
            isMaster: isSuperAdmin,
            organizationId: organizationId,
            //new form by defauld is DRAFT jab tak ready nahi he 
            status: req.body.status || 'DRAFT'
        };
        const createForm = await formService.createForm(formData);
        return successResponse(res, 201, 'Form created successfully', createForm);
    }catch(error){
        next(error);
    }
};
// export const createNewForm = async (req, res, next) => {
//   try {
//     const userId = req.user._id || req.user.id;
//     const currentUser = await User.findById(userId).populate('role', 'name');
//     const isSuperAdmin = currentUser?.role?.name === 'Super Admin';

//     const formData = {
//       ...req.body,
//       createdBy: userId,
//       isMaster: isSuperAdmin,
//       organizationId: isSuperAdmin ? null : currentUser.organizationId,
//       status: req.body.status || 'DRAFT' 
//     };

//     // Notice: We define it as 'createdForm' here...
//     const createdForm = await formService.createForm(formData);
    
//     // ...and we use 'createdForm' here. They match perfectly!
//     res.status(201).json({ success: true, data: createdForm });
//   } catch (error) {
//     next(error);
//   }
// };

export const fetchMasterForms = async (req, res, next) => {
    try{
        const userID = req.user._id || req.user.id;
        const currentUser = await userService.getUserById(userID);
        const isSuperAdmin = currentUser?.role?.name === 'Super Admin';
        //visibility
        const query = isSuperAdmin? {} : { visibility: 'PUBLIC' }
        const form = await formService.getMasterForms(query);
        return successResponse(res, 200, 'Master forms fetched successfully', form);
    }catch(error){
        next(error);
    }
};
// super admin kisi org ka pvt form na dhek paye !
export const fetchMyOrgForms = async (req, res, next) => {
    try{
        if (req.user.role?.name === 'Super Admin') {
            return errorResponse(res, 403, "Super Admins are restricted from viewing local organization forms.");
        }
        const userID = req.user._id || req.user.id;
        const currentUser = await userService.getUserById(userID);
        if(!req.user.organizationId){
            return errorResponse(res, 403, 'You do not belong to this organization / Super-Admin is not allowed to access this route');
        }
        let forms = await formService.getOrgForms(req.user.organizationId);
        
        // If the requester is a standard User, attach completion status to each form
        if (req.user.role?.name === 'User') {
            const { default: Submission } = await import('../../database/models/Submission.model.mjs');
            const userSubmissions = await Submission.find({ userId: userID }).select('formId');
            const completedFormIds = userSubmissions.map(s => s.formId.toString());
            
            // Convert mongoose documents to plain objects to attach the field
            forms = forms.map(f => {
                const formObj = f.toObject ? f.toObject() : f;
                formObj.isCompleted = completedFormIds.includes(formObj._id.toString());
                return formObj;
            });
        }
        
        return successResponse(res, 200, 'Org forms fetched successfully', forms);
    }catch(error){
        next(error);
    }
};
// Center Admin assigns form to org
export const assignFormToOrg = async (req, res, next) => {
    try {
        const { masterFormId, targetOrgId } = req.body;
        if (req.user.role.name !== 'Center Admin') {
            return errorResponse(res, 403, 'Only Center Admins can assign forms.');
        }
        if (!targetOrgId) {
            return errorResponse(res, 400, 'Target Organization ID is required.');
        }

        const masterForm = await formService.getFormById(masterFormId);
        if (!masterForm || masterForm.clonedFromId !== null) {
            return errorResponse(res, 400, 'Invalid Master Form ID.');
        }

        if (!masterForm.assignedOrgs.includes(targetOrgId)) {
            masterForm.assignedOrgs.push(targetOrgId);
            await masterForm.save();
        }

        return successResponse(res, 200, "Form assigned successfully");
    } catch(error) {
        next(error);
    }
};

// Org Admin fetches forms assigned to their organization
export const fetchAssignedForms = async (req, res, next) => {
    try {
        if (req.user.role.name !== 'Organization Admin') {
            return errorResponse(res, 403, 'Only Organization Admins can view assigned forms.');
        }

        const orgID = req.user.organizationId;
        const assignedForms = await formService.getMasterForms({ assignedOrgs: orgID });
        return successResponse(res, 200, "Assigned forms fetched successfully", assignedForms);
    } catch(error) {
        next(error);
    }
};

// Org Admin clones assigned form
export const cloneFormToOrg = async (req, res, next) => {
    try{
        const { masterFormId } = req.body;
        const userID = req.user._id || req.user.id;
        
        if (req.user.role.name !== 'Organization Admin') {
            return errorResponse(res, 403, 'Only Organization Admins can clone forms.');
        }

        const orgID = req.user.organizationId;
        const masterForm = await formService.getFormById(masterFormId);
        
        if (!masterForm || !masterForm.assignedOrgs.includes(orgID)) {
            return errorResponse(res, 403, 'This form has not been assigned to your organization.');
        }

        const newClone = await formService.cloneMasterForm(masterFormId, orgID, userID);
        return successResponse(res, 201, "Form cloned successfully", newClone);
    }catch(error){
        next(error);
    }
};
// updating the form 
export const updateFormDetails = async (req, res, next) => {
    try{
        const formId = req.params.id;
        const form = await formService.getFormById(formId);
        if(!form){
            return errorResponse(res, 404, "Form not found");
        }
        if(req.user.role.name !== 'Super Admin' && String(form.organizationId) !== String(req.user.organizationId)){
            return errorResponse(res, 403, "You are not authorized to update this form");
        }
        const updatedForm = await formService.updateForm(formId, req.body);
        return successResponse(res, 200, "Form updated successfully", updatedForm);
    }catch(error){
        next(error);
    }
};
// deleting the form 
export const deleteFormRecord = async (req, res, next) => {
    try{
        const formId = req.params.id;
        const form = await formService.getFormById(formId);
        if(!form){
            return errorResponse(res, 404, "Form not found");
        }
        if(req.user.role.name !== 'Super Admin' && String(form.organizationId) !== String(req.user.organizationId)){
            return errorResponse(res, 403, "You are not authorized to delete this form");
        }
        await formService.deleteForm(formId);
        return successResponse(res, 200, "Form deleted successfully");
    }catch(error){
        next(error);
    }
};