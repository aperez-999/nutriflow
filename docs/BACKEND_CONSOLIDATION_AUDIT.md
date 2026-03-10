## Backend Consolidation Audit — NutriFlow v2

### A. Canonical backend decision

- **Canonical backend**: `backend/` (Express + MongoDB).
- **Legacy / duplicate surface**: `api/` (serverless-style handlers plus `_models` and `_lib`).
- **Canonical AI layer**: `backend/ai/` (orchestrator + agents + tools + prompts).
- **Canonical models**: `backend/models/`.

All future backend work should target the Express stack under `backend/`. The `api/` tree is treated as legacy duplication and a candidate for archival.

---

### B. Duplicated surfaces

#### 1. Auth

- **Express** (canonical):
  - `backend/routes/authRoutes.js`
  - `backend/controllers/authController.js`
  - Uses `backend/models/User.js`.
- **Serverless (duplicate)**:
  - `api/auth/login.js`
  - `api/auth/register.js`
  - `api/auth/forgot-password.js`
  - `api/auth/reset-password/[token].js`
  - Uses `api/_models/User.js` and `api/_lib/db.js`.

These implement the same login/register/reset flows with different wiring.

#### 2. AI chat

- **Express** (canonical):
  - `backend/app.js` → `POST /api/ai/chat` → `orchestrateAI()` from `backend/ai/orchestrator/orchestrate.js`.
  - AI logic in `backend/ai/agents/HeadCoachAgent.js` and `backend/utils/aiUtils.js`.
- **Serverless (duplicate)**:
  - `api/ai/chat.js`:
    - Standalone Groq call, its own system prompt, its own categorization and suggestions map, and its own default workout plan.
    - Uses `api/_lib/db.js` and `api/_models/ChatMessage.js` for history in some flows.

The serverless handler re-implements the coach behavior that already lives in the Express AI layer.

#### 3. Chat history

- **Express** (canonical):
  - `backend/routes/chatRoutes.js`:
    - `POST /api/chat/history` (save bulk history).
    - `GET /api/chat/history` (load recent history).
    - `DELETE /api/chat/history` (clear history).
  - Uses `backend/models/ChatMessage.js`.
- **Serverless (duplicate)**:
  - `api/chat/history.js`:
    - Defines `GET`, `POST`, `DELETE` for `/api/chat/history`.
    - Uses `api/_models/ChatMessage.js` and `api/_lib/db.js`.

The endpoints and semantics are effectively mirrored in both stacks.

#### 4. Food search

- **Express (canonical)**:
  - `backend/routes/foodRoutes.js` → `GET /api/food/search`.
  - `backend/controllers/foodController.js` (USDA API).
- **Serverless (duplicate)**:
  - `api/food/search.js` → `GET /api/food/search`.

#### 5. Exercise search

- **Express (canonical)**:
  - `backend/routes/exerciseRoutes.js` → `GET /api/exercise/search`.
  - `backend/controllers/workoutController.js` (Ninja Exercise API).
- **Serverless (duplicate)**:
  - `api/exercise/search.js` → `GET /api/exercise/search`.

#### 6. Contact

- **Express (canonical)**:
  - `backend/routes/contactRoutes.js` → `/api/contact`.
- **Serverless (duplicate)**:
  - `api/contact/index.js` → `POST /api/contact`.

#### 7. REST-style collections

- **Express (canonical)**:
  - `backend/routes/dietRoutes.js` → `/api/diets`.
  - `backend/routes/workoutRoutes.js` → `/api/workouts`.
  - Controllers: `backend/controllers/{dietController,workoutController}.js`.
- **Serverless (duplicate)**:
  - `api/[collection].js` → `/api/[collection]`.
  - `api/[collection]/[...id].js` → `/api/[collection]/[...id]`.
  - Generic handler that maps `diets` and `workouts` to Mongo collections.

These provide a parallel CRUD surface for the same domain entities.

#### 8. Models

- **Canonical models**:
  - `backend/models/User.js`
  - `backend/models/Diet.js`
  - `backend/models/Workout.js`
  - `backend/models/ChatMessage.js`
- **Duplicate models**:
  - `api/_models/User.js`
  - `api/_models/Diet.js`
  - `api/_models/Workout.js`
  - `api/_models/ChatMessage.js`

The schemas in `_models` are effectively the same domain objects.

#### 9. Infrastructure / DB helpers

- **Canonical**:
  - `backend/config/db.js` (connects via `MONGO_URI`).
- **Duplicate**:
  - `api/_lib/db.js` (its own Mongo connect logic).
  - `api/_lib/middleware.js` (auth middleware variant).

---

### C. Import / reference scan

- **Imports of `api/` from frontend/backend code**:
  - A search for `from 'api/` or `from \"api/` in `*.js` files yielded **no matches**. The `api/` tree is not imported anywhere directly.
- **Imports of `api/_models` or `api/_lib`**:
  - Only the serverless handlers inside `api/` use `_models` and `_lib`.
  - No code under `backend/` or `frontend/` imports from `api/_models` or `api/_lib`.
- **Frontend API layer**:
  - `frontend/src/services/api.js` calls **Express-style routes**:
    - `/api/diets`, `/api/workouts`, `/api/auth/*`, `/api/contact`, `/api/food/search`, `/api/exercise/search`, `/api/ai/chat`, `/api/chat/history`, `/api/health`.
  - These are all implemented by Express via:
    - `backend/routes/*` and `backend/app.js`.
  - There are no references in the frontend to Next/Vercel-style dynamic routes (`/api/[collection]`, `/api/ai/chat` via edge functions, etc.).

Conclusion: the `api/` tree is **self-contained** and only used by itself; the live app (frontend + backend) uses Express endpoints.

---

### D. Consolidation plan

**Canonical backend stack (to keep and invest in):**

- `backend/app.js` — Express entry point.
- `backend/config/db.js` — database connection.
- `backend/routes/*.js` — diets, workouts, auth, contact, chat history, food search, exercise search.
- `backend/controllers/*.js` — business logic.
- `backend/models/*.js` — single source of truth for Mongoose models.
- `backend/middleware/*.js` — error handler, auth middleware.
- `backend/ai/**` — AI orchestrator, agents, tools, prompts, AI utilities.

**Legacy / duplicate serverless stack (to archive):**

- Entire `api/` directory:
  - `api/ai/chat.js`
  - `api/food/search.js`
  - `api/exercise/search.js`
  - `api/chat/history.js`
  - `api/auth/*.js`
  - `api/contact/index.js`
  - `api/[collection].js`
  - `api/[collection]/[...id].js`
  - `api/_models/*`
  - `api/_lib/*`

**Planned consolidation actions:**

1. **Make Express backend canonical**
   - No change in route paths; ensure `/api/*` endpoints remain as implemented in `backend/routes` and `backend/app.js`.
   - Confirm AI chat goes through `orchestrateAI()` (already true in `backend/app.js`).

2. **Archive the serverless backend**
   - Move the entire `api/` directory to `api-legacy/` at the repo root (or another clearly named archive folder).
   - This preserves the old code for reference but removes it from the active runtime surface (e.g., Vercel will no longer auto-detect handlers there).

3. **Models**
   - Treat `backend/models/*` as the **only live models**.
   - `_models` under `api/` becomes archived along with the rest of the `api` tree.

4. **AI handling**
   - Keep AI logic exclusively in:
     - `backend/ai/agents/HeadCoachAgent.js`
     - `backend/ai/orchestrator/orchestrate.js`
     - `backend/utils/aiUtils.js`
   - Remove duplicate AI logic in `api/ai/chat.js` by archiving that file.

5. **Environment variables**
   - Canonical env usage will be:
     - `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`
     - `GROQ_API_KEY`, `GROQ_MODEL`
     - `OLLAMA_URL` (or host), `OLLAMA_MODEL`
     - `USDA_API_KEY`, `NINJA_API_KEY`
     - `EMAIL_USERNAME`, `EMAIL_PASSWORD`
   - API-side aliases and fallbacks for Groq in `api/ai/chat.js` become irrelevant once archived.

6. **Docs**
   - Keep `NUTRIFLOW_2.0_ARCHITECTURE.md` as the high-level design doc.
   - Add:
     - `docs/BACKEND_CONSOLIDATION_REPORT.md` (final report after changes).
     - `docs/ENVIRONMENT_VARIABLES.md` documenting the canonical env contract.

This audit is the **pre-change snapshot**. The next steps are to:

- Archive `api/` safely.
- Verify Express routes and models cover all frontend needs.
- Standardize env docs.
- Produce a final consolidation report once changes are applied.

