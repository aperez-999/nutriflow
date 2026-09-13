import express from 'express';
import { check, validationResult } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { getCheckIns, upsertCheckIn } from '../controllers/checkInController.js';

const router = express.Router();

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid request' });
    }

    return next();
};

router.use(protect);

router.get('/', getCheckIns);

router.put(
    '/:dayKey',
    [
        check('dayKey', 'Day must be formatted YYYY-MM-DD').matches(/^\d{4}-\d{2}-\d{2}$/),
        check('sleepHours', 'Sleep must be between 0 and 14 hours').isFloat({ min: 0, max: 14 }),
        check('energy', 'Energy must be a rating from 1 to 5').isInt({ min: 1, max: 5 }),
        check('soreness', 'Soreness must be a rating from 1 to 5').isInt({ min: 1, max: 5 }),
        check('waterCups', 'Water must be between 0 and 20 cups').optional().isInt({ min: 0, max: 20 }),
    ],
    validateRequest,
    upsertCheckIn
);

export default router;
