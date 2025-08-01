import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import User from '../_models/User.js';
import connectDB from '../_lib/db.js';
import { handleCors } from '../_lib/middleware.js';

export default async function handler(req, res) {
  // Handle CORS
  handleCors(req, res, () => {});
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Validate input
    const errors = [];
    const { username, email, password } = req.body;

    if (!username || username.trim().length === 0) {
      errors.push({ field: 'username', message: 'Username is required' });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.push({ field: 'email', message: 'Please include a valid email' });
    }
    if (!password || password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be 6 or more characters' });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    // Create token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ 
      result: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }, 
      token 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}