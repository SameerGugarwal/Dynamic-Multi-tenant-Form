import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from './src/database/models/User.model.mjs';
import Role from './src/database/models/Role.model.mjs';

dotenv.config();

async function revertUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const userRole = await Role.findOne({ name: 'User' });
        
        const user = await User.findOneAndUpdate(
            { email: 'sameer@centeradmin.com' },
            { role: userRole._id, centerId: null },
            { new: true }
        );
        
        if (user) {
            console.log('Reverted sameer@centeradmin.com back to User role');
        } else {
            console.log('User sameer@centeradmin.com not found in DB');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

revertUser();
