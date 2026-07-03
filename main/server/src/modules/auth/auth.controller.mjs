import * as authService from './auth.service.mjs';
import { successResponse, errorResponse } from '../../shared/utils/apiResponse.mjs';

/*
// --- User's Original Code ---
// (Previously commented out)
// --- End User's Original Code ---
*/

const setRefreshTokenCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'strict', // 'None' required for cross-domain cookies on Render
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        
        setRefreshTokenCookie(res, result.refreshToken);

        return successResponse(res, 200, 'Login successful', {
            user: result.user,
            accessToken: result.accessToken
        });
    } catch (error) {
        next(error);
    }
};

export const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        
        setRefreshTokenCookie(res, result.refreshToken);

        return successResponse(res, 201, 'Registration successful', {
            user: result.user,
            accessToken: result.accessToken
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        const result = await authService.refreshTokenService(token);
        
        setRefreshTokenCookie(res, result.refreshToken);

        return successResponse(res, 200, 'Token refreshed successfully', {
            accessToken: result.accessToken
        });
    } catch (error) {
        next(error);
    }
};
export const requestPasswordReset = async (req, res, next) => {
    try {
        await authService.requestPasswordReset(req.body.email);
        return successResponse(res, 200, 'OTP sent to email');
    } catch (e) { next(e); }
};

export const verifyOtp = async (req, res, next) => {
    try {
        await authService.verifyOtp(req.body.email, req.body.otp);
        return successResponse(res, 200, 'OTP verified');
    } catch (e) { next(e); }
};

export const resetPassword = async (req, res, next) => {
    try {
        await authService.resetPassword(req.body.email, req.body.otp, req.body.password);
        return successResponse(res, 200, 'Password updated successfully');
    } catch (e) { next(e); }
};
