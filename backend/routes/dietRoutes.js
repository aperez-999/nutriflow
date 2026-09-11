import express from 'express';
import { check, validationResult } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { 
    getDiets, 
    createDiet, 
    updateDiet, 
    deleteDiet 
} from '../controllers/dietController.js';

const router = express.Router();

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid request' });
    }

    return next();
};

// Protect all routes
router.use(protect);

// Routes
router.route('/')
    .get(getDiets)
    .post(
        [
            check('date', 'Date is required').exists({ checkFalsy: true }),
            check('mealType', 'Meal type is required').exists({ checkFalsy: true }),
            check('foodName', 'Food name is required').exists({ checkFalsy: true }),
            check('calories', 'Calories must be a valid number').isFloat({ min: 0 }),
        ],
        validateRequest,
        createDiet
    );

router.route('/:id')
    .put(
        [
            check('id', 'Invalid diet record id').isMongoId(),
            check('calories').optional({ checkFalsy: true }).isFloat({ min: 0 }),
        ],
        validateRequest,
        updateDiet
    )
    .delete(
        [
            check('id', 'Invalid diet record id').isMongoId(),
        ],
        validateRequest,
        deleteDiet
    );

export default router;
