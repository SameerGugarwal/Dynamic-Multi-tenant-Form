import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from './src/database/models/User.model.mjs';
import Organization from './src/database/models/Organization.model.mjs';
import Center from './src/database/models/Center.model.mjs';

dotenv.config();

async function inspectData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'northROC@admin.com' });
        console.log('User centerId:', user.centerId);

        const center = await Center.findOne();
        if (center) {
            console.log('Sample Center ID:', center._id);
            if (!user.centerId) {
                user.centerId = center._id;
                await user.save();
                console.log('Assigned Center ID to User');
            }
        } else {
            console.log('No Centers found');
        }

        const orgs = await Organization.find();
        console.log('Organizations:', JSON.stringify(orgs, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspectData();
