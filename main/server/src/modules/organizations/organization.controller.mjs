import * as organizationService from './organization.service.mjs';
import { successResponse, errorResponse } from '../../shared/utils/apiResponse.mjs';

// org ko useke ceneter se connect karo 

export const createNewOrg = async (req, res, next) => {
    try{
        let assignedCenters = req.body.centers || [];
        if (req.user.centerId && !assignedCenters.includes(req.user.centerId)) {
            assignedCenters.push(req.user.centerId);
        }
        if (assignedCenters.length === 0) {
            return errorResponse(res, 400, 'An organization must belong to at least one center.');
        }
        const orgData = {
            ...req.body, 
            centers: assignedCenters
        };
        const org = await organizationService.createOrganization(orgData);
        return successResponse(res, 201, 'Organization created successfully', org);
    }catch(error){
        next(error);
    }
};
// x center me uske hi org load ho .. 
export const getOrg = async (req, res, next) => {
    try{
        const orgs = await organizationService.getOrganizationsByCenter(req.user.centerId);
        return successResponse(res, 200, 'Organizations fetched successfully', orgs);
    }catch(error){
        next(error);
    }
};

export const getAllOrgs = async (req, res, next) => {
    try{
        const centerId = req.query.centerId;
        const orgs = centerId 
            ? await organizationService.getOrganizationsByCenter(centerId)
            : await organizationService.getAllOrganizations();
        return successResponse(res, 200, 'Organizations fetched', { count: orgs.length, data: orgs });
    }catch(error){
        next(error);
    }
};

export const getCenterOrgs = async (req, res, next) => {
    try {
        const orgs = await organizationService.getOrganizationsByCenter(req.user.centerId);
        return successResponse(res, 200, 'Center organizations fetched', { count: orgs.length, data: orgs });
    } catch (error) {
        next(error);
    }
};

export const updateOrganization = async (req, res, next) => {
    try {
        const orgId = req.params.id;
        const updatedOrg = await organizationService.updateOrganization(orgId, req.body);
        if (!updatedOrg) return errorResponse(res, 404, 'Organization not found');
        return successResponse(res, 200, 'Organization updated successfully', updatedOrg);
    } catch(error) {
        next(error);
    }
};

export const getOrganizationInfo = async (req, res, next) => {
    try {
        const orgId = req.params.id;
        const info = await organizationService.getOrganizationInfo(orgId);
        if (!info) return errorResponse(res, 404, 'Organization not found');
        return successResponse(res, 200, 'Organization info fetched', info);
    } catch(error) {
        next(error);
    }
};

export const deleteOrganization = async (req, res, next) => {
    try {
        await organizationService.deleteOrganization(req.params.id);
        return successResponse(res, 200, 'Organization deleted successfully');
    } catch(error) {
        next(error);
    }
};
