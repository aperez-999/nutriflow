import express from 'express';
import path from 'path';
import cors from 'cors';
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
const __dirname = path.resolve();

let _fetch = globalThis.fetch;
async function fetchCompat(...args) {
  if (!_fetch) {
    const mod = await import('node-fetch');
    _fetch = mod.default;
  }
  return _fetch(...args);
}

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
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/exercise', exerciseRoutes);

import { categorizeMessage, suggestionsByCategory, getDefaultWorkoutPlan, generateFallbackResponse } from './utils/aiUtils.js';

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context, history = [] } = req.body || {};
    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const provider = process.env.NODE_ENV === 'production' ? 'groq' : 'ollama';
    const messages = [
      { role: 'system', content: 'You are an AI Fitness Coach. Provide personalized, actionable fitness advice. Focus on form, safety, and progressive improvement.' },
      { role: 'system', content: `Context Summary:\n- Recent workouts: ${context?.recentWorkouts?.length || 0}\n- Recent diets: ${context?.recentDiets?.length || 0}\n- User name: ${context?.userName || 'User'}` },
      ...history.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content })),
      { role: 'user', content: message }
    ];

    const isPlanRequest = /\[\[RETURN_JSON_WORKOUT_PLAN\]\]/i.test(message);
    if (isPlanRequest) {
      messages.splice(2, 0, { 
        role: 'system', 
        content: 'Return ONLY a valid JSON array of workout objects with fields: title, duration, intensity, focusAreas, exercises (with name, sets, reps, interval), videoId, description, calories, difficulty.' 
      });
    }

    try {
      let response, data;
      const type = categorizeMessage(message);

      if (provider === 'groq') {
        if (!process.env.GROQ_API_KEY) throw new Error('Missing GROQ_API_KEY');
        response = await fetchCompat('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || 'llama3-8b-8192',
            messages,
            temperature: 0.7
          })
        });
        
        if (!response.ok) throw new Error(`Groq error ${response.status}`);
        data = await response.json();
        let content = data?.choices?.[0]?.message?.content?.trim() || '';
        
        if (isPlanRequest && (!content.includes('[') || /^\s*\[\s*\]\s*$/.test(content))) {
          content = JSON.stringify(getDefaultWorkoutPlan());
        }
        
        return res.status(200).json({
          content,
          suggestions: suggestionsByCategory[type],
          source: 'groq'
        });
      }

      if (provider === 'ollama') {
        const base = process.env.OLLAMA_URL || 'http://localhost:11434';
        response = await fetchCompat(`${base.replace(/\/$/, '')}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'llama3:latest',
            messages,
            stream: false
          })
        });
        
        if (!response.ok) throw new Error(`Ollama error ${response.status}`);
        data = await response.json();
        const content = data?.message?.content?.trim();
        
        return res.status(200).json({
          content,
          suggestions: suggestionsByCategory[type],
          source: 'ollama'
        });
      }

      const fallback = generateFallbackResponse(message, context);
      return res.status(200).json({ ...fallback, source: 'fallback' });
    } catch (err) {
      console.error('AI provider error:', err);
      const fallback = generateFallbackResponse(message, context);
      return res.status(200).json({ ...fallback, source: 'fallback' });
    }
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
