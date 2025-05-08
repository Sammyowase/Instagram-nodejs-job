const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const { loginValidation, validate } = require('../middlewares/validation.middleware');

/**
 * @swagger
 * /api/admin-auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Authentication]
 *     description: Login specifically for admin users. Regular users cannot login through this endpoint.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "samuelowase02@gmail.com"
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Admin@123"
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin]
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Not an admin account
 *       500:
 *         description: Server error
 */
router.post('/login', authLimiter, loginValidation, validate, adminController.adminLogin);

module.exports = router;
