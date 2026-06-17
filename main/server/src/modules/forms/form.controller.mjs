//The controller automatically detects who is creating the form and sets isMaster and organizationId correctly so the user doesn't have to

import * as formService from './form.service.mjs';
import * as userService from '../users/user.service.mjs';
import { successResponse, errorResponse } from '../../shared/utils/apiResponse.mjs';

export const createNewForm = async (req, res, next) => {
    try{

        const userID = req.user._id || req.user.id;
        const currentUser = await userService.getUserById(userID);
        const isSuperAdmin = currentUser?.role?.name === 'superadmin';
        // apane app form banjaye ga
        const formData = {
            ...req.body,
            createdBy:userID,
            //super admin he tho master temp , otherwise it belongs to an org 
            isMaster: isSuperAdmin,
            OrganizationID: isSuperAdmin? null : currentUser.organizationId,
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
        const isSuperAdmin = currentUser?.role?.name === 'superadmin';
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
        const userID = req.user._id || req.user.id;
        const currentUser = await userService.getUserById(userID);
        if(!req.user.OrganizationID){
            return errorResponse(res, 403, 'You do not belong to this organization / Super-Admin is not allowed to access this route');
        }
        const form = await formService.getOrgForms(req.user.OrganizationID);
        return successResponse(res, 200, 'Org forms fetched successfully', form);
    }catch(error){
        next(error);
    }
};
// cloning form to org 
export const cloneFormToOrg = async (req, res, next) => {
    try{
        const {masterFormId} = req.body;
        const userID = req.user._id || req.user.id;
        const orgID = req.user.OrganizationID;

        if(!orgID){
            return errorResponse(res, 403, 'Super Admins cannot clone forms. Only local organizations can clone.');
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
        const formID = req.params.id;
        const form = await formService.getFormById(formID);
        if(!form){
            return errorResponse(res, 404, "Form not found");
        }
        if(req.user.role.name !== 'superadmin' && String(form.OrganizationID) !== String(req.user.OrganizationID)){
            return errorResponse(res, 403, "You are not authorized to update this form");
        }
        const updatedForm = await formService.updateForm(formID, req.body);
        return successResponse(res, 200, "Form updated successfully", updatedForm);
    }catch(error){
        next(error);
    }
};
// deleting the form 
export const deleteFormRecord = async (req, res, next) => {
    try{
        const formID = req.params.id;
        const form = await formService.getFormById(formID);
        if(!form){
            return errorResponse(res, 404, "Form not found");
        }
        if(req.user.role.name !== 'superadmin' && String(form.OrganizationID) !== String(req.user.OrganizationID)){
            return errorResponse(res, 403, "You are not authorized to delete this form");
        }
        await formService.deleteForm(formID);
        return successResponse(res, 200, "Form deleted successfully");
    }catch(error){
        next(error);
    }
};