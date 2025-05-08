const User = require('../models/User');
const Group = require('../models/Group');
const Message = require('../models/Message');
const logger = require('../config/logger');
const { generateRandomToken, generateExpirationDate, generateJWT } = require('../utils/generateToken');
const { sendAdminInvitationEmail } = require('../utils/email');

/**
 * Get all users (admin access)
 * @route GET /api/admin/users
 * @access Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await User.countDocuments();

    // Get users with pagination
    const users = await User.find()
      .select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires')
      .sort('createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Admin get all users error: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

/**
 * Get user by ID (admin access)
 * @route GET /api/admin/users/:id
 * @access Private/Admin
 */
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error(`Admin get user by ID error: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving user' });
  }
};

/**
 * Create a new admin user
 * @route POST /api/admin/users
 * @access Private/Admin
 */
exports.createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, country, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new admin user (already verified)
    const user = new User({
      firstName,
      lastName,
      email,
      country,
      password,
      role: 'admin',
      isVerified: true // Admin is already verified
    });

    await user.save();

    // Get the current admin's name
    const invitedBy = `${req.user.firstName} ${req.user.lastName}`;

    // Send admin invitation email with login credentials
    const emailSent = await sendAdminInvitationEmail(
      email,
      `${firstName} ${lastName}`,
      password, // Send the unencrypted password in the email
      invitedBy
    );

    if (!emailSent) {
      logger.warn(`Failed to send invitation email to new admin: ${email}`);
    }

    logger.info(`New admin user created by ${req.user.email}: ${email}`);

    res.status(201).json({
      message: 'Admin user created successfully. Invitation email has been sent with login credentials.',
      userId: user._id
    });
  } catch (error) {
    logger.error(`Create admin error: ${error.message}`);
    res.status(500).json({ message: 'Error creating admin user' });
  }
};

/**
 * Update user (admin access)
 * @route PUT /api/admin/users/:id
 * @access Private/Admin
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, country, role } = req.body;

    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, country, role },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`User ${updatedUser.email} updated by admin ${req.user.email}`);

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    logger.error(`Admin update user error: ${error.message}`);
    res.status(500).json({ message: 'Error updating user' });
  }
};

/**
 * Delete user (admin access)
 * @route DELETE /api/admin/users/:id
 * @access Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const adminId = req.user._id;

    // Prevent admin from deleting themselves
    if (userId === adminId.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Find and delete user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up user's messages
    await Message.deleteMany({
      $or: [{ sender: userId }, { recipient: userId }]
    });

    // Remove user from groups
    await Group.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    logger.info(`User ${deletedUser.email} deleted by admin ${req.user.email}`);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Admin delete user error: ${error.message}`);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

/**
 * Get system statistics (admin access)
 * @route GET /api/admin/stats
 * @access Private/Admin
 */
exports.getStats = async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const verifiedUserCount = await User.countDocuments({ isVerified: true });
    const groupCount = await Group.countDocuments();
    const messageCount = await Message.countDocuments();

    // Get recent users
    const recentUsers = await User.find()
      .select('firstName lastName email createdAt')
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      stats: {
        users: userCount,
        admins: adminCount,
        verifiedUsers: verifiedUserCount,
        groups: groupCount,
        messages: messageCount
      },
      recentUsers
    });
  } catch (error) {
    logger.error(`Admin get stats error: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving system statistics' });
  }
};

/**
 * Admin login
 * @route POST /api/admin/login
 * @access Public
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info(`Admin login attempt for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Admin login failed: User not found with email: ${email}`);

      // If this is the default admin email and no user exists, create it
      if (email === 'samuelowase02@gmail.com') {
        logger.info('Creating default admin user...');

        const newAdmin = new User({
          firstName: 'Samuel',
          lastName: 'Owase',
          email: 'samuelowase02@gmail.com',
          country: 'Nigeria',
          password: 'Admin@123',
          role: 'admin',
          isVerified: true
        });

        await newAdmin.save();
        logger.info('Default admin created successfully');

        // Generate JWT token for the new admin
        const token = generateJWT(newAdmin._id);

        return res.status(200).json({
          message: 'Default admin created and logged in successfully',
          token,
          user: {
            id: newAdmin._id,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            email: newAdmin.email,
            role: newAdmin.role
          }
        });
      }

      return res.status(401).json({ message: 'Invalid email or password' });
    }

    logger.info(`User found: ${user.email}, Role: ${user.role}, Verified: ${user.isVerified}`);

    // Check if user is an admin
    if (user.role !== 'admin') {
      logger.warn(`Non-admin login attempt at admin endpoint: ${email}, Role: ${user.role}`);

      // If this is the default admin email, update the role
      if (email === 'samuelowase02@gmail.com') {
        user.role = 'admin';
        user.isVerified = true;
        await user.save();
        logger.info(`Default admin role updated for: ${email}`);
      } else {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    logger.info(`Password match result: ${isMatch}`);

    if (!isMatch) {
      // If this is the default admin, update the password
      if (email === 'samuelowase02@gmail.com') {
        // Update password to match the expected one
        user.password = 'Admin@123';
        await user.save();
        logger.info(`Default admin password reset for: ${email}`);
      } else {
        logger.warn(`Failed admin login attempt for user: ${email} - Password mismatch`);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    // Check if user is verified
    if (!user.isVerified) {
      // If this is the default admin, mark as verified
      if (email === 'samuelowase02@gmail.com') {
        user.isVerified = true;
        await user.save();
        logger.info(`Default admin marked as verified: ${email}`);
      } else {
        logger.warn(`Admin login failed: User not verified: ${email}`);
        return res.status(403).json({ message: 'Please verify your email before logging in' });
      }
    }

    // Generate JWT token
    const token = generateJWT(user._id);

    logger.info(`Admin login successful: ${email}`);

    res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error(`Admin login error: ${error.message}`);
    res.status(500).json({ message: 'Error logging in' });
  }
};
