import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    const { User } = require('../src/models/User');
    
    // check if admin exists
    const adminExists = await User.findOne({ email: 'admin@ecommerce.com' });
    if (adminExists) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const admin = new User({
      name: 'Super Admin',
      email: 'admin@ecommerce.com',
      password: 'AdminPassword123',
      role: 'admin',
    });

    await admin.save();
    console.log('Admin user created successfully.');
    console.log('Email: admin@ecommerce.com');
    console.log('Password: AdminPassword123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
