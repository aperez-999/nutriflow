import express from 'express';
import { check } from 'express-validator';
import { sendContactMessage } from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/rateLimits.js';

const router = express.Router();

router.post(
  '/',
  contactLimiter,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('message', 'Message is required').not().isEmpty(),
  ],
  sendContactMessage
);

export default router;
