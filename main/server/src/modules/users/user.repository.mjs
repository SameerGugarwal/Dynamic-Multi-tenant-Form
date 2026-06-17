import { User, Role } from '../../database/index.mjs';

export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

export const findRoleByName = async (name) => {
    return await Role.findOne({ name });
};

export const createUser = async (userData) => {
    return await User.create(userData);
};

export const findUserByOrganization = async (organizationId) => {
    return await User.findOne({ organization: organizationId }).populate('role', 'name');
};

export const findUserById = async (userId) => {
    return await User.findById(userId).populate('role', 'name');
};

export const updateUserById = async (userId, updateData) => {
    return await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
};
