import { Router } from 'express';
import { fetchUserReports, downloadReport } from './report.controller.mjs';
import { protect } from '../../middleware/auth.middleware.mjs';

const router = Router();

// Apply global tenant authentication wrapper
router.use(protect);

/**
 * @swagger
 * /reports/user/{userId}:
 *   get:
 *     summary: Fetch user reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reports fetched successfully
 */
router.get('/user/:userId', fetchUserReports);

/**
 * @swagger
 * /reports/download/{submissionId}:
 *   get:
 *     summary: Download report in PDF or Excel format
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pdf, excel]
 *     responses:
 *       200:
 *         description: Report file buffer
 */
router.get('/download/:submissionId', downloadReport);

export default router;
