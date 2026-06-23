import Role from '../../database/models/Role.model.mjs';
import Permission from '../../database/models/Permission.model.mjs';
import { AppError } from '../../shared/utils/errors.mjs';

//Fetch all roles along with their fully populated permission details
export const getAllRolesWithPermissions = async () => {
    return await Role.find({})
        .populate('permissions', 'name module description')
        .lean();
};

//Fetch a single role profile by its distinct enum name string
export const getRoleByName = async(roleName)=>{
    return await Role.findOne({name: roleName})
        .populate('permissions', 'name module')
        .lean();
};
//Dynamically synchronize and update permission assignments for a target role
export const updateRolePermissions = async (roleName, permissionNamesArray) => {
    // Convert the permission string names into verified database ObjectIds
    const verifiedPermissions = await Permission.find({
        name:{$in: permissionNamesArray}
    });
    const permissionIds = verifiedPermissions.map(p => p._id);
    //Commit the array of ObjectIds directly to the role's permissions array
    const updatedRole = await Role.findOneAndUpdate(
        { name: roleName },
        { $set: { permissions: permissionIds } },
        { new: true, runValidators: true }
    ).populate('permissions', 'name module');

    if (!updatedRole) {
        throw new AppError('ROLE_NOT_FOUND', 404);
    }
    return updatedRole;
};