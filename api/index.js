/**
 * Vercel serverless entry. vercel.json rewrites every /api/* request here, keeping the
 * original URL, so the Express routes match as they do locally.
 *
 * Vercel calls Node functions with (req, res), which an Express app handles directly.
 * The MongoDB connection is awaited first (and reused across warm invocations).
 */
import app from '../backend/app.js';
import connectDB from '../backend/config/db.js';

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
