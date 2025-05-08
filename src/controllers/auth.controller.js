const User = require('../models/User');
const logger = require('../config/logger');
const { generateJWT, generateRandomToken, generateExpirationDate } = require('../utils/generateToken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

/**
 * Register a new user
 * @route POST /api/auth/signup
 * @access Public
 */
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, country, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate verification token
    const verificationToken = generateRandomToken();
    const verificationTokenExpires = generateExpirationDate(24); // 24 hours

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      country,
      password,
      verificationToken,
      verificationTokenExpires
    });

    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      `${firstName} ${lastName}`,
      verificationToken
    );

    if (!emailSent) {
      logger.warn(`Failed to send verification email to: ${email}`);
    }

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: user._id
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    res.status(500).json({ message: 'Error registering user' });
  }
};

/**
 * Verify user email
 * @route GET /api/auth/verify-email
 * @access Public
 */
exports.verifyEmail = async (req, res) => {
  try {
    let { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Check if token is a URL (this can happen when testing with Swagger)
    if (token.includes('http') && token.includes('verify-email')) {
      // Extract the actual token from the URL
      const url = new URL(token);
      token = url.searchParams.get('token');
    }

    logger.info(`Verifying email with token: ${token}`);

    // Find user with the token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    logger.info(`User verified: ${user.email}`);

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    // Generate JWT token
    const token = generateJWT(user._id);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      message: 'Login successful',
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
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: 'Error logging in' });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent' });
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const resetTokenExpires = generateExpirationDate(1); // 1 hour

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;

    await user.save();

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(
      email,
      `${user.firstName} ${user.lastName}`,
      resetToken
    );

    if (!emailSent) {
      logger.warn(`Failed to send password reset email to: ${email}`);
      return res.status(500).json({ message: 'Error sending password reset email' });
    }

    logger.info(`Password reset requested for: ${email}`);

    res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent' });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
};

/**
 * Reset password
 * @route POST /api/auth/reset-password
 * @access Public
 */
exports.resetPassword = async (req, res) => {
  try {
    let { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Check if token is a URL (this can happen when testing with Swagger)
    if (token.includes('http') && token.includes('reset-password')) {
      // Extract the actual token from the URL
      const url = new URL(token);
      token = url.searchParams.get('token');
    }

    logger.info(`Resetting password with token`);

    // Find user with the token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update user password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    res.status(500).json({ message: 'Error resetting password' });
  }
};
