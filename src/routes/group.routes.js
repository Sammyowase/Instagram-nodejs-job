const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { standardLimiter } = require('../middlewares/rateLimiter.middleware');
const { createGroupValidation, sendMessageValidation, validate } = require('../middlewares/validation.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups retrieved successfully
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', standardLimiter, groupController.getAllGroups);

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get group by ID
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group retrieved successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.get('/:id', standardLimiter, groupController.getGroupById);

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Validation error or group already exists
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', createGroupValidation, validate, groupController.createGroup);

/**
 * @swagger
 * /api/groups/{id}/join:
 *   post:
 *     summary: Join a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Successfully joined the group
 *       400:
 *         description: Already a member
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.post('/:id/join', standardLimiter, groupController.joinGroup);

/**
 * @swagger
 * /api/groups/{id}/leave:
 *   post:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Successfully left the group
 *       400:
 *         description: Not a member or creator cannot leave
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.post('/:id/leave', standardLimiter, groupController.leaveGroup);

/**
 * @swagger
 * /api/groups/{id}/messages:
 *   get:
 *     summary: Get group messages
 *     tags: [Groups, Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of the group
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.get('/:id/messages', standardLimiter, groupController.getGroupMessages);

/**
 * @swagger
 * /api/groups/{id}/messages:
 *   post:
 *     summary: Send group message (REST API version)
 *     tags: [Groups, Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of the group
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.post('/:id/messages', standardLimiter, sendMessageValidation, validate, groupController.sendGroupMessage);

module.exports = router;
