import express from 'express';
import { searchFood } from '../controllers/foodController.js';

const router = express.Router();

router.get('/search', searchFood);

export default router;
