require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB } = require('../config/db');
const logger = require('../config/logger');

async function createAdmin() {
  try {
    // Connect to the database
    await connectDB();
    logger.info('Connected to database');

    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'samuelowase02@gmail.com' });

    if (adminExists) {
      logger.info('Admin user already exists:');
      logger.info(`Email: ${adminExists.email}`);
      logger.info(`Role: ${adminExists.role}`);
      logger.info(`Verified: ${adminExists.isVerified}`);
      
      // Update the admin user to ensure it has the correct role and is verified
      adminExists.role = 'admin';
      adminExists.isVerified = true;
      await adminExists.save();
      
      logger.info('Admin user updated to ensure correct role and verification status');
    } else {
      // Create new admin user
      const adminUser = new User({
        firstName: 'Samuel',
        lastName: 'Owase',
        email: 'samuelowase02@gmail.com',
        country: 'Nigeria',
        password: 'Admin@123',
        role: 'admin',
        isVerified: true
      });

      await adminUser.save();
      logger.info('Default admin created successfully');
      logger.info(`Email: ${adminUser.email}`);
      logger.info(`Role: ${adminUser.role}`);
      logger.info(`Verified: ${adminUser.isVerified}`);
    }

    // Disconnect from the database
    await mongoose.disconnect();
    logger.info('Disconnected from database');
    
    process.exit(0);
  } catch (error) {
    logger.error(`Error creating admin user: ${error.message}`);
    process.exit(1);
  }
}

// Run the function
createAdmin();
