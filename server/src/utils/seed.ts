import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { Role } from '../types';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB Connected for seeding...');

    const existingAdmin = await User.findOne({ role: Role.ADMIN });

    if (existingAdmin) {
      console.log('Admin already exists:');
      console.log(`  Email: ${existingAdmin.email}`);
      console.log('Skipping seed.');
    } else {
      const admin = await User.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: process.env.ADMIN_EMAIL || 'admin@careernit.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: Role.ADMIN,
        isActive: true,
      });

      console.log('Default Admin created successfully:');
      console.log(`  Name: ${admin.name}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    }

    await mongoose.disconnect();
    console.log('Seed complete. MongoDB disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();