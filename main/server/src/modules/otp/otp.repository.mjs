import OTP from '../../database/models/OTP.model.mjs';

export const create = async (otpData) =>{
    return await OTP.create(otpData);
};
//Locate a live, unexpired, and unused OTP record matching user identity constraints
export const findActiveOtp = async (userId, purpose)=>{
    return await OTP.findOne({
        userId,
        purpose,
        isUsed: false,
        expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
};
//Update validation markers
export const updateById = async (id, updateData)=>{
    return await OTP.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    );
};
//Invalidate older instances for the same target interaction segment
export const invalidatePreviousOtps = async (userId, purpose)=>{
    return await OTP.updateMany(
        { userId, purpose, isUsed: false },
        { $set: { isUsed: true } }
    );
};    