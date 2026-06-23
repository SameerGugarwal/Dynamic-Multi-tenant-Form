import * as otpRepository from './otp.repository.mjs';
import generateOtp from '../../shared/helpers/generateOtp.mjs';
import { AppError } from '../../shared/utils/errors.mjs';

//Liquidate old sessions and initialize a fresh token
export const generateAndStoreOtp = async (userId, purpose) => {
    await otpRepository.invalidatePreviousOtps(userId, purpose);
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 
    await otpRepository.create({
        userId,
        purpose,
        code,
        expiresAt
    });
    return code;
};
//Validate token parameters and commit consumer state updates
export const verifyOtpToken = async (userId, purpose, code) => {
    const activeRecord = await otpRepository.findActiveOtp(userId, purpose);
    if(!activeRecord){
        throw new AppError('OTP_EXPIRED_OR_NOT_FOUND', 440);
    }
    if(activeRecord.code !== String(code)){
        throw new AppError('INVALID_OTP_CODE', 400);
    }
    await otpRepository.updateById(activeRecord._id, { isUsed: true });
    return true;
};