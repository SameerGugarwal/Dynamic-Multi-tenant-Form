import jwt from 'jsonwebtoken';
import { AppError } from '../shared/utils/errors.mjs';
import { env } from '../config/env.mjs';
import User from '../database/models/User.model.mjs';

/*
// --- User's Original Code ---
export const protect = (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if(!token){
            throw new AppError('Not authorized, no token provided', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_super_secret_key');
        req.user = decoded; 
        next();
    } catch(error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Not authorized, token failed', 401));
        }
    }
};
// --- End User's Original Code ---
*/

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if(!token){
            throw new AppError('Not authorized, no token provided', 401);
        }

        // 1. Verify token strictly using the validated environment secret (NO INSECURE FALLBACKS)
        const decoded = jwt.verify(token, env.JWT_SECRET);
        
        // 2. Security Check: Ensure the user STILL exists and is active
        const currentUser = await User.findById(decoded.id || decoded._id).populate('role', 'name');
        if (!currentUser) {
            throw new AppError('The user belonging to this token no longer exists.', 401);
        }
        if (!currentUser.isActive) {
            throw new AppError('This user account has been deactivated.', 401);
        }

        // 3. Attach the fully hydrated user document to the request for role checks downstream
        req.user = currentUser; 
        next();
    } catch(error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Not authorized, token failed or expired', 401));
        }
    }
};