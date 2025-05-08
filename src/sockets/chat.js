const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');
const logger = require('../config/logger');

// Store connected users
const connectedUsers = new Map();

/**
 * Setup Socket.IO server
 * @param {Object} server - HTTP server instance
 */
module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: '*', // In production, restrict this to your frontend domain
      methods: ['GET', 'POST']
    }
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      if (!user.isVerified) {
        return next(new Error('Authentication error: Email not verified'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      logger.error(`Socket authentication error: ${error.message}`);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    
    // Store user connection
    connectedUsers.set(userId, socket.id);
    
    logger.info(`User connected: ${socket.user.email} (${userId})`);
    
    // Emit online users to the connected user
    socket.emit('onlineUsers', Array.from(connectedUsers.keys()));
    
    // Broadcast to other users that this user is online
    socket.broadcast.emit('userOnline', userId);
    
    // Handle private messages
    socket.on('privateMessage', async (data) => {
      try {
        const { recipientId, content } = data;
        
        if (!recipientId || !content) {
          return socket.emit('error', { message: 'Recipient ID and message content are required' });
        }
        
        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
          return socket.emit('error', { message: 'Recipient not found' });
        }
        
        // Create and save message
        const message = new Message({
          sender: userId,
          recipient: recipientId,
          content
        });
        
        await message.save();
        
        // Get sender info for response
        const populatedMessage = await Message.findById(message._id).populate('sender', 'firstName lastName');
        
        // Send to recipient if online
        const recipientSocketId = connectedUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('privateMessage', populatedMessage);
        }
        
        // Send confirmation to sender
        socket.emit('messageSent', populatedMessage);
        
        logger.info(`Private message sent from ${socket.user.email} to ${recipient.email}`);
      } catch (error) {
        logger.error(`Error sending private message: ${error.message}`);
        socket.emit('error', { message: 'Error sending message' });
      }
    });
    
    // Handle joining groups
    socket.on('joinGroup', async (data) => {
      try {
        const { groupId } = data;
        
        if (!groupId) {
          return socket.emit('error', { message: 'Group ID is required' });
        }
        
        // Check if group exists
        const group = await Group.findById(groupId);
        if (!group) {
          return socket.emit('error', { message: 'Group not found' });
        }
        
        // Check if user is a member
        if (!group.members.includes(userId)) {
          // Add user to group
          group.members.push(userId);
          await group.save();
        }
        
        // Join socket room for the group
        socket.join(`group:${groupId}`);
        
        // Notify group members
        io.to(`group:${groupId}`).emit('userJoinedGroup', {
          groupId,
          user: {
            _id: socket.user._id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName
          }
        });
        
        logger.info(`User ${socket.user.email} joined group: ${group.name}`);
        
        socket.emit('joinedGroup', { groupId, name: group.name });
      } catch (error) {
        logger.error(`Error joining group: ${error.message}`);
        socket.emit('error', { message: 'Error joining group' });
      }
    });
    
    // Handle leaving groups
    socket.on('leaveGroup', async (data) => {
      try {
        const { groupId } = data;
        
        if (!groupId) {
          return socket.emit('error', { message: 'Group ID is required' });
        }
        
        // Check if group exists
        const group = await Group.findById(groupId);
        if (!group) {
          return socket.emit('error', { message: 'Group not found' });
        }
        
        // Check if user is the creator
        if (group.creator.toString() === userId) {
          return socket.emit('error', { message: 'Group creator cannot leave the group' });
        }
        
        // Remove user from group
        if (group.members.includes(userId)) {
          group.members = group.members.filter(member => member.toString() !== userId);
          await group.save();
        }
        
        // Leave socket room
        socket.leave(`group:${groupId}`);
        
        // Notify group members
        io.to(`group:${groupId}`).emit('userLeftGroup', {
          groupId,
          userId: socket.user._id
        });
        
        logger.info(`User ${socket.user.email} left group: ${group.name}`);
        
        socket.emit('leftGroup', { groupId, name: group.name });
      } catch (error) {
        logger.error(`Error leaving group: ${error.message}`);
        socket.emit('error', { message: 'Error leaving group' });
      }
    });
    
    // Handle group messages
    socket.on('groupMessage', async (data) => {
      try {
        const { groupId, content } = data;
        
        if (!groupId || !content) {
          return socket.emit('error', { message: 'Group ID and message content are required' });
        }
        
        // Check if group exists
        const group = await Group.findById(groupId);
        if (!group) {
          return socket.emit('error', { message: 'Group not found' });
        }
        
        // Check if user is a member
        if (!group.members.includes(userId)) {
          return socket.emit('error', { message: 'You are not a member of this group' });
        }
        
        // Create and save message
        const message = new Message({
          sender: userId,
          group: groupId,
          content
        });
        
        await message.save();
        
        // Get sender info for response
        const populatedMessage = await Message.findById(message._id).populate('sender', 'firstName lastName');
        
        // Send to all members in the group
        io.to(`group:${groupId}`).emit('groupMessage', populatedMessage);
        
        logger.info(`Group message sent to ${group.name} by ${socket.user.email}`);
      } catch (error) {
        logger.error(`Error sending group message: ${error.message}`);
        socket.emit('error', { message: 'Error sending group message' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove user from connected users
      connectedUsers.delete(userId);
      
      // Broadcast to other users that this user is offline
      socket.broadcast.emit('userOffline', userId);
      
      logger.info(`User disconnected: ${socket.user.email} (${userId})`);
    });
  });

  return io;
};
