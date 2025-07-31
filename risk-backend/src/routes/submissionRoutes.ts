// src/routes/submissionRoutes.ts
import express from 'express';
import {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
  overrideSubmission,
  reassessRisk
  
} from '../controllers/submissionController';

import { authenticate, authorizeRoles } from '../middleware/authMiddleware';
import { testRiskAssessment } from '../controllers/submissionController';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /submissions:
 *   post:
 *     summary: Create a new submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubmissionRequest'
 *           example:
 *             type: "individual"
 *             details:
 *               - section: "personal_info"
 *                 data:
 *                   country: "Nigeria"
 *                   isPEP: true
 *                   age: 45
 *                   occupation: "Politician"
 *               - section: "financial_info"
 *                 data:
 *                   sourceOfWealth: "Business"
 *                   estimatedMonthlyInflow: 200000
 *     responses:
 *       201:
 *         description: Submission created with risk assessment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submission:
 *                   $ref: '#/components/schemas/Submission'
 *                 riskAssessment:
 *                   type: object
 *                   properties:
 *                     calculatedScore:
 *                       type: number
 *                     systemRating:
 *                       type: string
 *                     reasons:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get user submissions
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     description: Users see their own submissions, approvers/admins see all submissions
 *     responses:
 *       200:
 *         description: List of submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Submission'
 */
router.post('/', authorizeRoles('user', 'admin'), createSubmission);
router.get('/', authorizeRoles('user', 'approver', 'admin'), getUserSubmissions);

/**
 * @swagger
 * /submissions/all:
 *   get:
 *     summary: Get all submissions with filtering (Admin/Approver dashboard)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, escalated]
 *         description: Filter by submission status
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, AutoHigh, NoGo]
 *         description: Filter by risk level
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated list of all submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submissions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Submission'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       403:
 *         description: Access denied
 */
//router.get('/all', authorizeRoles('approver', 'admin'), getAllSubmissions);

/**
 * @swagger
 * /submissions/{id}:
 *   get:
 *     summary: Get submission by ID
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       403:
 *         description: Access denied (users can only view their own submissions)
 *       404:
 *         description: Submission not found
 *   patch:
 *     summary: Override submission rating (Approver/Admin only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OverrideSubmissionRequest'
 *           example:
 *             finalRating: "Low"
 *             justification: "Manual override after review"
 *             status: "approved"
 *     responses:
 *       200:
 *         description: Submission override applied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       400:
 *         description: Invalid rating value
 *       403:
 *         description: Access denied
 *       404:
 *         description: Submission not found
 */
router.get('/:id', authorizeRoles('user', 'approver', 'admin'), getSubmissionById);
router.patch('/:id', authorizeRoles('approver', 'admin'), overrideSubmission);

/**
 * @swagger
 * /submissions/{id}/reassess:
 *   post:
 *     summary: Reassess submission risk (Admin only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Risk reassessment completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 submission:
 *                   $ref: '#/components/schemas/Submission'
 *                 riskAssessment:
 *                   type: object
 *                   properties:
 *                     calculatedScore:
 *                       type: number
 *                     systemRating:
 *                       type: string
 *                     reasons:
 *                       type: array
 *                       items:
 *                         type: string
 *       403:
 *         description: Access denied
 *       404:
 *         description: Submission not found
 */
router.post('/:id/reassess', authorizeRoles('admin'), reassessRisk);
router.post('/test-risk', authorizeRoles('user', 'admin'), testRiskAssessment);

export default router;