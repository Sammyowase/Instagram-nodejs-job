const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Get all groups
 * @route GET /api/groups
 * @access Private
 */
exports.getAllGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all groups
    const groups = await Group.find()
      .populate('creator', 'firstName lastName')
      .select('name description creator members createdAt');
    
    // Add a flag to indicate if the current user is a member
    const groupsWithMembership = groups.map(group => {
      const isMember = group.members.includes(userId);
      return {
        _id: group._id,
        name: group.name,
        description: group.description,
        creator: group.creator,
        memberCount: group.members.length,
        isMember,
        createdAt: group.createdAt
      };
    });
    
    res.status(200).json(groupsWithMembership);
  } catch (error) {
    logger.error(`Get all groups error: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving groups' });
  }
};

/**
 * Get group by ID
 * @route GET /api/groups/:id
 * @access Private
 */
exports.getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    
    // Find group
    const group = await Group.findById(groupId)
      .populate('creator', 'firstName lastName email')
      .populate('members', 'firstName lastName email');
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member
    const isMember = group.members.some(member => member._id.toString() === userId.toString());
    
    // Format response
    const response = {
      _id: group._id,
      name: group.name,
      description: group.description,
      creator: group.creator,
      members: group.members,
      isMember,
      createdAt: group.createdAt
    };
    
    res.status(200).json(response);
  } catch (error) {
    logger.error(`Get group by ID error: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving group' });
  }
};

/**
 * Create a new group
 * @route POST /api/groups
 * @access Private
 */
exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user._id;
    
    // Check if group with same name already exists
    const groupExists = await Group.findOne({ name });
    if (groupExists) {
      return res.status(400).json({ message: 'Group with this name already exists' });
    }
    
    // Create new group
    const group = new Group({
      name,
      description,
      creator: userId,
      members: [userId]
    });
    
    await group.save();
    
    logger.info(`New group created: ${name} by user ${req.user.email}`);
    
    res.status(201).json({
      message: 'Group created successfully',
      group: {
        _id: group._id,
        name: group.name,
        description: group.description,
        creator: userId,
        members: [userId],
        createdAt: group.createdAt
      }
    });
  } catch (error) {
    logger.error(`Create group error: ${error.message}`);
    res.status(500).json({ message: 'Error creating group' });
  }
};

/**
 * Join a group
 * @route POST /api/groups/:id/join
 * @access Private
 */
exports.joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    
    // Find group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }
    
    // Add user to group members
    group.members.push(userId);
    await group.save();
    
    logger.info(`User ${req.user.email} joined group: ${group.name}`);
    
    res.status(200).json({ message: 'Successfully joined the group' });
  } catch (error) {
    logger.error(`Join group error: ${error.message}`);
    res.status(500).json({ message: 'Error joining group' });
  }
};

/**
 * Leave a group
 * @route POST /api/groups/:id/leave
 * @access Private
 */
exports.leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    
    // Find group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member
    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }
    
    // Check if user is the creator
    if (group.creator.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Group creator cannot leave the group. Transfer ownership or delete the group instead.' });
    }
    
    // Remove user from group members
    group.members = group.members.filter(member => member.toString() !== userId.toString());
    await group.save();
    
    logger.info(`User ${req.user.email} left group: ${group.name}`);
    
    res.status(200).json({ message: 'Successfully left the group' });
  } catch (error) {
    logger.error(`Leave group error: ${error.message}`);
    res.status(500).json({ message: 'Error leaving group' });
  }
};

/**
 * Get group messages
 * @route GET /api/groups/:id/messages
 * @access Private
 */
exports.getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    
    // Find group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member
    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: 'You must be a member of the group to view messages' });
    }
    
    // Get messages for the group
    const messages = await Message.find({ group: groupId })
      .sort('createdAt')
      .populate('sender', 'firstName lastName');
    
    res.status(200).json(messages);
  } catch (error) {
    logger.error(`Get group messages error: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving group messages' });
  }
};

/**
 * Send group message (REST API version)
 * @route POST /api/groups/:id/messages
 * @access Private
 */
exports.sendGroupMessage = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    const { content } = req.body;
    
    // Find group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member
    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: 'You must be a member of the group to send messages' });
    }
    
    // Create new message
    const message = new Message({
      sender: userId,
      group: groupId,
      content
    });
    
    await message.save();
    
    // Populate sender info
    await message.populate('sender', 'firstName lastName');
    
    logger.info(`Group message sent to ${group.name} by user ${req.user.email}`);
    
    res.status(201).json(message);
  } catch (error) {
    logger.error(`Send group message error: ${error.message}`);
    res.status(500).json({ message: 'Error sending group message' });
  }
};
