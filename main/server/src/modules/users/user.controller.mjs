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
        if (req.user.role?.name === 'Super Admin') {
            return errorResponse(res, 403, "Super Admins cannot view organization-specific users.");
        }
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

export const getAllUsersController = async (req, res, next) => {
    try {
        if (req.user.role?.name !== 'Super Admin') {
            return errorResponse(res, 403, "Only Super Admins can view all users.");
        }
        const users = await userService.getAllUsers();
        return successResponse(res, 200, 'All users fetched successfully', users);
    } catch(error) {
        next(error);
    }
};

import bcrypt from 'bcrypt';
import User from '../../database/models/User.model.mjs';

export const adminResetPassword = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
            return errorResponse(res, 400, "Password must be at least 6 characters.");
        }

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(res, 404, "User not found.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.passwordHash = hashedPassword;
        // Optionally invalidate refresh token so they are forced to log in again
        user.refreshToken = null; 
        await user.save();

        return successResponse(res, 200, "Password reset successfully.", null);
    } catch (error) {
        next(error);
    }
};

export const deleteUserController = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        return successResponse(res, 200, 'User deleted successfully');
    } catch(error) {
        next(error);
    }
};