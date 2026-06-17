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
        const org = await organizationService.getAllOrganizations();
        // Since successResponse doesn't have a count parameter natively, we can wrap the data
        return successResponse(res, 200, 'All organizations fetched', { count: org.length, data: org });
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