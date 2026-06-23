import * as reportRepo from './report.repository.mjs';
import * as submissionRepo from '../submissions/submission.repository.mjs';
import * as userService from '../users/user.service.mjs';
import * as formRepo from '../forms/form.repository.mjs';
import { generatePDF } from './pdf.generator.mjs';
import { generateExcel } from './excel.generator.mjs';
import { AppError } from '../../shared/utils/errors.mjs';

export const generateInstantUserReport = async (submissionId) => {
    // 1. Fetch the newly saved submission
    const submission = await submissionRepo.findById(submissionId);
    if (!submission) {
        throw new AppError('Submission not found', 404);
    }

    // 2. Resolve user identity
    const user = await userService.getUserById(submission.userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // 3. Compile payload document
    const reportData = {
        name: `Instant Report - ${user.name} - ${new Date().toISOString()}`,
        generatedBy: user._id,
        organizationId: submission.organizationId,
        formId: submission.formId,
        format: 'HTML', // Defaulting to HTML for instant view logic
        status: 'COMPLETED',
        fileUrl: `/reports/view/${submissionId}`
    };

    // 4. Commit to database
    return await reportRepo.createReport(reportData);
};

export const getUserReports = async (userId) => {
    return await reportRepo.getReportsByUser(userId);
};

export const exportReport = async (submissionId, format) => {
    const submission = await submissionRepo.findById(submissionId);
    if (!submission) {
        throw new AppError('Submission not found', 404);
    }

    const user = await userService.getUserById(submission.userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    let form = null;
    if (submission.formId) {
        form = await formRepo.getFormById(submission.formId);
        // also get questions
        if (form) {
            form.questions = await formRepo.getQuestionsByFormId(submission.formId);
        }
    }

    if (format === 'pdf') {
        return await generatePDF(submission, user, form);
    } else if (format === 'excel') {
        return await generateExcel(submission, user, form);
    } else {
        throw new AppError('Unsupported format. Please request pdf or excel.', 400);
    }
};
