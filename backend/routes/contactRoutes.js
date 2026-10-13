import express from 'express';
import { check } from 'express-validator';
import { sendContactMessage } from '../controllers/contactController.js';

const router = express.Router();

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('message', 'Message is required').not().isEmpty(),
  ],
  sendContactMessage
);

export default router;
