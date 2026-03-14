import express from 'express';
import path from 'path';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import dietRoutes from './routes/dietRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';

const app = express();

const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: 'Too many requests. Please try again in a minute.' },
});
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Too many requests. Please try again in a minute.' },
});
const __dirname = path.resolve();

connectDB();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api/diets', dietRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/auth/forgot-password', forgotPasswordLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/exercise', exerciseRoutes);

import { orchestrateAI } from './ai/orchestrator/orchestrate.js';

// AI chat: rate-limited, then delegates to the AI orchestration layer.
app.post('/api/ai/chat', aiChatLimiter, async (req, res) => {
  try {
    const { message, context, history = [] } = req.body || {};
    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const result = await orchestrateAI({ message, context, history });
    return res.status(200).json(result);
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ message: 'Error generating AI response' });
  }
});

// Health check and not-found helpers
app.get('/api/health', (req, res) => {
  const provider = process.env.NODE_ENV === 'production' ? 'groq' : 'ollama';
  const model = provider === 'groq' ? 
    process.env.GROQ_MODEL || 'llama3-8b-8192' : 
    process.env.OLLAMA_MODEL || 'llama3:latest';
  
  res.json({ 
    ok: true, 
    provider,
    model,
    env: process.env.NODE_ENV || 'development',
    baseUrl: provider === 'groq' ? 
      'https://api.groq.com/openai/v1/chat/completions' : 
      `${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/chat`
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
