import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('⚠️ Admin account already exists');
      console.log('📱 Phone:', adminExists.phone);
      process.exit(0);
    }

    // Create admin account
    const admin = await User.create({
      phone: process.env.ADMIN_PHONE || '+84987654321',
      name: process.env.ADMIN_NAME || 'Shipway Administrator',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      isPhoneVerified: true,
      isActive: true
    });

    console.log('✅ Admin account created successfully!');
    console.log('📱 Phone:', admin.phone);
    console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
    console.log('👤 Name:', admin.name);
    console.log('\n⚠️ Please change the default password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

