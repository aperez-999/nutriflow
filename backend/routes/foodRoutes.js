import express from 'express';
import { searchFood } from '../controllers/foodController.js';
import { lookUpBarcode } from '../controllers/barcodeController.js';

const router = express.Router();

router.get('/search', searchFood);
router.get('/barcode/:code', lookUpBarcode);

export default router;
