import * as reportService from './report.service.mjs';
import { successResponse } from '../../shared/utils/apiResponse.mjs';
import { AppError } from '../../shared/utils/errors.mjs';

export const fetchUserReports = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const currentUserId = req.user._id || req.user.id;
        
        // RBAC Security Filter: Only Super Admins or the owning user can fetch
        if (req.user.role.name !== 'Super Admin' && String(currentUserId) !== String(userId)) {
            throw new AppError('Unauthorized to view these reports', 403);
        }

        const reports = await reportService.getUserReports(userId);
        return successResponse(res, 200, "User reports compiled successfully", reports);
    } catch (error) {
        next(error);
    }
};

export const downloadReport = async (req, res, next) => {
    try {
        const { submissionId } = req.params;
        const { format } = req.query; // e.g. ?format=pdf or ?format=excel

        if (!['pdf', 'excel'].includes(format)) {
            throw new AppError('Invalid format. Use "pdf" or "excel".', 400);
        }

        const buffer = await reportService.exportReport(submissionId, format);

        if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=report-${submissionId}.pdf`);
        } else if (format === 'excel') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=report-${submissionId}.xlsx`);
        }

        return res.send(buffer);
    } catch (error) {
        next(error);
    }
};
