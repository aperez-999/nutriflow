# Environment Variables — Canonical Backend

The Express backend under `backend/` uses the following environment variables. This document is the single source of truth for the canonical env contract. Do not expose real secrets; only names and usage are documented.

---

## Required (core)

| Variable      | Required | Purpose | Used by |
|--------------|----------|---------|---------|
| `MONGO_URI`  | Yes      | MongoDB connection string for all data (users, diets, workouts, chat history). | `backend/config/db.js` |
| `JWT_SECRET` | Yes      | Secret used to sign and verify JWT tokens for auth. | `backend/middleware/authMiddleware.js`, `backend/controllers/authController.js` |

---

## Server

| Variable | Required | Purpose | Used by |
|----------|----------|---------|---------|
| `PORT`   | No       | Port the Express server listens on. Default: `3000`. | `backend/app.js` |
| `NODE_ENV` | No     | `production` or `development`. Affects CORS origin and AI provider (Groq vs Ollama). | `backend/app.js`, `backend/ai/agents/HeadCoachAgent.js`, `backend/middleware/errorHandler.js` |

---

## Frontend / CORS

| Variable       | Required | Purpose | Used by |
|----------------|----------|---------|---------|
| `FRONTEND_URL` | Yes (prod) | Allowed CORS origin in production; used in password-reset and contact emails. | `backend/app.js`, `backend/routes/authRoutes.js` |

---

## Email (password reset & contact)

| Variable         | Required | Purpose | Used by |
|------------------|----------|---------|---------|
| `EMAIL_USERNAME` | Yes (if using reset/contact) | Gmail address for nodemailer (e.g. Gmail SMTP). | `backend/routes/authRoutes.js`, `backend/routes/contactRoutes.js` |
| `EMAIL_PASSWORD` | Yes (if using reset/contact) | Gmail app password (not main account password). | `backend/routes/authRoutes.js`, `backend/routes/contactRoutes.js` |

---

## External APIs

| Variable        | Required | Purpose | Used by |
|-----------------|----------|---------|---------|
| `USDA_API_KEY`  | Yes (food search) | USDA FoodData Central API key for food search. | `backend/controllers/foodController.js` |
| `NINJA_API_KEY` | Yes (exercise search) | API Ninjas Exercise API key for exercise search. | `backend/controllers/workoutController.js` |

---

## AI (Groq — production)

| Variable       | Required | Purpose | Used by |
|----------------|----------|---------|---------|
| `GROQ_API_KEY` | Yes (prod AI) | Groq API key for chat completions when `NODE_ENV=production`. | `backend/ai/agents/HeadCoachAgent.js` |
| `GROQ_MODEL`   | No       | Groq model name. Default: `llama3-8b-8192`. | `backend/ai/agents/HeadCoachAgent.js`, `backend/app.js` (health) |

---

## AI (Ollama — development)

| Variable      | Required | Purpose | Used by |
|---------------|----------|---------|---------|
| `OLLAMA_URL`  | No       | Ollama base URL. Default: `http://localhost:11434`. | `backend/ai/agents/HeadCoachAgent.js`, `backend/app.js` (health) |
| `OLLAMA_MODEL`| No       | Ollama model name. Default: `llama3:latest`. | `backend/ai/agents/HeadCoachAgent.js`, `backend/app.js` (health) |

---

## Summary

- **Canonical backend:** `backend/` (Express).
- **Env file:** Copy `backend/.env.example` to `backend/.env` and fill in real values. Never commit `.env`.
- **Archived `api-legacy/`:** No longer part of the runtime; its env usage is not documented here.
