import * as otpService from './otp.service.mjs';
import User from '../../database/models/User.model.mjs'; 
import { successResponse, errorResponse } from '../../shared/utils/apiResponse.mjs';

export const requestNewOtp = async (req, res, next) => {
    try{
        const {email, purpose} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return errorResponse(res, 404, "No active user registry matches that email identity.");
        }
        const generatedCode = await otpService.generateAndStoreOtp(user._id, purpose);
        return successResponse(res, 200, "Verification token tracking code processed successfully", { 
            code: generatedCode 
        });
    }catch(error){
        next(error);
    }
};

export const verifyOtpSubmission = async (req, res, next) => {
    try{
        const {email, purpose, code} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return errorResponse(res, 404, "No active user registry matches that email identity.");
        }
        await otpService.verifyOtpToken(user._id, purpose, code);
        return successResponse(res, 200, "Identity token verified and cleared successfully.", null);
    }catch(error){
        if (error.message === 'OTP_EXPIRED_OR_NOT_FOUND') {
            return errorResponse(res, 440, "Verification sequence token has expired or was already consumed.");
        }
        if (error.message === 'INVALID_OTP_CODE') {
            return errorResponse(res, 400, "Verification execution match failure. Invalid entry value.");
        }
        next(error);
    }
};