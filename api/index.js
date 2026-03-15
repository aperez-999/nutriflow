/**
 * Vercel serverless entry (top-level /api). All /api/* traffic is routed here.
 * Awaits MongoDB connection before handling so routes never hang waiting for DB.
 */
import serverless from 'serverless-http';
import app from '../backend/app.js';
import connectDB from '../backend/config/db.js';

const handler = serverless(app);

export default async function (req, res) {
  await connectDB();
  return handler(req, res);
}
