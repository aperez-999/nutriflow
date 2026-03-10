# Backend Consolidation Report — NutriFlow v2

## 1. Summary

Backend consolidation was performed to make the **Express backend under `backend/`** the single canonical backend and to remove the duplicated serverless surface that lived under `api/`.

- **Action taken:** The entire `api/` directory was **moved** (not deleted) to `api-legacy/` at the repository root. No code was permanently removed.
- **Reason:** The project had two backend surfaces (Express and serverless) implementing the same auth, AI chat, chat history, food/exercise search, contact, and CRUD. This caused duplication and drift risk. The frontend already targets Express via `frontend/src/services/api.js` (base URL and paths). Archiving the serverless tree removes it from the active runtime while preserving it for reference.

---

## 2. Canonical backend

The following is now the **single source of truth**:

| Area | Location |
|------|----------|
| **Entry point** | `backend/app.js` |
| **Database** | `backend/config/db.js` (uses `MONGO_URI`) |
| **Models** | `backend/models/` — `User.js`, `Diet.js`, `Workout.js`, `ChatMessage.js` |
| **Routes** | `backend/routes/` — auth, diet, workout, food, exercise, contact, chat |
| **Controllers** | `backend/controllers/` — auth, diet, workout, food (foodController), workout (workoutController for exercise search) |
| **Middleware** | `backend/middleware/` — authMiddleware, errorHandler |
| **AI** | `backend/ai/` — orchestrator, HeadCoachAgent, tools, prompts; `backend/utils/aiUtils.js` |

All `/api/*` endpoints used by the frontend are served by this Express app. There are no active handlers in `api/` anymore (the folder has been moved to `api-legacy/`).

---

## 3. Archived files

The **entire** former `api/` directory was moved to **`api-legacy/`** at the repo root. Contents:

| Path in `api-legacy/` | Description |
|------------------------|-------------|
| `ai/chat.js` | Legacy AI chat serverless handler |
| `food/search.js` | Legacy food search handler |
| `exercise/search.js` | Legacy exercise search handler |
| `chat/history.js` | Legacy chat history handler |
| `auth/login.js` | Legacy login handler |
| `auth/register.js` | Legacy register handler |
| `auth/forgot-password.js` | Legacy forgot-password handler |
| `auth/reset-password/[token].js` | Legacy reset-password handler |
| `contact/index.js` | Legacy contact form handler |
| `[collection].js` | Legacy generic collection list handler |
| `[collection]/[...id].js` | Legacy generic collection item handler |
| `_models/User.js` | Legacy User model |
| `_models/Diet.js` | Legacy Diet model |
| `_models/Workout.js` | Legacy Workout model |
| `_models/ChatMessage.js` | Legacy ChatMessage model |
| `_lib/db.js` | Legacy DB connection helper |
| `_lib/middleware.js` | Legacy auth/CORS middleware |

A **`api-legacy/README.md`** was added inside `api-legacy/` explaining that this is archived legacy serverless duplication, that Express under `backend/` is the canonical backend, and that these files are for reference only and are not part of the active runtime.

---

## 4. Files updated

| File | Change |
|------|--------|
| **`backend/routes/authRoutes.js`** | Added `PUT /reset-password/:token` that shares logic with existing `POST /reset-password/:token`, so the frontend (which calls `PUT /api/auth/reset-password/:token`) works against the canonical backend without changing the frontend. |
| **`backend/.env.example`** | Documented `NINJA_API_KEY` (used by exercise search) and clarified comments for USDA and Ninja keys. |
| **`docs/ENVIRONMENT_VARIABLES.md`** | **Created.** Canonical list of env vars used by the Express backend: MONGO_URI, JWT_SECRET, PORT, NODE_ENV, FRONTEND_URL, EMAIL_*, USDA_API_KEY, NINJA_API_KEY, GROQ_*, OLLAMA_*. For each: name, required/optional, purpose, and where used. No secrets exposed. |
| **`docs/BACKEND_CONSOLIDATION_REPORT.md`** | **Created.** This report. |

No other files were modified. The root `api/` directory no longer exists; only `api-legacy/` exists.

---

## 5. Verification

- **Imports checked:** No active code under `backend/` or `frontend/` imports from `api/`, `api-legacy/`, `api/_models`, or `api/_lib`. The only references to “api” are (1) URL path strings (e.g. `/api/diets`, `/api/ai/chat`) that refer to Express routes, and (2) internal references inside `api-legacy/`, which still resolve correctly within the moved folder.
- **Frontend compatibility checked:** `frontend/src/services/api.js` calls: `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password/:token` (PUT), `/api/diets`, `/api/workouts`, `/api/contact`, `/api/food/search`, `/api/exercise/search`, `/api/ai/chat`, `/api/chat/history` (GET/POST/DELETE), `/api/health`. All of these are implemented in `backend/routes/` and `backend/app.js`. The only fix required was adding the PUT reset-password route in the backend.
- **AI route checked:** `backend/app.js` still wires `POST /api/ai/chat` to `orchestrateAI()` from `backend/ai/orchestrator/orchestrate.js`. No duplicate AI logic remains in the active codebase; the only duplicate was in `api/ai/chat.js`, which is now under `api-legacy/`.
- **Env docs updated:** `docs/ENVIRONMENT_VARIABLES.md` and `backend/.env.example` reflect the canonical backend env contract.

---

## 6. Remaining follow-ups

- **Optional:** Extract the AI route from `backend/app.js` into `backend/routes/aiRoutes.js` and mount it in `app.js` for consistency with other routes. Behavior can remain identical.
- **Optional:** After a period of confidence, delete `api-legacy/` entirely if reference to the old serverless code is no longer needed.
- **Deployment:** If the app was previously deployed with Vercel (or similar) using the `api/` directory as serverless functions, deployment config should be updated so that the backend is the Express server (e.g. hosted elsewhere or via a single serverless proxy to Express). The archived `api-legacy/` folder must not be deployed as active API routes.
