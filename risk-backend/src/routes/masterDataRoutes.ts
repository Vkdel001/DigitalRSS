// src/routes/masterDataRoutes.ts
import express from 'express';
import { masterDataController } from '../controllers/masterDataController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /master-data:
 *   get:
 *     summary: Get all master data (countries, employment, products, business types)
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', masterDataController.getAllMasterData);

/**
 * @swagger
 * /master-data/countries:
 *   get:
 *     summary: Get all countries with risk levels
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 */
router.get('/countries', masterDataController.getCountries);

/**
 * @swagger
 * /master-data/countries/{riskLevel}:
 *   get:
 *     summary: Get countries by risk level
 *     tags: [Master Data]
 *     parameters:
 *       - in: path
 *         name: riskLevel
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, AutoHigh, NoGo]
 */
router.get('/countries/:riskLevel', masterDataController.getCountriesByRisk);

/**
 * @swagger
 * /master-data/employment:
 *   get:
 *     summary: Get all employment types with risk levels
 *     tags: [Master Data]
 */
router.get('/employment', masterDataController.getEmploymentTypes);

/**
 * @swagger
 * /master-data/products:
 *   get:
 *     summary: Get all products with risk levels
 *     tags: [Master Data]
 */
router.get('/products', masterDataController.getProducts);

/**
 * @swagger
 * /master-data/business:
 *   get:
 *     summary: Get all business types with risk levels
 *     tags: [Master Data]
 */
router.get('/business', masterDataController.getBusinessTypes);

/**
 * @swagger
 * /master-data/risk/{type}/{value}:
 *   get:
 *     summary: Get risk level for specific value
 *     tags: [Master Data]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [country, employment, product, business]
 *       - in: path
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/risk/:type/:value', masterDataController.getRiskLevel);

export default router;