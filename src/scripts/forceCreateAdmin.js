require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');

async function forceCreateAdmin() {
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to database');

    // Get the User model directly from mongoose to avoid any middleware
    const User = mongoose.model('User');

    // Delete any existing user with the admin email
    await User.deleteOne({ email: 'samuelowase02@gmail.com' });
    console.log('Deleted any existing admin user');

    // Hash the password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // Create the admin user directly in the database
    const result = await User.create({
      firstName: 'Samuel',
      lastName: 'Owase',
      email: 'samuelowase02@gmail.com',
      country: 'Nigeria',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      createdAt: new Date()
    });

    console.log('Admin user created successfully:');
    console.log('ID:', result._id);
    console.log('Email:', result.email);
    console.log('Role:', result.role);
    console.log('Verified:', result.isVerified);

    // Test password comparison
    const isMatch = await bcrypt.compare('Admin@123', result.password);
    console.log('Password match test:', isMatch);

    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from database');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the function
forceCreateAdmin();
