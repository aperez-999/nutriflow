import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
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
import checkInRoutes from './routes/checkInRoutes.js';
import exerciseLibraryRoutes from './routes/exerciseLibraryRoutes.js';
import { DEFAULT_GROQ_MODEL, selectProvider } from './ai/config/aiProvider.js';
import { identifyUser } from './middleware/authMiddleware.js';

const app = express();
app.set('trust proxy', 1);

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

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api/diets', dietRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/auth/forgot-password', forgotPasswordLimiter);
app.use('/api/auth', authRoutes);
if (process.env.NODE_ENV !== 'production') console.log('Auth routes mounted');
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/exercises', exerciseLibraryRoutes);

import { orchestrateAI } from './ai/orchestrator/orchestrate.js';

// AI chat: rate-limited, then delegates to the AI orchestration layer.
const handleAIChat = async (req, res) => {
  try {
    const { message, context, history = [] } = req.body || {};
    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Only a verified token may select whose data the agents read; never trust a client-sent userId.
    const safeContext = { ...context, userId: req.user ? String(req.user._id) : undefined };
    const result = await orchestrateAI({ message, context: safeContext, history });
    return res.status(200).json(result);
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ message: 'Error generating AI response' });
  }
};

app.post('/api/ai/chat', aiChatLimiter, identifyUser, handleAIChat);
app.post('/api/chat', aiChatLimiter, identifyUser, handleAIChat);

// Health check and not-found helpers
app.get('/api/health', (req, res) => {
  const provider = selectProvider();
  const model = provider === 'groq' ? 
    process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL : 
    process.env.OLLAMA_MODEL || 'llama3:latest';

  const payload = {
    ok: true,
    provider,
    model,
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.env = process.env.NODE_ENV || 'development';
    payload.baseUrl = provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : `${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/chat`;
  }

  res.json(payload);
});

// Error handler middleware
app.use(errorHandler);

export default app;
