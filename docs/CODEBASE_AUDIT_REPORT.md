# Codebase Audit Report — NutriFlow v2

This report summarizes the production-readiness audit performed on the NutriFlow v2 codebase. The focus was cleanup, performance, and maintainability without changing working functionality or API contracts.

---

## 1. Development debug logs removed

### Changes made

- **backend/ai/agents/WorkoutPlannerAgent.js** — Removed `console.log('Parsed workout plan:', plan)`.
- **backend/ai/agents/MealPlannerAgent.js** — Removed `console.log('Parsed meal plan:', capped)`.
- **backend/ai/agents/InsightsAgent.js** — Removed `console.log('Insights generated:', insights)`.
- **backend/controllers/authController.js** — Removed `console.log("🔹 Incoming Register Request:", req.body)`.
- **backend/routes/authRoutes.js** — Removed all development logs from the forgot-password handler (route hit, email, user not found, token, email config, transporter verify, email sent).
- **frontend/src/components/FitnessHub/AIFitnessChat/utils.js** — Removed `console.log('Could not parse AI recommendations:', error)` from the parse catch block.
- **frontend/src/components/Auth/ForgotPassword.jsx** — Removed `console.log('Submitting forgot password request for:', email)`.

### Left in place

- **backend/app.js** — `console.log(\`Server is running on port ${PORT}\`)` kept as a standard startup log.
- **backend/config/db.js** — `console.log('MongoDB connected')` kept as a standard connection log.
- **backend/routes/authRoutes.js** / **backend/app.js** — `console.error` in catch blocks kept for operational error reporting.

No new logging library was introduced; production can add a logger (e.g. pino) later if desired.

---

## 2. Unused files and archive

### Unused files identified

- **frontend/src/components/legacy/Layout/Footer.jsx** — Old footer; app uses `components/Footer.jsx`.
- **frontend/src/components/legacy/Layout/Header.jsx** — Old header; app uses `components/Navbar.jsx`.

### Actions taken

- Created **archive/** at the project root.
- **archive/README.md** — Describes the archive and that nothing here is part of the active runtime.
- **archive/frontend-legacy/Layout/Footer.jsx** — Copy of legacy Footer (no AuthContext dependency).
- **archive/frontend-legacy/Layout/Header.jsx** — Copy of legacy Header (AuthContext removed so the archive is self-contained).
- Removed **frontend/src/components/legacy/Layout/Footer.jsx** and **Header.jsx** from the active tree.
- **frontend/src/components/legacy/README.md** — Updated to state that contents were moved to `/archive/frontend-legacy/` and not to be imported.

No files were deleted without being archived first. **api-legacy/** was already present and was not modified.

---

## 3. Duplicate logic

### Findings

- **Bullet stripping** — `stripBullet()` (or equivalent) exists in both `WorkoutPlannerAgent.js` and `MealPlannerAgent.js`. Logic is short and agent-specific; consolidating into `backend/ai/utils/` would be a small refactor if desired.
- **Backend validation** — Auth uses `express-validator` in routes; diet/workout routes use controller logic. No duplicate validation helpers found.
- **Formatter usage** — Planner and insights formatters live in `backend/ai/utils/` and are used only by the orchestrator; no duplication.

### Recommendation

- Optional: add `backend/ai/utils/stringHelpers.js` with `stripBullet(line)` and use it in both planner agents to avoid drift.

No duplicate logic was refactored in this pass to avoid behavior changes.

---

## 4. Environment variable usage

### Verification

- All backend env vars used in code are documented in **docs/ENVIRONMENT_VARIABLES.md** and appear in **backend/.env.example**:
  - **Core:** MONGO_URI, JWT_SECRET, PORT, NODE_ENV
  - **Frontend/CORS:** FRONTEND_URL
  - **Email:** EMAIL_USERNAME, EMAIL_PASSWORD
  - **APIs:** USDA_API_KEY, NINJA_API_KEY
  - **AI:** GROQ_API_KEY, GROQ_MODEL, OLLAMA_URL, OLLAMA_MODEL

### Status

- No missing variables were found; no changes to `.env.example` were required.
- Frontend uses `VITE_API_URL` (optional) for API base URL; this is build-time only and not part of the backend env contract.

---

## 5. Backend route structure

### Current structure

- **Routes** — `backend/routes/*.js` define endpoints and validation; auth and contact routes contain inline handler logic for forgot-password and contact form.
- **Controllers** — `backend/controllers/` hold logic for auth (register, login), diet, workout, and food. No controller exists for contact or forgot-password.

### Findings

- **authRoutes.js** — The forgot-password handler is a long `async (req, res)` inline function. It could be moved to `authController.js` (e.g. `forgotPassword`) for consistency and testability.
- **contactRoutes.js** — Similarly, contact send logic could be moved to a `contactController.js`.

### Recommendation

- In a follow-up, extract `forgotPassword` and contact send into controllers and keep routes thin. Not done in this audit to avoid changing behavior.

---

## 6. MongoDB models

### Schemas reviewed

- **User** — username, email, password, resetPasswordToken, resetPasswordExpires. No duplicate schemas. Mongoose assigns `_id`; no extra indexes added for current usage.
- **Diet** — user, date, mealType, foodName, calories, etc. Queries filter by `user` and sort by `date`.
- **Workout** — user, date, type, duration, etc. Same pattern.
- **ChatMessage** — user, role, content, createdAt. Loaded by user and sorted by createdAt.

### Changes made

- **backend/models/Workout.js** — Added `workoutSchema.index({ user: 1, date: -1 })` for user-scoped, date-ordered lists.
- **backend/models/Diet.js** — Added `dietSchema.index({ user: 1, date: -1 })`.
- **backend/models/ChatMessage.js** — Added `chatMessageSchema.index({ user: 1, createdAt: -1 })`.

Naming and schema design are consistent; no duplicate model definitions were found.

---

## 7. AI system structure

### Verification

- **backend/ai/agents/index.js** — Exports and registers `coach`, `workout_plan`, `meal_plan`, `insights`. All agents are exported and used by the orchestrator.
- **backend/ai/utils/** — Contains `formatPlannerOutput.js`, `formatInsightsOutput.js`, `fetchCompat.js`. Formatters are used only by the orchestrator; no unused AI utilities were found.
- **backend/ai/tools/** — `get_user_stats.js` is used by HeadCoachAgent, WorkoutPlannerAgent, MealPlannerAgent, and InsightsAgent.

No unused AI modules were removed; structure is consistent.

---

## 8. Frontend API usage

### Endpoints checked

- **frontend/src/services/api.js** uses:
  - `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password/:token`
  - `/api/workouts`, `/api/diets`
  - `/api/ai/chat`, `/api/chat/history`
  - `/api/food/search`, `/api/exercise/search`
  - `/api/health`

- **backend** exposes:
  - `app.use('/api/auth', authRoutes)` — login, register, forgot-password, reset-password
  - `app.use('/api/workouts', workoutRoutes)`, `app.use('/api/diets', dietRoutes)`
  - `app.post('/api/ai/chat', ...)`, `app.use('/api/chat', chatRoutes)`
  - `app.use('/api/food', foodRoutes)`, `app.use('/api/exercise', exerciseRoutes)`
  - `app.get('/api/health', ...)`

All frontend API calls match existing backend routes. No obsolete or missing endpoints were found.

---

## 9. Bundle size and dependencies

### Frontend dependencies

- No `moment.js`; no heavy date library in use.
- **recharts** — Used for the dashboard calorie chart; single usage is acceptable.
- **react-markdown** + **remark-gfm** — Used for AI chat; no duplicate markdown libraries.
- **framer-motion** — Used for animations and typing indicator; no duplicate animation libs.
- **react-icons** — Tree-shaken by bundler; no full-library import observed.

### Recommendation

- Run `npm run build` and inspect the Vite bundle report (e.g. `vite build --report` if configured) to confirm no unexpectedly large chunks. No dependency changes were made in this audit.

---

## 10. Security review

### Checks performed

- **Hardcoded secrets** — None found. All API keys and secrets are read from `process.env`.
- **Env usage** — Backend uses env for MONGO_URI, JWT_SECRET, GROQ_API_KEY, EMAIL_*, etc. No secrets logged or echoed in responses.
- **Tokens** — JWT is signed with `process.env.JWT_SECRET`; reset tokens are generated with `crypto.randomBytes(32)`. No tokens or passwords returned in API bodies beyond the intended auth response (e.g. token on login/register).
- **Error handling** — `errorHandler` middleware does not send stack traces in production (`process.env.NODE_ENV === 'production' ? null : err.stack`). Generic messages are returned to the client; detailed errors are not exposed.

### Recommendations

- Ensure `.env` is in `.gitignore` and never committed.
- In production, ensure CORS is restricted to `FRONTEND_URL` (already the case when `NODE_ENV=production`).
- Rate limiting or request signing for `/api/auth/forgot-password` and `/api/ai/chat` can be added in a future pass.

---

## 11. Summary and recommended optimizations

### Completed in this audit

- Removed development `console.log`/`console.warn` from backend AI agents, auth controller, auth routes, and frontend chat/forgot-password.
- Archived unused legacy layout components to **archive/frontend-legacy/** and updated legacy README.
- Added MongoDB indexes on Workout (user + date), Diet (user + date), and ChatMessage (user + createdAt).
- Verified env vars, route/controller structure, AI layout, frontend API alignment, and security practices.

### Recommended follow-ups (non-blocking)

1. **Logging** — Introduce a small logger (e.g. pino) and replace remaining `console.log`/`console.error` in backend for levels and structure.
2. **Routes vs controllers** — Move forgot-password and contact handlers into controllers and keep routes as thin wiring.
3. **Shared AI helpers** — Optionally extract `stripBullet` (or similar) into `backend/ai/utils/` and reuse in planner agents.
4. **Bundle report** — Add `vite build --report` (or plugin) and periodically review bundle size and lazy-loading.

### Files touched in this audit

| Area           | Files modified |
|----------------|----------------|
| Debug logs     | WorkoutPlannerAgent.js, MealPlannerAgent.js, InsightsAgent.js, authController.js, authRoutes.js, AIFitnessChat/utils.js, ForgotPassword.jsx |
| Archive        | New: archive/README.md, archive/frontend-legacy/Layout/Footer.jsx, Header.jsx. Updated: frontend/src/components/legacy/README.md. Removed: legacy/Layout/Footer.jsx, Header.jsx |
| Models         | Workout.js, Diet.js, ChatMessage.js (indexes added) |
| Documentation  | This report (docs/CODEBASE_AUDIT_REPORT.md) |

API response contracts and frontend behavior were not changed. The codebase is in a consistent state for production deployment with the above follow-ups as optional improvements.
