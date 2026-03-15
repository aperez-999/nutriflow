/**
 * Local development entry: runs the Express app with app.listen().
 * Use this for npm run dev / npm run start. For Vercel, the serverless
 * handler is backend/api/index.js.
 */
import app from './app.js';

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
