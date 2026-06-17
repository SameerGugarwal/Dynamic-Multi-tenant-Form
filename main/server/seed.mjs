// seed.mjs
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Role, User } from './src/database/index.mjs';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create the System Roles
    const roles = ['Super Admin', 'Center Admin', 'Organization Admin', 'User'];
    for (const roleName of roles) {
      // upsert: true means "create it if it doesn't exist, otherwise leave it alone"
      await Role.updateOne({ name: roleName }, { name: roleName }, { upsert: true });
    }
    console.log('✅ System Roles verified/seeded');

    // 2. Create the first Super Admin
    const superAdminRole = await Role.findOne({ name: 'Super Admin' });
    const existingAdmin = await User.findOne({ email: 'admin@system.com' });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'Master Admin',
        email: 'admin@system.com',
        passwordHash,
        role: superAdminRole._id
      });
      console.log('✅ Super Admin created!');
      console.log('➡️  Email: admin@system.com');
      console.log('➡️  Password: Admin@123');
    } else {
      console.log('ℹ️  Super Admin already exists.');
    }

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();