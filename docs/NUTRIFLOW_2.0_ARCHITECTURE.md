# NutriFlow 2.0 — Codebase Discovery & Architecture

This document is the result of a full codebase scan and design for upgrading NutriFlow into **NutriFlow 2.0 — an AI Performance Engine** using agentic workflows. **No code has been written;** this is analysis and architecture only.

---

## TASK 1 — Codebase Scan

### Frontend

| Area | Details |
|------|--------|
| **Framework** | React 18, Vite |
| **UI** | Chakra UI, Framer Motion |
| **Routing** | React Router v6 |
| **State** | React Context (`AuthContext`) only; no Redux/Zustand. Component-level `useState` for diets, workouts, goals, chat messages. |
| **API** | Single `services/api.js` — Axios with base URL from `VITE_API_URL`, JWT in `Authorization` header, 401 → redirect to `/login`. |

**Pages / Routes**

- `/` — `Home` (landing; redirects to `/dashboard` if logged in)
- `/login`, `/register` — `Login`, `Register` (from `components/Auth/`)
- `/dashboard` — `Dashboard` (protected): diet + workout sections, goals UI
- `/fitness-hub` — `FitnessHub` (protected): AI chat, workout cards, exercise details
- `/forgot-password`, `/reset-password/:token` — `ForgotPassword`, `ResetPassword`
- `/privacy`, `/terms`, `/contact` — `Privacy`, `Terms`, `Contact` (footer)

**Components (high level)**

- **Layout:** `Navbar`, `Footer`, `PageTransition`
- **Auth:** `Login`, `Register`, `ForgotPassword`, `ResetPassword`
- **Dashboard:** `DietSection`, `WorkoutSection`, `GoalsSection`, `GoalsModal`; each section has subcomponents (e.g. `DateNavigation`, `DietCard`, `DietForm`, `DailySummaryCard`, `WorkoutCard`, `WorkoutForm`)
- **Diet (standalone):** `DietList`, `FoodSearchInput`, `AddDiet`
- **Workout (standalone):** `AddWorkout`, `WorkoutSearchInput`, `WorkoutList`
- **FitnessHub:** `AIFitnessChat` (with `ChatHeader`, `ChatInput`, `ChatMessage`), `WorkoutCard`, `ExerciseDetailsModal`

**API usage (from `api.js`)**

- Auth: `login`, `register`, `forgotPassword`, `resetPassword`
- Diets: `getDiets`, `addDiet`, `updateDiet`, `deleteDiet`
- Workouts: `getWorkouts`, `addWorkout`, `updateWorkout`, `deleteWorkout`
- AI: `aiChat(message, context, history)`, `saveChatHistory`, `loadChatHistory`, `clearChatHistory`
- Search: `searchFoods(query)`, `searchExercises(query)`
- Config: `checkAIConfig` → `GET /api/health`

---

### Backend

| Area | Details |
|------|--------|
| **Runtime** | Node.js, Express |
| **Auth** | JWT in `Authorization: Bearer`; `authMiddleware.protect` on protected routes. Token payload: `{ id: user._id }`. |
| **DB** | MongoDB via Mongoose; connection in `config/db.js` (`MONGO_URI`). |

**Express app (`app.js`)**

- CORS, `express.json()`, `express.urlencoded`, static `dist`
- Routes mounted: `/api/diets`, `/api/workouts`, `/api/auth`, `/api/contact`, `/api/chat`, `/api/food`, `/api/exercise`
- **Inline route:** `POST /api/ai/chat` (no separate router file)
- Health: `GET /api/health` (returns AI provider and model info)

**Routes → Controllers**

- `authRoutes` → `authController`: `register`, `login`; forgot/reset password in route
- `dietRoutes` → `dietController`: `getDiets`, `createDiet`, `updateDiet`, `deleteDiet` (all protected)
- `workoutRoutes` → `workoutController`: `getWorkouts`, `createWorkout`, `updateWorkout`, `deleteWorkout`, `searchWorkouts` (workouts protected; exercise search is public `GET /api/exercise/search`)
- `foodRoutes` → `foodController`: `searchFood` (public `GET /api/food/search`)
- `chatRoutes` → ChatMessage CRUD: `POST/GET/DELETE /api/chat/history` (protected)
- `contactRoutes` → inline handler (no auth): `POST /api/contact`

**Services**

- No dedicated service layer. Controllers call models and external APIs (USDA, API Ninjas) directly. AI logic lives in `app.js` and `utils/aiUtils.js`.

---

### Database (MongoDB)

**Existing Mongoose models**

| Model | File | Purpose |
|-------|------|--------|
| **User** | `backend/models/User.js` | `username`, `email`, `password`, `resetPasswordToken`, `resetPasswordExpires` |
| **Diet** | `backend/models/Diet.js` | Food log: `user`, `date`, `mealType` (Breakfast/Lunch/Dinner/Snack), `foodName`, `calories`, `protein`, `carbs`, `fats`, `notes` |
| **Workout** | `backend/models/Workout.js` | Workout log: `user`, `date`, `type` (Cardio/Strength/Flexibility/Sports/Other), `workoutName`, `duration`, `caloriesBurned`, `intensity`, `equipment`, `notes` (no embedded exercises) |
| **ChatMessage** | `backend/models/ChatMessage.js` | `user`, `role` (user/assistant), `content`, `createdAt` |

**Not in DB**

- **Goals** (daily calories, daily protein, weekly workouts): stored only in frontend Dashboard state and in `GoalsModal`; not persisted.

---

### AI Features

| Location | What it does |
|----------|----------------|
| **Backend** `app.js` | `POST /api/ai/chat`: builds messages (system + context + history + user), detects `[[RETURN_JSON_WORKOUT_PLAN]]`, calls Groq (prod) or Ollama (dev), returns `content` + `suggestions` + `source`. |
| **Backend** `utils/aiUtils.js` | `categorizeMessage(text)` → workout/form/progress/plan/default; `suggestionsByCategory`; `getDefaultWorkoutPlan()` (3 hardcoded plans); `generateFallbackResponse(message, context)` when AI fails. |
| **Vercel** `api/ai/chat.js` | Serverless variant: same intent, Groq-only, richer system prompt and context formatting, same `[[RETURN_JSON_WORKOUT_PLAN]]` and fallback plan. |
| **Frontend** `AIFitnessChat` | Sends `message`, `context` (recent workouts/diets, userName), `history`; loads/saves/clears chat via `/api/chat/history`; parses JSON workout plan from AI response and dispatches `ai-recommendations-updated` for FitnessHub to show cards. |
| **Frontend** `AIFitnessChat/utils.js` | `parseAIRecommendations(content)` — robust JSON extraction and normalization for workout objects (title, duration, intensity, focusAreas, exercises, videoId, description, calories, difficulty). |

**AI providers**

- **Production:** Groq (`GROQ_API_KEY`, `GROQ_MODEL` e.g. `llama3-8b-8192`).
- **Development:** Ollama (`OLLAMA_URL`, `OLLAMA_MODEL` e.g. `llama3:latest`).

**Prompt/behavior**

- System: “AI Fitness Coach”, context summary (recent workouts/diets, user name). For plan requests, extra system instruction to return only a JSON array of workout objects with fixed schema.
- No dedicated prompt files; prompts are inline in `app.js` and `api/ai/chat.js`.

---

## TASK 2 — Architecture Summary

### 1. Frontend folder structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   ├── Dashboard/     # DietSection, WorkoutSection, GoalsSection, GoalsModal, utils, components
│   │   ├── Diet/           # DietList, FoodSearchInput, AddDiet
│   │   ├── FitnessHub/      # AIFitnessChat (constants, utils, components), WorkoutCard, ExerciseDetailsModal
│   │   ├── Footer/         # Privacy, Terms, Contact
│   │   ├── Layout/         # Header, Footer (duplicate naming with root Footer)
│   │   ├── Workout/        # AddWorkout, WorkoutSearchInput, WorkoutList
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── PageTransition.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── FitnessHub.jsx
│   │   ├── Home.jsx
│   │   └── Login.jsx       # (likely redirect or wrapper; routes use components/Auth/Login)
│   ├── routes/
│   │   └── index.jsx       # AppRoutes, ProtectedRoute
│   ├── services/
│   │   └── api.js          # All API calls
│   ├── theme/
│   │   └── index.js
│   ├── utils/
│   │   └── workoutUtils.js
│   ├── App.jsx
│   └── main.jsx
├── eslint.config.js
├── package.json
├── vite.config.js
└── vercel.json
```

### 2. Backend folder structure

```
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── dietController.js
│   ├── foodController.js
│   └── workoutController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Diet.js
│   ├── Workout.js
│   └── ChatMessage.js
├── routes/
│   ├── authRoutes.js
│   ├── dietRoutes.js
│   ├── workoutRoutes.js
│   ├── foodRoutes.js
│   ├── exerciseRoutes.js   # delegates to workoutController.searchWorkouts
│   ├── chatRoutes.js
│   └── contactRoutes.js
├── utils/
│   └── aiUtils.js
├── app.js                  # Express app + inline POST /api/ai/chat
├── package.json
└── (env: MONGO_URI, JWT_SECRET, USDA_API_KEY, NINJA_API_KEY, GROQ_*, OLLAMA_*, EMAIL_*, FRONTEND_URL)
```

### 3. API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/forgot-password` | No | Send reset email |
| POST | `/api/auth/reset-password/:token` | No | Reset password |
| GET | `/api/diets` | Yes | List user diets |
| POST | `/api/diets` | Yes | Create diet |
| PUT | `/api/diets/:id` | Yes | Update diet |
| DELETE | `/api/diets/:id` | Yes | Delete diet |
| GET | `/api/workouts` | Yes | List user workouts |
| POST | `/api/workouts` | Yes | Create workout |
| PUT | `/api/workouts/:id` | Yes | Update workout |
| DELETE | `/api/workouts/:id` | Yes | Delete workout |
| GET | `/api/food/search?query=` | No | Search USDA foods |
| GET | `/api/exercise/search?query=` | No | Search API Ninjas exercises |
| POST | `/api/chat/history` | Yes | Save chat messages (bulk replace) |
| GET | `/api/chat/history?limit=` | Yes | Get chat history |
| DELETE | `/api/chat/history` | Yes | Clear chat history |
| POST | `/api/ai/chat` | No* | AI chat (body: message, context, history) |
| POST | `/api/contact` | No | Contact form |
| GET | `/api/health` | No | Health + AI provider/model |

\*AI chat does not use `protect`; client sends token only if needed for context; history is saved separately via protected `/api/chat/history`.

### 4. Database schemas (summary)

- **User:** username, email, password, resetPasswordToken, resetPasswordExpires.
- **Diet:** user (ref), date, mealType, foodName, calories, protein, carbs, fats, notes; timestamps.
- **Workout:** user (ref), date, type, workoutName, duration, caloriesBurned, intensity, equipment, notes; timestamps.
- **ChatMessage:** user (ref), role, content, createdAt.

### 5. AI integration points

- **Single entry:** `POST /api/ai/chat` (Express) or Vercel `api/ai/chat.js`.
- **Inputs:** `message`, `context` (recentWorkouts, recentDiets, userName), `history` (array of { type, content }).
- **Outputs:** `content` (text or JSON string), `suggestions` (array), `source` (groq | ollama | fallback).
- **Special:** If message contains `[[RETURN_JSON_WORKOUT_PLAN]]`, system prompt asks for JSON array of workout objects; backend or Vercel may substitute `getDefaultWorkoutPlan()` on empty/failed response.
- **Helpers:** `aiUtils.js` (categorize, fallback, default plan); frontend `parseAIRecommendations` to turn content into workout cards.

---

## TASK 3 — Upgrade Opportunities

### What can be reused

- **Auth:** User model, JWT, auth middleware, login/register/forgot/reset — keep as-is; extend User if needed (e.g. preferences for AI).
- **Diet/Workout CRUD:** Models, routes, controllers, and frontend API + Dashboard/FitnessHub usage — keep; add new endpoints or fields as needed.
- **Chat persistence:** ChatMessage model and `/api/chat/history` — keep; can later associate threads with “sessions” or “intents.”
- **External APIs:** USDA and API Ninjas — keep as data sources for tools (meal planning, exercise search).
- **AI chat UI:** AIFitnessChat, message flow, context (recent workouts/diets) — keep; can drive “coach” and “planner” flows from same chat or dedicated entry points.
- **Workout plan schema:** Current JSON shape (title, duration, intensity, focusAreas, exercises, videoId, description, calories, difficulty) — good base for WorkoutPlannerAgent output; normalize in one place (backend or agent layer).

### What should be refactored

- **AI logic in `app.js`:** Move to a dedicated AI layer (e.g. `backend/ai/`) so that prompts, provider selection, and tool/agent orchestration live in one place.
- **Prompts:** Replace inline strings with a `prompts/` module (or files) for coach, meal planner, workout planner, and verifier.
- **Goals:** Persist goals (daily calories, protein, weekly workouts, etc.) in DB (new Goal or User profile model) so AI and dashboards use a single source of truth.
- **Single “chat” endpoint:** Evolve into an orchestration layer that can route to different agents (coach, meal planner, workout planner) and call tools (search food, search exercise, get user stats).
- **Frontend AI entry points:** Today everything goes through one chat. Add explicit entry points for “AI Coach,” “Meal Plan,” “Training Plan,” and reuse chat or dedicated UIs.

### AI-driven features to add

| Feature | Reuse | New |
|--------|--------|-----|
| **AI Coach** | Chat UI, context (workouts/diets), ChatMessage storage | Coach agent, coach prompts, optional tools (e.g. “log workout”) |
| **Meal Plan Generator** | Diet model, food search API, user context | MealPlannerAgent, meal plan schema (e.g. daily meals with foods), prompts, possibly MealPlan model |
| **Training Plan Generator** | Workout plan JSON schema, exercise search, getDefaultWorkoutPlan | WorkoutPlannerAgent, structured plan storage (optional), tools for exercise lookup |
| **Adaptive calorie targets** | Diet logs, goals (once persisted) | Logic or small agent that suggests targets from activity and goals; store in User or Goal |
| **Progress analysis** | Diet + Workout data, dashboard utils (e.g. calculateDailyCalories, calculateWeeklyWorkouts) | Analytics service or agent that summarizes trends and surfaces in chat or dashboard |

---

## TASK 4 — NutriFlow 2.0 AI Architecture

Add an **AI orchestration layer** that sits between the API and the LLM, preserving the existing MERN stack.

### AI layer layout

```
/ai
  agents/      # HeadCoach, MealPlanner, WorkoutPlanner, Verifier
  tools/       # get_user_stats, search_food, search_exercise, log_diet, log_workout, etc.
  workflows/   # Multi-step flows (e.g. “create weekly plan” → plan → verify → return)
  prompts/     # System and user prompt templates per agent/use-case
```

### Agents

- **HeadCoachAgent**  
  Primary conversational agent. Handles open-ended fitness/nutrition questions, motivation, form tips, and progress discussion. Can delegate to MealPlanner or WorkoutPlanner when the user asks for a meal plan or training plan. Uses tools to read user stats (goals, recent diets/workouts) and optionally to log items. Returns text (and optionally structured suggestions). Reuses the current “AI Fitness Coach” role but with a clear agent boundary and shared tools.

- **MealPlannerAgent**  
  Generates daily or weekly meal plans (e.g. breakfast/lunch/dinner/snacks with specific foods and portions). Uses tools: search_food (USDA), get_user_stats (goals, preferences, recent intake). Output: structured meal plan (e.g. JSON or normalized format). Can be invoked by HeadCoach or by a dedicated “Generate meal plan” action.

- **WorkoutPlannerAgent**  
  Generates workout plans (single session or weekly). Uses tools: search_exercise (API Ninjas), get_user_stats (goals, recent workouts, recovery). Output: same JSON workout-plan shape as today (title, duration, intensity, focusAreas, exercises, etc.). Replaces/adorns the current `[[RETURN_JSON_WORKOUT_PLAN]]` logic with an explicit agent and tools. HeadCoach can delegate “create a plan” to this agent.

- **VerifierAgent**  
  Validates structured outputs (meal plan, workout plan) for safety, completeness, and schema compliance. For example: calorie totals in range, no harmful suggestions, required fields present. Used inside workflows (e.g. after MealPlanner or WorkoutPlanner) before returning to the user. Can return a corrected object or approval.

### Data flow (conceptual)

1. Client sends a message (and optionally an “intent” or “mode”: coach | meal_plan | workout_plan).
2. Orchestrator (single backend entry, e.g. `POST /api/ai/chat` or `/api/ai/orchestrate`) loads user context via tools, selects agent(s).
3. HeadCoach handles generic chat; for “give me a meal plan” or “create a training plan,” it delegates to the corresponding agent.
4. MealPlanner/WorkoutPlanner use tools and return structured data; VerifierAgent checks it.
5. Response (text + optional structured plan) is returned; chat history and optional plan storage are updated as today.

---

## TASK 5 — Suggested file structure (NutriFlow 2.0)

Keep existing trees; add new directories and files as follows.

### Backend

```
backend/
├── ai/
│   ├── agents/
│   │   ├── HeadCoachAgent.js    # (or .ts)
│   │   ├── MealPlannerAgent.js
│   │   ├── WorkoutPlannerAgent.js
│   │   └── VerifierAgent.js
│   ├── tools/
│   │   ├── index.js             # Register and run tools
│   │   ├── get_user_stats.js
│   │   ├── search_food.js
│   │   ├── search_exercise.js
│   │   ├── log_diet.js
│   │   └── log_workout.js
│   ├── workflows/
│   │   ├── index.js
│   │   ├── coachConversation.js
│   │   ├── generateMealPlan.js
│   │   └── generateWorkoutPlan.js
│   ├── prompts/
│   │   ├── coach.js
│   │   ├── mealPlanner.js
│   │   ├── workoutPlanner.js
│   │   └── verifier.js
│   └── orchestrate.js           # Entry: route to agents, run workflows
├── config/
├── controllers/
├── middleware/
├── models/
│   └── (add Goal.js or extend User for goals when needed)
├── routes/
│   ├── aiRoutes.js              # POST /api/ai/chat, optional POST /api/ai/meal-plan, etc.
│   └── ...
├── utils/
│   └── aiUtils.js               # Keep for fallbacks and shared helpers during migration
└── app.js                       # Mount aiRoutes instead of inline /api/ai/chat
```

### Frontend

```
frontend/src/
├── features/
│   ├── ai-coach/                # Optional: dedicated coach UI or reuse FitnessHub chat
│   │   ├── components/
│   │   └── hooks/
│   ├── meal-planner/
│   │   ├── components/          # MealPlanView, MealPlanGenerator, etc.
│   │   └── hooks/
│   └── training-planner/
│       ├── components/          # TrainingPlanView, already partially in FitnessHub
│       └── hooks/
├── components/                  # Existing shared components
├── context/
├── pages/
├── routes/
├── services/
│   └── api.js                   # Add ai.orchestrate(), ai.generateMealPlan(), etc. if needed
└── ...
```

Existing `Dashboard`, `FitnessHub`, and `AIFitnessChat` stay; new features can be added as tabs, pages, or panels that call the new AI endpoints and display structured plans.

---

## AI Multi-Agent System (NutriFlow v2)

The AI layer under `backend/ai/` has been extended into a **multi-agent system** that keeps the existing chat behavior while preparing NutriFlow for richer workflows.

### Overview

```text
User Message
      ↓
Intent Detection (orchestrator)
      ↓
AI Orchestrator (`backend/ai/orchestrator/orchestrate.js`)
      ↓
Agent Registry (`backend/ai/agents/index.js`)
      ↓
Selected Agent (HeadCoach / WorkoutPlanner / MealPlanner)
      ↓
VerifierAgent (lightweight validation for plans)
      ↓
Structured Response (content + optional plan object)
      ↓
Frontend Rendering (current UI reads content; plans can be consumed next)
```

### Agents and responsibilities

- **HeadCoachAgent** (`backend/ai/agents/HeadCoachAgent.js`)
  - Default conversational agent.
  - Handles:
    - General fitness/nutrition Q&A.
    - Motivation and coaching.
    - Progress-oriented questions (\"analyze my progress\").
  - Uses:
    - `get_user_stats(userId)` to build a context summary.
    - `COACH_SYSTEM_PROMPT` and `buildContextSummary` in `prompts/coachPrompt.js`.
    - Shared `aiProvider.generateChatCompletion` to talk to Groq/Ollama.
  - Backward compatibility:
    - Continues to handle the `[[RETURN_JSON_WORKOUT_PLAN]]` token so the existing frontend JSON workout-plan parsing remains intact.

- **WorkoutPlannerAgent** (`backend/ai/agents/WorkoutPlannerAgent.js`)
  - Generates **structured workout plans**.
  - Uses `get_user_stats(userId)` when available to see recent workouts/diets.
  - Calls `aiProvider.generateChatCompletion` with a focused planning prompt.
  - Lightly parses the result into:
    - `{ type: 'workout_plan', plan: [{ day, exercises[] }], rawContent, source }`.

- **MealPlannerAgent** (`backend/ai/agents/MealPlannerAgent.js`)
  - Generates **meal plans**.
  - Uses `get_user_stats(userId)` when available to see recent diet/workout history.
  - Calls `aiProvider.generateChatCompletion` with a meal-planning prompt.
  - Parses output into:
    - `{ type: 'meal_plan', calories?, meals: [{ meal, food }], rawContent, source }`.

- **VerifierAgent** (`backend/ai/agents/VerifierAgent.js`)
  - Validates and normalizes AI plan outputs.
  - Currently rule-based (no extra LLM call):
    - For `workout_plan`: trims strings, caps length of the plan and exercise lists.
    - For `meal_plan`: clamps calories into a reasonable range (800–4000), trims meal entries.
  - Can be extended later to enforce stricter domain rules or call an LLM for semantic checks.

### Orchestrator and agent registry

- **Orchestrator** (`backend/ai/orchestrator/orchestrate.js`)
  - Detects intent from the user message:
    - `coach` — general coaching and default.
    - `workout_plan` — messages containing \"workout plan\".
    - `meal_plan` — messages containing \"meal plan\".
    - `analyze_progress` — messages mentioning \"analyze my progress\".
  - Important: messages containing `[[RETURN_JSON_WORKOUT_PLAN]]` are always routed to **HeadCoachAgent** to preserve current frontend behavior.
  - Looks up the agent in the registry and executes it.
  - Normalizes responses for the API:
    - If the agent returns `{ content, suggestions, source }`, this is passed through directly.
    - If the agent only returns a structured object, it is JSON-stringified into `content` to keep the API contract `{ content, suggestions, source }`.

- **Agent Registry** (`backend/ai/agents/index.js`)
  - `AGENTS = { coach, workout_plan, meal_plan }`.
  - Allows the orchestrator to remain small and declarative: intent → agent key → runner function.

### AI provider configuration

- **File**: `backend/ai/config/aiProvider.js`
- Responsibilities:
  - Select provider:
    - `Groq` when `NODE_ENV=production`.
    - `Ollama` otherwise.
  - Manage:
    - `GROQ_MODEL`, `OLLAMA_MODEL`.
    - Temperature.
    - HTTP calls via `fetchCompat`.
  - Exposes:
    - `selectProvider()` → `'groq' | 'ollama'`.
    - `generateChatCompletion(messages, options)` → `{ content, provider }`.

All agents now call `generateChatCompletion` instead of duplicating HTTP and model-selection logic, which keeps AI configuration centralized and easier to evolve.

---

## TASK 6 — Upgrade Plan (phased)

### Phase 1 — AI Foundation

- **Goal:** Centralize AI behind an orchestration layer without changing user-facing behavior.
- **Backend:** Add `backend/ai/` with `orchestrate.js`, `prompts/` (coach + workout plan prompts moved from app.js), and a thin `HeadCoachAgent` that uses the current “single LLM call” logic. Add `aiRoutes.js` and move `POST /api/ai/chat` to it.
- **Backend:** Introduce `tools/get_user_stats.js` (reads user, recent diets/workouts, goals from DB or session) and call it from the coach flow when building context.
- **Database:** Optional: add `Goal` model or User fields for goals; backend can still accept goals in context until then.
- **Frontend:** No change; continue calling `POST /api/ai/chat`.
- **Deliverable:** Same chat behavior with AI logic in `ai/` and one reusable tool.

### Phase 2 — AI Coach

- **Goal:** Formalize HeadCoachAgent and improve coach experience.
- **Backend:** Implement `HeadCoachAgent` with coach-specific prompts from `prompts/coach.js`, use `get_user_stats` and optional `log_diet`/`log_workout` tools so the coach can suggest logging.
- **Backend:** Add optional intent detection (e.g. “meal plan” vs “workout plan” vs “general”) and pass to orchestrator for future delegation.
- **Frontend:** Optional: add `features/ai-coach/` with hooks (e.g. useCoachChat) and a dedicated coach entry or keep using FitnessHub chat.
- **Deliverable:** Robust AI Coach with tools and clear prompts.

### Phase 3 — Meal Planner

- **Goal:** Generate and show meal plans.
- **Backend:** Implement `MealPlannerAgent` and `generateMealPlan` workflow; add tools `search_food`, `get_user_stats`. Add `VerifierAgent` for meal plans (e.g. calorie range, required fields). Add endpoint e.g. `POST /api/ai/meal-plan` or extend chat with “meal_plan” intent.
- **Database:** Optional: add `MealPlan` model to store generated plans.
- **Frontend:** Add `features/meal-planner/` (e.g. MealPlanGenerator, MealPlanView). Add “Generate meal plan” in Dashboard or FitnessHub and display structured meals.
- **Deliverable:** User can request a meal plan and see it in the UI.

### Phase 4 — Adaptive Training

- **Goal:** Training plans generated by an agent with verification and persistence.
- **Backend:** Implement `WorkoutPlannerAgent` and `generateWorkoutPlan` workflow; use `search_exercise`, `get_user_stats`. Use `VerifierAgent` for workout plan (schema, safety). Replace current `[[RETURN_JSON_WORKOUT_PLAN]]` path with this workflow. Optional: store generated plans in a new collection or link to Workout logs.
- **Backend:** Add “adaptive calorie targets” as a small workflow or tool: input goals + recent activity → suggested daily calories/macros; persist in User/Goal.
- **Frontend:** Refactor FitnessHub to consume the new workout-plan endpoint; keep WorkoutCard and ExerciseDetailsModal. Add “Adaptive goals” in Dashboard (GoalsSection) that fetches and displays suggested targets.
- **Deliverable:** Workout plans produced by WorkoutPlannerAgent + Verifier; optional adaptive goals in dashboard.

### Phase 5 — Mobile App Companion

- **Goal:** Prepare for or deliver a mobile companion (e.g. React Native or PWA).
- **Backend:** Ensure API is mobile-friendly (same endpoints, clear auth, rate limits if needed). Optional: lightweight endpoints for “today’s plan” or “quick log.”
- **Frontend:** PWA: add manifest, service worker, and ensure Vite build works. Or new repo for React Native app that reuses `services/api.js` logic and shared types.
- **Database:** No schema change unless new “device” or “sync” features are added.
- **Deliverable:** PWA and/or mobile app that can log and view plans; AI features available via existing API.

---

## TASK 7 — No code written

This document is analysis and design only. Implementation will proceed step-by-step after you approve this architecture. Focus has been on:

- Understanding the existing system (frontend, backend, DB, AI).
- Planning the upgrade so current behavior is preserved.
- Introducing a clear AI layer (agents, tools, workflows, prompts) and a phased plan to add AI Coach, Meal Planner, Adaptive Training, and a mobile companion.

If you want to adjust agents, file layout, or phases, we can update this document before writing code.
