import express from 'express';
import { searchFood } from '../controllers/foodController.js';
import { lookUpBarcode } from '../controllers/barcodeController.js';
import { estimateMeal } from '../controllers/mealEstimateController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiBurstLimiter, dailyAllowance, foodLookupLimiter } from '../middleware/rateLimits.js';

const router = express.Router();

router.get('/search', foodLookupLimiter, searchFood);
router.get('/barcode/:code', foodLookupLimiter, lookUpBarcode);
// An AI estimate costs a model call, so it needs an account and has its own daily allowance.
router.post('/estimate', aiBurstLimiter, protect, dailyAllowance('estimate'), estimateMeal);

export default router;
