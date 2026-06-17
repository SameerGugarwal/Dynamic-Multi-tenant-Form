//extracts the data from the incoming HTTP request and passes it to our service

import * as userService from './user.service.mjs';
import { successResponse, errorResponse } from '../../shared/utils/apiResponse.mjs';

export const createNewUser = async (req, res, next) => {
    try{
        const userData ={
            ...req.body,
           organizationId: req.user.organizationId || req.body.organizationId,
        };
        const newUser = await userService.createUser(userData);
        return successResponse(res, 201, 'User created successfully', newUser);
    }catch(error){
        next(error);
    }
};
// sending user data to its org. 
export const getOrgUser = async (req, res, next) => {
    try{
        const user = await userService.getUserByOrganization(req.user.organizationId);
        return successResponse(res, 200, 'User fetched successfully', user);
    }catch(error){
        next(error);
    }
};

// update a user 
export const updateUser = async (req, res, next) => {
    try{
        const userId = req.params.id;
        const updateUser = await userService.updateUser(userId, req.body);
        return successResponse(res, 200, 'User updated successfully', updateUser);
    }catch(error){
        next(error);
    }

};