/**
 * Vercel serverless entry (top-level /api). All /api/* traffic is routed here.
 * Wraps the Express app so /api/auth/login, /api/ai/chat, /api/workouts, etc. work.
 */
import serverless from 'serverless-http';
import app from '../backend/app.js';

export default serverless(app);
