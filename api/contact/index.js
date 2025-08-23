import nodemailer from 'nodemailer';
import connectDB from '../_lib/db.js';
import { handleCors } from '../_lib/middleware.js';

export default async function handler(req, res) {
  // Handle CORS
  handleCors(req, res, () => {});
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { name, email, message } = req.body;

    // Validate input
    const errors = [];
    if (!name || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Name is required' });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.push({ field: 'email', message: 'Please include a valid email' });
    }
    if (!message || message.trim().length === 0) {
      errors.push({ field: 'message', message: 'Message is required' });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

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