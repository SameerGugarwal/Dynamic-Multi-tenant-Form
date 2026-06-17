import bcrypt from 'bcryptjs';

export const comparePassword = async (enteredPassword, storedPassword) => {
    return await bcrypt.compare(enteredPassword, storedPassword);
};
