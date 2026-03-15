# Backend API (archived)

The serverless entry point for Vercel has moved to the **repository root**:

- **`/api/index.js`** — wraps the Express app with serverless-http. Vercel only runs serverless functions from the top-level `api/` directory.

Local development still uses **`backend/server.js`** (no change).
