const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * Generate JWT token for authenticated user
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
exports.generateJWT = (userId) => {
  try {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
  } catch (error) {
    logger.error(`Error generating JWT: ${error.message}`);
    throw new Error('Error generating authentication token');
  }
};

/**
 * Generate random token for email verification or password reset
 * @returns {string} - Random token
 */
exports.generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate expiration date for tokens
 * @param {number} hours - Hours until expiration
 * @returns {Date} - Expiration date
 */
exports.generateExpirationDate = (hours = 24) => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};
