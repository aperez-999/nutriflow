import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import dietRoutes from './routes/dietRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://nutriflow.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/diets', dietRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});