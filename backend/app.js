import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import dietRoutes from './routes/dietRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import checkInRoutes from './routes/checkInRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import exerciseLibraryRoutes from './routes/exerciseLibraryRoutes.js';
import planRoutes from './routes/planRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import weighInRoutes from './routes/weighInRoutes.js';
import { getHealth } from './controllers/aiController.js';
import { apiLimiter } from './middleware/rateLimits.js';

// The Express app, shared by local development (server.js) and Vercel (api/index.js).
const app = express();
app.set('trust proxy', 1);

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

// Every limit is listed in middleware/rateLimits.js.
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/diets', dietRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/weights', weighInRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/exercises', exerciseLibraryRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);
app.get('/api/health', getHealth);

app.use(errorHandler);

export default app;
