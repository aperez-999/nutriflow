/**
 * Local development entry: runs the Express app with app.listen().
 * Used by npm run dev and npm start. On Vercel, api/index.js runs the same app.
 */
import app from './app.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
