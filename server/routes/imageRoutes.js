import express from 'express';
import { generateImage } from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/generate', protect, apiLimiter, generateImage);

export default router;
