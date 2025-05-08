const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

/**
 * Standard rate limiter for general API endpoints
 */
exports.standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json({
      message: options.message
    });
  }
});

/**
 * Strict rate limiter for sensitive endpoints like login, signup
 */
exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again after an hour',
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json({
      message: options.message
    });
  }
});

/**
 * Admin rate limiter for admin endpoints
 */
exports.adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many admin requests, please try again after an hour',
  handler: (req, res, next, options) => {
    logger.warn(`Admin rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json({
      message: options.message
    });
  }
});
