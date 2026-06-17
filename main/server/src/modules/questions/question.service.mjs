import * as questionRepo from './question.repository.mjs';
import * as formService from '../forms/form.service.mjs';

// add a que to a specific form 
export const createQuestion = async (questionData) => {
    const formId = questionData.formId || questionData.formID;
    const form = await formService.getFormById(formId);
    if (!form) {
        throw new Error('Form not found');
    }
    // create dyn. ques.
    return await questionRepo.createQuestion(questionData);
};
export const getQuestionsByForm = async (formId) => {
    return await questionRepo.findQuestionsByForm(formId);
};