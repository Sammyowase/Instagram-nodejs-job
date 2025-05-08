const logger = require('../config/logger');

/**
 * Middleware to check if user has admin role
 */
exports.isAdmin = (req, res, next) => {
  try {
    // Check if user exists and has admin role
    if (!req.user || req.user.role !== 'admin') {
      logger.warn(`Unauthorized admin access attempt by user: ${req.user ? req.user._id : 'unknown'}`);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    logger.error(`Role verification error: ${error.message}`);
    res.status(500).json({ message: 'Server error during role verification' });
  }
};
