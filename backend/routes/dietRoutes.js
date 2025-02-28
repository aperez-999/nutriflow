import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    getDiets, 
    createDiet, 
    updateDiet, 
    deleteDiet 
} from '../controllers/dietController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route('/')
    .get(getDiets)
    .post(createDiet);

router.route('/:id')
    .put(updateDiet)
    .delete(deleteDiet);

export default router;