import express from 'express';
import { check, validationResult } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { deleteWeighIn, getEnergy, getWeighIns, saveWeighIn } from '../controllers/weighInController.js';

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid request' });
  }
  return next();
};

const dayKey = check('dayKey', 'Day must be formatted YYYY-MM-DD').matches(/^\d{4}-\d{2}-\d{2}$/);

router.use(protect);

router.get('/', getWeighIns);
router.get('/energy', getEnergy);
router.put(
  '/:dayKey',
  [dayKey, check('kg', 'Weight must be between 25 and 350 kg').isFloat({ min: 25, max: 350 })],
  validateRequest,
  saveWeighIn
);
router.delete('/:dayKey', [dayKey], validateRequest, deleteWeighIn);

export default router;
