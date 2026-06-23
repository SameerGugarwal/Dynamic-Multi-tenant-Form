import * as questionService from './question.service.mjs';
import { successResponse, errorResponse } from '../../shared/utils/apiResponse.mjs';

export const addQuestion = async (req, res, next) => {
    try{
        const {formId, label, fieldType, order}= req.body;
        if(!formId || !label || !fieldType || order === undefined){
            return errorResponse(res, 400, 'formId, label, fieldType, and order are required.');
        }
        const question = await questionService.createQuestion(req.body);
        return successResponse(res, 201, 'Question added successfully', question);

    }catch(error){
        next(error);
    }
};

export const fetchFormQuestions = async (req, res, next) => {
    try{
        const questions = await questionService.getQuestionsByForm(req.params.formId);
        return successResponse(res, 200, 'Questions fetched successfully', { count: questions.length, data: questions });
    }catch(error){
        next(error);
    }
};