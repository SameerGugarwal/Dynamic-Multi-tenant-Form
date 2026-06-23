import User from '../../database/models/User.model.mjs';
import Role from '../../database/models/Role.model.mjs';

export const findUserByEmail = async (email) => {
    return await User.findOne({ email }).populate('role');
};

export const findRoleByName = async (name) => {
    return await Role.findOne({ name });
};

export const createUser = async (userData) => {
    return await User.create(userData);
};

export const findUserById = async (id) => {
    return await User.findById(id).populate('role');
};

export const updateUser = async (id, updateData) => {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
};
