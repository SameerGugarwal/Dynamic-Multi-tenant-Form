import * as formRepo from './form.repository.mjs';
import { AppError } from '../../shared/utils/errors.mjs';

// create a form
export const createForm = async (formData) => {
    return await formRepo.createForm(formData);
};
//Fetch Master Templates
export const getMasterForms = async (query={})=>{
    return await formRepo.getMasterForms(query);
};
//Fetch Local Forms
export const getOrgForms = async (OrganizationID) =>{
    return await formRepo.getOrgForms(OrganizationID);
};
// form by specific ID
export const getFormById = async (formId) => {
    return await formRepo.getFormById(formId);
};
//Deep Clone a Form AND its Questions
export const cloneMasterForm = async (masterFormId, organizationId, userId) => {
    const masterForm = await formRepo.getFormById(masterFormId);
    if(!masterForm || masterForm.clonedFromId !== null){
        throw new AppError('Invalid Master Form ID. Only Master templates can be cloned.', 400);
    }
    //Duplicate the Form Container 
    const clonedForm = await formRepo.createClonedForm({
        title: `${masterForm.title} (Local Copy)`,
        description: masterForm.description,
        isMaster: false,
        clonedFromId: masterForm._id,
        organizationId: organizationId,
        createdBy: userId,
        visibility: 'PRIVATE',
        status: 'DRAFT'
    });
    //Deep Clone all associated questions
    const masterQuestions = await formRepo.getQuestionsByFormId(masterFormId);
    if(masterQuestions.length > 0){
        const clonedQuestions = masterQuestions.map(q =>({
            formId: clonedForm._id, // Point them to the new local clone!
            label: q.label,
            fieldType: q.fieldType,
            isRequired: q.isRequired,
            order: q.order,
            options: q.options,
            validationRules: q.validationRules
        }));
        // sare ques database me dalo ek bar me 
        await formRepo.insertQuestions(clonedQuestions);
    }      
    return clonedForm;
};

// update form details 
export const updateForm = async (formId, updateData) => {
    return await formRepo.updateForm(formId, updateData);
};
// deleteing the form 
export const deleteForm = async (formId) => {
    return await formRepo.deleteForm(formId);
};