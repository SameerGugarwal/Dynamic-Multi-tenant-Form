import { Question } from "../../database/index.mjs";

export const createQuestion = async (questionData) => {
    return await Question.create(questionData);
};

export const findQuestionsByForm = async (formId) => {
    // Handle both formId and formID casings just in case
    return await Question.find({ $or: [{ formId: formId }, { formID: formId }] }).sort({ order: 1 });
};
