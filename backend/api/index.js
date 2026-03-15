/**
 * Vercel serverless entry: wraps the Express app with serverless-http.
 * All routes (e.g. /api/auth, /api/ai/chat, /api/workouts, /api/diets) are
 * handled by the same Express app. MongoDB connection runs when app is loaded.
 */
import serverless from 'serverless-http';
import app from '../app.js';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default serverless(app);
