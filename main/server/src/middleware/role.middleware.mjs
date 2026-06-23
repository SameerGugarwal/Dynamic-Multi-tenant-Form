//checks if the authenticated user has permission to access a specific route
import { AppError } from '../shared/utils/errors.mjs';

/*
// --- User's Original Code ---
import {Role} from '../database/index.mjs';

export const authorizeRoles = (...allowedRoleNames)=>{
    return async (req, res, next)=>{
        try{
            const userRole = await Role.findById(req.user.roleId);
            if(!userRole || !allowedRoleNames.includes(userRole.name)){
                throw new AppError(`Role (${userRole?.name || 'Unknown'}) is not authorized to use this route.`, 403);
            }
            next();
        }catch(error){
            if (error instanceof AppError) {
                next(error);
            } else {
                next(new AppError('Server error checking role authorization', 500));
            }
        }
    }
}
// --- End User's Original Code ---
*/

export const authorizeRoles = (...allowedRoleNames) => {
    return (req, res, next) => {
        try {
            // req.user is fully hydrated by auth.middleware.mjs, so req.user.role already contains { _id, name }
            const roleName = req.user?.role?.name;
            
            if (!roleName || !allowedRoleNames.includes(roleName)) {
                throw new AppError(`Role (${roleName || 'Unknown'}) is not authorized to use this route.`, 403);
            }
            
            next();
        } catch(error) {
            if (error instanceof AppError) {
                next(error);
            } else {
                next(new AppError('Server error checking role authorization', 500));
            }
        }
    }
}