import express from 'express';
import { createNewUser, getOrgUser, updateUser } from './user.controller.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';
import { authorizeRoles } from '../../middleware/role.middleware.mjs';

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
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
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Admin User"
 *               email:
 *                 type: string
 *                 example: "admin@test.com"
 *               password:
 *                 type: string
 *                 example: "SecurePass123!"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation Error
 */
router.post('/', authorizeRoles('Organization Admin', 'Super Admin'), createNewUser);

/**
 * @swagger
 * /users/organization:
 *   get:
 *     summary: Get users by organization
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */
router.get('/organization', authorizeRoles('Organization Admin'), getOrgUser);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.patch('/:id', authorizeRoles('Organization Admin', 'Super Admin'), updateUser);

router.patch('/me', protect, async (req, res) => {
    try {
        const User = (await import('../../database/models/User.model.mjs')).default;
        await User.findByIdAndUpdate(req.user.id, { name: req.body.name, email: req.body.email });
        res.json({ success: true, message: 'Profile updated' });
    } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});
export default router;
