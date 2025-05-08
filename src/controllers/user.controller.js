const User = require('../models/User');
const Message = require('../models/Message');
const logger = require('../config/logger');

/**
 * Get current user profile
 * @route GET /api/users/profile
 * @access Private
 */
exports.getProfile = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;
    
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: user.country,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving user profile' });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, country } = req.body;
    const userId = req.user._id;
    
    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, country },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    logger.info(`User profile updated: ${updatedUser.email}`);
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        country: updatedUser.country,
        role: updatedUser.role
      }
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({ message: 'Error updating user profile' });
  }
};

/**
 * Change user password
 * @route PUT /api/users/change-password
 * @access Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    logger.info(`Password changed for user: ${user.email}`);
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    res.status(500).json({ message: 'Error changing password' });
  }
};

/**
 * Get all users (for messaging)
 * @route GET /api/users
 * @access Private
 */
exports.getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    // Get all users except current user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('_id firstName lastName email')
      .sort('firstName');
    
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

/**
 * Get private messages between users
 * @route GET /api/users/:userId/messages
 * @access Private
 */
exports.getPrivateMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    
    // Validate other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    })
      .sort('createdAt')
      .populate('sender', 'firstName lastName');
    
    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, recipient: currentUserId, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json(messages);
  } catch (error) {
    logger.error(`Get private messages error: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving messages' });
  }
};

/**
 * Send private message (REST API version)
 * @route POST /api/users/:userId/messages
 * @access Private
 */
exports.sendPrivateMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const recipientId = req.params.userId;
    const { content } = req.body;
    
    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Create new message
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content
    });
    
    await message.save();
    
    // Populate sender info
    await message.populate('sender', 'firstName lastName');
    
    logger.info(`Private message sent from ${req.user.email} to ${recipient.email}`);
    
    res.status(201).json(message);
  } catch (error) {
    logger.error(`Send private message error: ${error.message}`);
    res.status(500).json({ message: 'Error sending message' });
  }
};
