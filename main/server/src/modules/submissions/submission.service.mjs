import * as submissionRepository from './submission.repository.mjs';
import * as formRepository from '../forms/form.repository.mjs';
import { isQuestionVisible } from '../../shared/utils/logicEvaluator.mjs';
import { AppError } from '../../shared/utils/errors.mjs';

const validateSubmissionAnswers = async (formId, answers) => {
    const questions = await formRepository.getQuestionsByFormId(formId);

    const userAnswersDict = {};
    if (answers) {
        answers.forEach(ans => {
            userAnswersDict[ans.questionId.toString()] = ans.value;
        });
    }

    for (const question of questions) {
        // Check if logic exists and evaluate visibility
        const isVisible = isQuestionVisible(question.logic, userAnswersDict);

        // Crucial Business Logic: Bypass 'isRequired' check if question is hidden
        if (!isVisible) {
            continue;
        }

        if (question.isRequired) {
            const answer = userAnswersDict[question._id.toString()];
            if (answer === undefined || answer === null || answer === '') {
                throw new AppError(`Field '${question.label}' is required.`, 400);
            }
        }
    }
};

//Direct entry validation execution handler
export const createSubmission = async (submissionData) => {
    // Enforce required fields validation before accepting submission
    if (submissionData.status === 'SUBMITTED') {
        await validateSubmissionAnswers(submissionData.formId, submissionData.answers);
    }

    return await submissionRepository.create(submissionData);
};

//Check constraints and modifies a running entry draft
export const updateDraft = async (submissionId, currentUserId, updateData)=>{
    const submission = await submissionRepository.findById(submissionId);
    if(!submission){
        throw new AppError('SUBMISSION_NOT_FOUND', 404);
    }
    // sirf origi. creator hi draft touch kar sakta he 
    if(submission.userId.toString() !== currentUserId.toString()){
        throw new AppError('UNAUTHORIZED_DRAFT_ACCESS', 403);
    }
    // cant submit again 
    if(submission.status === 'SUBMITTED'){
        throw new AppError('SUBMISSION_LOCKED', 400);
    }

    // Merge answers to validate complete state if transitioning to SUBMITTED
    if (updateData.status === 'SUBMITTED') {
        const mergedAnswers = updateData.answers || submission.answers;
        await validateSubmissionAnswers(submission.formId, mergedAnswers);
    }

    return await submissionRepository.update(submissionId, updateData);
};
export const getFormSubmissions = async (filter, paginationOptions) => {
  return await submissionRepository.findPaginated(filter, paginationOptions);
};