import * as authRepo from './auth.repository.mjs';
import { generateToken } from '../../shared/helpers/generateToken.mjs';
import { comparePassword } from '../../shared/helpers/comparePassword.mjs';
import { hashPassword } from '../../shared/helpers/hashPassword.mjs';
import { ROLES } from '../../shared/constants/roles.mjs';

export const loginUser = async (email, password) => {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }
    if (!user.isActive) {
        throw new Error('User is not active');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    
    const token = generateToken(user);

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role?.name
        },
        token
    };
};

export const registerUser = async (userData) => {
    const existingUser = await authRepo.findUserByEmail(userData.email);
    if (existingUser) {
        throw new Error('Email already registered');
    }

    const roleName = userData.roleName || ROLES.USER;
    const role = await authRepo.findRoleByName(roleName);
    if (!role) {
        throw new Error('Invalid role specified');
    }

    const passwordHash = await hashPassword(userData.password);

    const newUser = await authRepo.createUser({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: role._id,
        organizationId: userData.organizationId || null
    });

    const token = generateToken(newUser);

    return {
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: role.name
        },
        token
    };
};