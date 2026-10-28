import express from 'express';
import { searchFood } from '../controllers/foodController.js';
import { lookUpBarcode } from '../controllers/barcodeController.js';
import { estimateMeal } from '../controllers/mealEstimateController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiChatLimiter } from '../middleware/rateLimits.js';

const router = express.Router();

router.get('/search', searchFood);
router.get('/barcode/:code', lookUpBarcode);
// An AI estimate costs a model call, so it needs an account and shares the chat's limit.
router.post('/estimate', aiChatLimiter, protect, estimateMeal);

export default router;
