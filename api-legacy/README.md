# Legacy Serverless API (Archived)

This folder contains the **archived** serverless-style backend that was previously located at `api/`. It is **not** part of the active runtime.

## Why this exists

- The NutriFlow project had two backend surfaces: Express under `backend/` and serverless handlers under `api/`.
- To avoid duplication and drift, the **Express backend under `backend/`** is now the single canonical backend.
- The contents of the former `api/` directory were moved here for reference only.

## Current canonical backend

- **Location:** `backend/`
- **Stack:** Express, MongoDB (Mongoose), `backend/ai/` for AI orchestration
- **Models:** `backend/models/` (User, Diet, Workout, ChatMessage)
- **Routes:** All `/api/*` endpoints are served by Express (`backend/routes/`, `backend/app.js`)

## These files

- Are **archived for reference only**.
- Are **not** used by the running application.
- Should **not** be deployed as active API routes.
- May be removed in a future cleanup once no longer needed for reference.

## Archive contents (as of consolidation)

- `ai/chat.js` — legacy AI chat handler
- `food/search.js`, `exercise/search.js` — legacy search handlers
- `chat/history.js` — legacy chat history handler
- `auth/*` — legacy auth handlers (login, register, forgot-password, reset-password)
- `contact/index.js` — legacy contact handler
- `[collection].js`, `[collection]/[...id].js` — legacy generic CRUD handlers
- `_models/*` — legacy Mongoose model definitions
- `_lib/*` — legacy DB connection and middleware
