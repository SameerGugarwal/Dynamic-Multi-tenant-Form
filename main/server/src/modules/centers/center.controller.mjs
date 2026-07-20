// controlling the center 

import * as centerService from './center.service.mjs';
import { successResponse, errorResponse } from '../../shared/utils/apiResponse.mjs';

export const createCenter = async (req, res, next) => {
    try{
        const center = await centerService.createCenter(req.body);  
        return successResponse(res, 201, 'Center created successfully', center);
    }catch(error){
        if (error.message === 'Center already exists') {
            return errorResponse(res, 400, error.message);
        }
        next(error);
    }
};
export const getCenter = async (req, res, next ) =>{
    try{
        const centers = await centerService.getAllCenters();
        return successResponse(res, 200, 'Centers fetched successfully', centers);
    }catch(error){
        next(error);
    }
};

export const updateCenter = async (req, res, next) => {
    try {
        const centerId = req.params.id;
        const updatedCenter = await centerService.updateCenter(centerId, req.body);
        if (!updatedCenter) {
            return errorResponse(res, 404, 'Center not found');
        }
        return successResponse(res, 200, 'Center updated successfully', updatedCenter);
    } catch(error) {
        next(error);
    }
};

export const getSettings = async (req, res, next) => {
    try {
        const centerId = req.user.centerId;
        if (!centerId) return errorResponse(res, 400, 'User is not associated with a center');
        const center = await centerService.getCenterById(centerId);
        return successResponse(res, 200, 'Center settings fetched successfully', center);
    } catch(error) {
        next(error);
    }
};

export const updateSettings = async (req, res, next) => {
    try {
        const centerId = req.user.centerId;
        if (!centerId) return errorResponse(res, 400, 'User is not associated with a center');
        
        const updateData = {
            name: req.body.name,
            contactEmail: req.body.contactEmail,
            defaultTimezone: req.body.defaultTimezone
        };

        const updatedCenter = await centerService.updateCenter(centerId, updateData);
        return successResponse(res, 200, 'Center settings updated successfully', updatedCenter);
    } catch(error) {
        next(error);
    }
};

export const deleteCenter = async (req, res, next) => {
    try {
        await centerService.deleteCenter(req.params.id);
        return successResponse(res, 200, 'Center deleted successfully');
    } catch(error) {
        next(error);
    }
};