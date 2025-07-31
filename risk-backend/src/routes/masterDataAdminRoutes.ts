// src/routes/masterDataAdminRoutes.ts (BACKEND)
import express from 'express';
import { masterDataAdminController } from '../controllers/masterDataAdminController';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeRoles('admin'));

// Countries Management
router.post('/countries', masterDataAdminController.createCountryRisk);
router.patch('/countries/:id', masterDataAdminController.updateCountryRisk);
router.delete('/countries/:id', masterDataAdminController.deleteCountryRisk);
router.get('/countries/export', masterDataAdminController.exportCountries);

// Employment Management
router.post('/employment', masterDataAdminController.createEmploymentRisk);
router.patch('/employment/:id', masterDataAdminController.updateEmploymentRisk);
router.delete('/employment/:id', masterDataAdminController.deleteEmploymentRisk);
router.get('/employment/export', masterDataAdminController.exportEmployment);

// Products Management
router.post('/products', masterDataAdminController.createProductRisk);
router.patch('/products/:id', masterDataAdminController.updateProductRisk);
router.delete('/products/:id', masterDataAdminController.deleteProductRisk);
router.get('/products/export', masterDataAdminController.exportProducts);

// Business Management
router.post('/business', masterDataAdminController.createBusinessRisk);
router.patch('/business/:id', masterDataAdminController.updateBusinessRisk);
router.delete('/business/:id', masterDataAdminController.deleteBusinessRisk);
router.get('/business/export', masterDataAdminController.exportBusiness);

export default router;