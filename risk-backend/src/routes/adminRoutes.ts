// src/routes/adminRoutes.ts
import express from 'express';
import {
  getRiskParameters,
  addRiskParameter,
  updateRiskParameter,
  deleteRiskParameter,
  getAdminSettings,
  addAdminSetting,
  updateAdminSetting,
  deleteAdminSetting,
  getScoringConfig,
  updateScoringConfig
} from '../controllers/adminController';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /admin/risk-parameters:
 *   get:
 *     summary: Get all risk parameters
 *     tags: [Admin - Risk Parameters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of risk parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RiskParameter'
 *       403:
 *         description: Access denied
 *   post:
 *     summary: Add a new risk parameter
 *     tags: [Admin - Risk Parameters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RiskParameterRequest'
 *           example:
 *             category: "Country"
 *             parameter: "Nigeria"
 *             riskLevel: "High"
 *             scoreValue: 30
 *     responses:
 *       201:
 *         description: Risk parameter created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RiskParameter'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Access denied
 */
router.get('/risk-parameters', authorizeRoles('admin'), getRiskParameters);
router.post('/risk-parameters', authorizeRoles('admin'), addRiskParameter);

/**
 * @swagger
 * /admin/risk-parameters/{id}:
 *   patch:
 *     summary: Update a risk parameter
 *     tags: [Admin - Risk Parameters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Risk parameter ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RiskParameterRequest'
 *     responses:
 *       200:
 *         description: Risk parameter updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RiskParameter'
 *       400:
 *         description: Invalid ID or input
 *       404:
 *         description: Risk parameter not found
 *   delete:
 *     summary: Delete a risk parameter
 *     tags: [Admin - Risk Parameters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Risk parameter ID
 *     responses:
 *       200:
 *         description: Risk parameter deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Risk parameter not found
 */
router.patch('/risk-parameters/:id', authorizeRoles('admin'), updateRiskParameter);
router.delete('/risk-parameters/:id', authorizeRoles('admin'), deleteRiskParameter);

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: Get all admin settings
 *     tags: [Admin - Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admin settings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminSetting'
 *   post:
 *     summary: Add a new admin setting
 *     tags: [Admin - Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminSettingRequest'
 *           example:
 *             key: "score_threshold_high"
 *             description: "High risk threshold"
 *             value: "75"
 *     responses:
 *       201:
 *         description: Admin setting created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSetting'
 *       409:
 *         description: Setting with this key already exists
 */
router.get('/settings', authorizeRoles('admin'), getAdminSettings);
router.post('/settings', authorizeRoles('admin'), addAdminSetting);

/**
 * @swagger
 * /admin/settings/{id}:
 *   patch:
 *     summary: Update an admin setting
 *     tags: [Admin - Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Admin setting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminSettingRequest'
 *     responses:
 *       200:
 *         description: Admin setting updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSetting'
 *       404:
 *         description: Admin setting not found
 *   delete:
 *     summary: Delete an admin setting
 *     tags: [Admin - Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Admin setting ID
 *     responses:
 *       200:
 *         description: Admin setting deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.patch('/settings/:id', authorizeRoles('admin'), updateAdminSetting);
router.delete('/settings/:id', authorizeRoles('admin'), deleteAdminSetting);

/**
 * @swagger
 * /admin/scoring-config:
 *   get:
 *     summary: Get scoring configuration
 *     tags: [Admin - Scoring Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of scoring configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   value:
 *                     type: number
 *                   description:
 *                     type: string
 */
router.get('/scoring-config', authorizeRoles('admin'), getScoringConfig);

/**
 * @swagger
 * /admin/scoring-config/{name}:
 *   patch:
 *     summary: Update scoring configuration
 *     tags: [Admin - Scoring Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Scoring configuration updated
 */
router.patch('/scoring-config/:name', authorizeRoles('admin'), updateScoringConfig);

export default router;