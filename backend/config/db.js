import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const CONNECT_OPTS = { serverSelectionTimeoutMS: 10000 };

let connPromise = null;

/**
 * Cached connection for serverless: connect once per container, reuse.
 * Avoids blocking the request lifecycle and prevents multiple connect() calls.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (connPromise) return connPromise;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    const err = new Error('MONGO_URI is not set');
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }

  connPromise = mongoose
    .connect(uri, CONNECT_OPTS)
    .then(() => {
      console.log('MongoDB connected');
      return mongoose.connection;
    })
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message);
      connPromise = null;
      if (typeof process.env.VERCEL === 'undefined' && typeof process.env.AWS_LAMBDA_FUNCTION_NAME === 'undefined') {
        process.exit(1);
      }
      throw error;
    });

  return connPromise;
};

export default connectDB;
