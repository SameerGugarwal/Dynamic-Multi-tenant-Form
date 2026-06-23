import express from 'express';
import { login, register, refreshToken } from './auth.controller.mjs';
import validate from '../../middleware/validation.middleware.mjs';
import { loginSchema, registerSchema } from './auth.validation.mjs';

const router = express.Router();

/*
// import { login } from './auth.controller.mjs';
// router.post('/login', login);
*/

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "superadmin@example.com"
 *               password:
 *                 type: string
 *                 example: "SecurePassword123!"
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validate(loginSchema), login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *                 example: "Super Admin User"
 *               email:
 *                 type: string
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "SecurePass123!"
 *               roleName:
 *                 type: string
 *                 example: "Center Admin"
 *               organizationId:
 *                 type: string
 *                 example: "6a350dcf89a69b19954db96e"
 *               centerId:
 *                 type: string
 *                 example: "6a350dcf89a69b19954db96e"
 *     responses:
 *       201:
 *         description: Registration successful
 */
router.post('/register', validate(registerSchema), register);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh-token', refreshToken);


import { requestPasswordReset, verifyOtp, resetPassword } from './auth.controller.mjs';
router.post('/request-reset', requestPasswordReset);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
export default router;
