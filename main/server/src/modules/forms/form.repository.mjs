import { Form, Organization } from "../../database/index.mjs";
import Question from '../../database/models/Question.model.mjs';

// create a form
export const createForm = async (formData) => {
    return await Form.create(formData);
};
//Fetch Master Templates
export const getMasterForms = async (query={})=>{
    return await Form.find({clonedFromId: null, ...query}).sort({createdAt: -1});
};
//Fetch Local Forms
export const getOrgForms = async (organizationId) =>{
    return await Form.find({organizationId}).sort({createdAt: -1});
};
// form by specific ID
export const getFormById = async (formId) => {
    return await Form.findById(formId);
};
//Duplicate the Form Container 
export const createClonedForm = async (formCloneData) => {
    return await Form.create(formCloneData);
};
//Deep Clone all associated questions
export const getQuestionsByFormId = async (formId) => {
    return await Question.find({formId});
};

export const insertQuestions = async (clonedQuestions) => {
    return await Question.insertMany(clonedQuestions);
};

// update form details 
export const updateForm = async (formId, updateData) => {
    return await Form.findByIdAndUpdate(formId, updateData, { new: true , runValidators: true });
};
// deleteing the form 
export const deleteForm = async (formId) => {
    await Question.deleteMany({ formId });
    return await Form.findByIdAndDelete(formId);
};
