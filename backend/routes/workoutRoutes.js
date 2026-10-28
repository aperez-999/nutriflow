import express from 'express';
import { check, validationResult } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { 
    getWorkouts, 
    createWorkout, 
    updateWorkout, 
    deleteWorkout 
} from '../controllers/workoutController.js';

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
    .get(getWorkouts)
    .post(
        [
            check('date', 'Date is required').exists({ checkFalsy: true }),
            check('type', 'Workout type is required').exists({ checkFalsy: true }),
            check('duration', 'Duration must be a valid number').isFloat({ min: 0 }),
            check('externalId', 'External id must be text').optional().isString().isLength({ max: 200 }),
        ],
        validateRequest,
        createWorkout
    );

router.route('/:id')
    .put(
        [
            check('id', 'Invalid workout record id').isMongoId(),
            check('duration').optional({ checkFalsy: true }).isFloat({ min: 0 }),
            check('caloriesBurned').optional({ checkFalsy: true }).isFloat({ min: 0 }),
            check('intensity').optional({ checkFalsy: true }).isIn(['Low', 'Medium', 'High', 'low', 'medium', 'high']),
        ],
        validateRequest,
        updateWorkout
    )
    .delete(
        [
            check('id', 'Invalid workout record id').isMongoId(),
        ],
        validateRequest,
        deleteWorkout
    );

export default router;
