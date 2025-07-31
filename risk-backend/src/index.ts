// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import submissionRoutes from './routes/submissionRoutes';
import adminRoutes from './routes/adminRoutes';
import masterDataRoutes from './routes/masterDataRoutes';
import { setupSwagger } from './swagger';
import masterDataAdminRoutes from './routes/masterDataAdminRoutes'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://*.railway.app',  // Allow Railway domains
    'https://*.up.railway.app' // Railway's new domain format
  ],
  credentials: true
}));
// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use('/auth', authRoutes);
app.use('/submissions', submissionRoutes);
app.use('/admin', adminRoutes);
app.use('/master-data', masterDataRoutes);
app.use('/admin/master-data', masterDataAdminRoutes); 

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Risk Scoring API is running"
 */
app.get('/', (req, res) => {
  res.send('Risk Scoring API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;