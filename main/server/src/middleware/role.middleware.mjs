//checks if the authenticated user has permission to access a specific route

import {Role} from '../database/index.mjs';
export const authorizeRoles = (...allowedRoleNames)=>{
    return async (req, res, next)=>{
        try{
            const userRole = await Role.findById(req.user.roleId);
            if(!userRole || !allowedRoleNames.includes(userRole.name)){
                return res.status(403).json({ 
                    message: `Role (${userRole?.name || 'Unknown'}) is not authorized to use this route.`
                });   
            }
            next();
        }catch(error){
            res.status(500).json({ message: 'Server error checking role authorization' });
        }
    }
}