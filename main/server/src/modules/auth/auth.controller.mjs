import * as authService from './auth.service.mjs';
import { successResponse, errorResponse } from '../../shared/utils/apiResponse.mjs';

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        return successResponse(res, 200, 'Login successful', result);
    } catch (error) {
        if (error.message === 'User not found' || error.message === 'Invalid credentials' || error.message === 'User is not active') {
            return errorResponse(res, 401, error.message);
        }
        next(error);
    }
};

export const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        return successResponse(res, 201, 'Registration successful', result);
    } catch (error) {
        if (error.message === 'Email already registered' || error.message === 'Invalid role specified') {
            return errorResponse(res, 400, error.message);
        }
        next(error);
    }
};