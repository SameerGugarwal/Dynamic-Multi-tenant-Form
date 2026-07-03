import * as submissionService from './submission.service.mjs';
import * as reportService from '../reports/report.service.mjs';
import { successResponse } from '../../shared/utils/apiResponse.mjs';
import { getPaginationOptions, formatPagination } from '../../shared/utils/pagination.mjs';
import { AppError } from '../../shared/utils/errors.mjs';

/*
// --- User's Original Code ---
export const createSubmission = async (req, res, next) => {
    try{
        const {formId , status, answers} = req.body;

        const organizationId = req.user.organizationId || req.body.organizationId;
        if(!organizationId){
            return res.status(400).json({
                success: false,
                message: 'ORGANIZATION_ID_MISSING'
            });
        }
        const data = await submissionService.createSubmission({
            formId,
            userId: req.user._id || req.user.id,
            organizationId,
            status: status || 'DRAFT',
            answers
        });
        return successResponse(res, 201, true, "Form submission processed successfully", data);
    }catch(error){
        next(error);
    }
};

export const updateDraft = async (req, res, next) => {
    try{
        const currentUserId = req.user._id || req.user.id;
        const data = await submissionService.updateDraft(req.params.id, currentUserId, req.body);
        return successResponse(res, 200, true, "Form submission processed successfully", data);

    }catch(error){
        if (error.message === 'SUBMISSION_NOT_FOUND') return res.status(404).json({ success: false, message: "Submission records not found." });
        if (error.message === 'UNAUTHORIZED_DRAFT_ACCESS') return res.status(403).json({ success: false, message: "Unauthorized to mutate this draft entity." });
        if (error.message === 'SUBMISSION_LOCKED') return res.status(400).json({ success: false, message: "Cannot modify a locked finalized record." });
    
        next(error);
    }
};

export const fetchFormSubmissions = async (req, res, next) => {
  try {
    const { formId } = req.params;
    const { status } = req.query;
    
    let organizationId = req.user.organizationId;
    
    // Cross-tenant data extraction capability configuration for Super Admins
    if (req.user.role.name === 'Super Admin') {
      organizationId = req.query.organizationId;
      if (!organizationId) {
        return res.status(400).json({ success: false, message: "Super Admins must supply an organizationId query parameter." });
      }
    }

    // Leveraging your exact shared input pagination utility
    const paginationOptions = getPaginationOptions(req.query);
    
    const filter = { formId, organizationId };
    if (status) filter.status = status;

    const { total, data } = await submissionService.getFormSubmissions(filter, paginationOptions);

    // Formulating response with your exact shared layout formatter
    const meta = formatPagination(total, paginationOptions.page, paginationOptions.limit);

    return successResponse(res, 200, true, "Submissions profile compiled successfully", { list: data, pagination: meta });
  } catch (error) {
    next(error);
  }
};
// --- End User's Original Code ---
*/

/*
// --- Previous createSubmission without report trigger ---
export const createSubmission = async (req, res, next) => {
    try {
        const { formId, status, answers } = req.body;

        const organizationId = req.user.organizationId || req.body.organizationId;
        if (!organizationId) {
            throw new AppError('ORGANIZATION_ID_MISSING', 400);
        }
        const data = await submissionService.createSubmission({
            formId,
            userId: req.user._id || req.user.id,
            organizationId,
            status: status || 'DRAFT',
            answers
        });
        return successResponse(res, 201, "Form submission processed successfully", data);
    } catch (error) {
        next(error);
    }
};
// --- End Previous createSubmission ---
*/

export const createSubmission = async (req, res, next) => {
    try {
        const { formId, status, answers } = req.body;

        const organizationId = req.user.organizationId || req.body.organizationId;
        if (!organizationId) {
            throw new AppError('ORGANIZATION_ID_MISSING', 400);
        }
        const data = await submissionService.createSubmission({
            formId,
            userId: req.user._id || req.user.id,
            organizationId,
            status: status || 'DRAFT',
            answers
        });

        // Trigger Instant Report Pipeline (Non-Blocking execution)
        if (data && data._id) {
            reportService.generateInstantUserReport(data._id)
                .catch(err => console.error('[Report Engine] Instant Generation Failed:', err.message));
        }

        return successResponse(res, 201, "Form submission processed successfully", data);
    } catch (error) {
        next(error);
    }
};

export const updateDraft = async (req, res, next) => {
    try {
        const currentUserId = req.user._id || req.user.id;
        const data = await submissionService.updateDraft(req.params.id, currentUserId, req.body);
        return successResponse(res, 200, "Form submission processed successfully", data);
    } catch (error) {
        next(error);
    }
};

export const fetchFormSubmissions = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const { status } = req.query;
        
        let filter = {};
        if (status) filter.status = status;
        
        const { default: Form } = await import('../../database/models/Form.model.mjs');
        const form = await Form.findById(formId);
        if (!form) throw new AppError("Form not found", 404);

        if (form.isMaster || form.clonedFromId === null) {
            const clones = await Form.find({ clonedFromId: form._id }).select('_id');
            const cloneIds = clones.map(c => c._id);
            // Include master form ID just in case it has direct submissions
            cloneIds.push(form._id);
            filter.formId = { $in: cloneIds };

            if (req.user.role.name === 'Center Admin') {
                const { default: Organization } = await import('../../database/models/Organization.model.mjs');
                const orgs = await Organization.find({ centers: req.user.centerId }).select('_id');
                filter.organizationId = { $in: orgs.map(o => o._id) };
            } else if (req.user.role.name === 'Organization Admin') {
                filter.organizationId = req.user.organizationId;
            }
        } else {
            filter.formId = formId;
            if (req.user.role.name !== 'Super Admin') {
                if (req.user.role.name === 'Center Admin') {
                    const { default: Organization } = await import('../../database/models/Organization.model.mjs');
                    const orgs = await Organization.find({ centers: req.user.centerId }).select('_id');
                    filter.organizationId = { $in: orgs.map(o => o._id) };
                } else {
                    filter.organizationId = req.user.organizationId;
                }
            }
        }

        const paginationOptions = getPaginationOptions(req.query);
        const { total, data } = await submissionService.getFormSubmissions(filter, paginationOptions);
        const meta = formatPagination(total, paginationOptions.page, paginationOptions.limit);

        return successResponse(res, 200, "Submissions profile compiled successfully", { list: data, pagination: meta });
    } catch (error) {
        next(error);
    }
};