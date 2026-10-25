import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getPlans, savePlan, deletePlan } from '../controllers/planController.js';

const router = express.Router();

router.use(protect);

router.get('/', getPlans);
router.put('/:clientId', savePlan);
router.delete('/:clientId', deletePlan);

export default router;
