import express from 'express';
import nodemailer from 'nodemailer';
import { check, validationResult } from 'express-validator';

const router = express.Router();

router.post('/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('message', 'Message is required').not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, message } = req.body;

      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: process.env.EMAIL_USERNAME, // Send to yourself
        subject: `NutriFlow Contact Form - Message from ${name}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `
      });

      res.json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  }
);

export default router; 