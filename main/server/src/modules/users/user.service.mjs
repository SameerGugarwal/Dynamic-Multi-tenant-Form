// handles the database logic. We will add a function to create a new user and hash their password before saving\
import bcrypt from 'bcrypt';
import * as userRepo from './user.repository.mjs';

export const createUser = async (userData) => {
    const { name, email, password, roleName, organizationId, centerId } = userData;

    //Check if user already exists
    const existingUser = await userRepo.findUserByEmail(userData.email);
    if (existingUser) {
        throw new Error('User already exists');
    }
    //Find the correct Role ID based on the name provided
    const role = await userRepo.findRoleByName(roleName);
    if (!role) {
        throw new Error(`Role ${roleName} not found in Database.`);
    }
    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create and save the user
    const newUser = await userRepo.createUser({
        name,
        email,
        passwordHash: hashedPassword,
        role: role._id,
        organization: organizationId || null,
        center: centerId || null,
    });
    //Return user without the password hash
    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;
    return userResponse;
};

export const getUserByOrganization = async (organizationId) => {
    return await userRepo.findUserByOrganization(organizationId);
};

export const getUserById = async (userId) => {
    return await userRepo.findUserById(userId);
};

export const updateUser = async (userId, updateData) => {
    // pass yaha se update nahi kar sakte 
    if(updateData.password){
        delete updateData.password;
    }
    // find the roll id agar role update kar rahe 
    if(updateData.roleName){
        const role = await userRepo.findRoleByName(updateData.roleName);
        if (!role) {
            throw new Error(`Role ${updateData.roleName} not found in Database.`);
        }
        updateData.role = role._id;
        delete updateData.roleName;
    }
    // find by IDsn update
    const upadateUser = await userRepo.updateUserById(userId, updateData);
    if(!upadateUser){
        throw new Error('User not found');
    }
    return upadateUser;

};