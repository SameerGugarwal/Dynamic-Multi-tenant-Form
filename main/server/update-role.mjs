import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from './src/database/models/User.model.mjs';
import Role from './src/database/models/Role.model.mjs';

dotenv.config();

async function updateRole() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        const role = await Role.findOne({ name: 'Center Admin' });
        if (!role) {
            console.log('Role not found');
            process.exit(1);
        }
        
        const user = await User.findOneAndUpdate(
            { email: 'northROC@admin.com' },
            { role: role._id },
            { new: true }
        );
        
        if (user) {
            console.log('Successfully updated user role to Center Admin:', user.email);
        } else {
            console.log('User not found');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateRole();
