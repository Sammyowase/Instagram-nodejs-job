const User = require('../models/User');
const Group = require('../models/Group');
const logger = require('../config/logger');
const mongoose = require('mongoose');

/**
 * Seed admin user if none exists
 */
exports.seedAdmin = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      logger.info('No admin user found. Creating default admin...');

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
      logger.info(`Default admin created with email: ${adminUser.email}`);
      logger.info('IMPORTANT: Change the default admin password immediately!');
    } else {
      logger.info('Admin user already exists. Skipping admin seeding.');
    }
  } catch (error) {
    logger.error(`Error seeding admin user: ${error.message}`);
  }
};

/**
 * Seed default groups if none exist
 */
exports.seedGroups = async () => {
  try {
    // Check if any groups exist
    const groupCount = await Group.countDocuments();

    if (groupCount === 0) {
      logger.info('No groups found. Creating default groups...');

      // Get admin user to set as creator
      const admin = await User.findOne({ role: 'admin' });

      if (!admin) {
        logger.error('Cannot seed groups: No admin user found');
        return;
      }

      // Create default groups
      const defaultGroups = [
        {
          name: 'Sam Teach Backend',
          description: 'Learn backend development with Sam',
          creator: admin._id,
          members: [admin._id]
        },
        {
          name: 'General',
          description: 'General discussion group for all users',
          creator: admin._id,
          members: [admin._id]
        },
        {
          name: 'Announcements',
          description: 'Important announcements from administrators',
          creator: admin._id,
          members: [admin._id]
        }
      ];

      await Group.insertMany(defaultGroups);
      logger.info('Default groups created successfully');
    } else {
      logger.info('Groups already exist. Skipping group seeding.');
    }
  } catch (error) {
    logger.error(`Error seeding groups: ${error.message}`);
  }
};

/**
 * Run all seeders
 */
exports.runSeeders = async () => {
  try {
    // Make sure we're connected to the database
    if (mongoose.connection.readyState !== 1) {
      logger.error('Cannot run seeders: Database not connected');
      return;
    }

    logger.info('Running database seeders...');

    // Run seeders in sequence
    await this.seedAdmin();
    await this.seedGroups();

    logger.info('Database seeding completed');
  } catch (error) {
    logger.error(`Error running seeders: ${error.message}`);
  }
};
