# NutriFlow

**Not another calorie counter.** NutriFlow treats every day as three flows, **Fuel** (what you
eat), **Train** (how you move) and **Recover** (how you feel), and every morning turns them into
one verdict: *Push day*, *Steady day* or *Recovery day*.

- [DESIGN.md](DESIGN.md): the design system (tokens, type, motion, rules) every screen follows
- [docs/ROADMAP.md](docs/ROADMAP.md): what has shipped and what is next
- [backend/ai/README.md](backend/ai/README.md): how the AI coach answers

## Why it is different

Most nutrition apps are ledgers: count every calorie, keep the streak, feel bad when you miss.
NutriFlow is built around rhythm instead.

- **One verdict, not a spreadsheet.** Meals, training and a 20-second morning check-in become a
  readiness score and a plain call for the day. No wearable needed.
- **Fuel for training, not dieting.** Intake is read against the training ahead, and no food is
  labeled good or bad.
- **Consistency that forgives.** A streak survives one missed day, and the 12-week rhythm map
  shows patterns rather than failures.
- **A coach that knows your day.** The AI reads your own log, answers in a few lines, and suggests
  what to ask next. Readiness and progress answers come from computed numbers, not guesses.
- **Color means data.** Orange is training, green is fuel, blue is recovery; everything else stays
  monochrome, so the screen reads at a glance.

## What's in the app

| Page | What it does |
| --- | --- |
| **Landing** (`/`) | A live demo: set sleep, energy, soreness, training and eating, and the real readiness formula gives the verdict |
| **Today** (`/dashboard`) | The daily verdict and readiness score, a 20-second check-in, meal and workout logging (USDA food and API Ninjas exercise search), goals, a 12-week rhythm map and a weekly calorie chart |
| **Coach** (`/fitness-hub`) | AI chat that reads your own log, with short answers, up to four follow-ups per reply and several conversations that follow you across devices; plus today's read and insights from your log |
| **Library** (`/library`) | Plans the coach built, saved to your account (log a session or meal in one tap, with a muscle map of the week), and a 36-exercise library with muscle maps and form cues |
| **Profile** and **Settings** | Your week (readiness for each of the last 7 days, the best day, totals vs the week before, shareable), your stats and most-logged foods and workouts; goals, appearance (light, dark, device), profile details, and your data (download it, or delete the account) |

Sign-in pages adapt to the visit: returning users are greeted by name and sent back to where they
were going, and new users see what their first day looks like.

## Tech stack

- **Frontend:** React 18, Vite, Chakra UI (custom theme in `frontend/src/theme`), Framer Motion, React Router, Recharts, Axios
- **Backend:** Node.js 18+, Express, MongoDB with Mongoose, JWT auth, Nodemailer (Gmail)
- **AI:** Groq (`openai/gpt-oss-120b` by default) or a local Ollama model
- **External APIs:** USDA FoodData Central, API Ninjas exercises
- **Hosting:** one Vercel project: the frontend build plus a serverless function (`api/index.js`) that runs the Express app (see Deployment)

## Project structure

```
nutriflow/
├── api/index.js            # Vercel serverless entry: runs backend/app.js
├── shared/                 # Pure modules used by both sides (readinessScore.js)
├── backend/
│   ├── app.js              # Express app: middleware and route wiring only
│   ├── server.js           # Local development server
│   ├── routes/             # URL → middleware → controller
│   ├── controllers/        # Request handling and logic
│   ├── models/             # Mongoose models
│   ├── middleware/         # Auth (protect, identifyUser), rate limits, error handler
│   ├── ai/                 # AI orchestration: agents, prompts, provider, follow-ups
│   ├── data/               # Exercise catalog the Library is seeded from
│   ├── utils/              # Mailer, AI fallback text
│   └── tests/              # node:test suites
└── frontend/
    ├── public/             # Icons, manifest, Open Graph image
    └── src/
        ├── pages/          # One file per route
        ├── components/     # Grouped by area: Auth, Dashboard, FitnessHub (Coach), Library,
        │                   # Landing, Profile, Global (navbar, bands), Motion, Diet/Workout search
        ├── context/        # Auth state (AuthContext + AuthProvider)
        ├── routes/         # Lazy routes and the protected-route guard
        ├── services/api.js # Every API call
        ├── theme/          # Chakra theme and appearance preference
        └── utils/          # Date and workout helpers
```

## Getting started

**Requirements:** Node.js 18 or newer, a MongoDB database (Atlas works), and API keys for USDA,
API Ninjas and Groq (or [Ollama](https://ollama.com/) running locally).

```bash
# 1. Install (frontend and backend each have their own dependencies)
npm --prefix frontend install
npm --prefix backend install

# 2. Configure
cp backend/.env.example backend/.env                  # then fill in the values
cp frontend/.env.local.example frontend/.env.local    # VITE_API_URL=http://localhost:3000

# 3. Run (two terminals)
npm --prefix backend run dev     # API on http://localhost:3000
npm --prefix frontend run dev    # app on http://localhost:5173
```

Every variable is explained in [`backend/.env.example`](backend/.env.example). Never commit `.env`.

## Scripts

From the repository root:

| Command | What it does |
| --- | --- |
| `npm run check` | Lint, backend tests, frontend tests and a production build. Run before every commit; GitHub Actions runs it on every push and pull request (`.github/workflows/check.yml`). |
| `npm test` | Backend (`node:test`) and frontend (Vitest) tests |
| `npm run lint` | ESLint on the frontend |
| `npm run build` | Production build of the frontend |

Inside `frontend/`: `npm run dev`, `npm run build`, `npm run preview`, `npm test`, `npm run lint`.
Inside `backend/`: `npm run dev` (nodemon), `npm start`, `npm test`.

## API

All routes are under `/api`. Routes marked 🔒 need `Authorization: Bearer <token>`.

**Auth**
- `POST /auth/register`, `POST /auth/login`
- `PUT /auth/me` 🔒 (name and email), `PUT /auth/me/password` 🔒
- `PUT /auth/me/goals` 🔒: `dailyCalories`, `dailyProtein`, `weeklyWorkouts`, and optionally
  `dailyCarbs` and `dailyFats` (grams; `null` clears them) and `fuelFollowsVerdict` (whether the
  day's verdict moves the carb target). Fields left out keep their values.
- `GET /auth/me/export` 🔒: everything stored for the account, as one JSON file
- `DELETE /auth/me` 🔒 `{ password }`: deletes the account and every record it owns
- `POST /auth/forgot-password` (rate limited; same answer whether or not the email exists)
- `PUT /auth/reset-password/:token` (also accepts `POST`)

**Logs**
- `GET | POST /diets` 🔒, `PUT | DELETE /diets/:id` 🔒
- `GET | POST /workouts` 🔒, `PUT | DELETE /workouts/:id` 🔒
- `GET /checkins?limit=30` 🔒 (newest first), `PUT /checkins/:dayKey` 🔒 (create or update a `YYYY-MM-DD` check-in)

**Search and library**
- `GET /food/search?query=apple` (USDA), `GET /exercise/search?query=squat` (API Ninjas)
- `GET /food/barcode/:code`: a packaged food by its barcode (8 to 14 digits), from Open Food Facts
  or else USDA branded foods: `{ food: { name, brand, source, unit, per100, serving } }`, with
  nutrition per 100 g or ml and per serving when the label has one; 404 when neither knows it
- `GET /exercises` 🔒: the exercise library with muscle maps, cues and filter values. Optional
  filters: `muscleGroup`, `equipment`, `difficulty`, `q`. Seeded from `backend/data/exerciseCatalog.js`
  on first request and kept in sync by slug.

**Saved plans** (kept on the account, so they follow you across devices)
- `GET /plans` 🔒: `{ plans, mealPlans }`, newest first
- `PUT /plans/:id` 🔒: create or replace a plan: `{ kind: 'training' | 'meal', title, calories?, generatedAt, items }`
- `DELETE /plans/:id` 🔒

**Coach**
- `POST /ai/chat` (rate limited, 20 a minute): `{ message, context?, history? }` →
  `{ content, suggestions, source }`. Uses the signed-in user's data when a token is sent.
  `POST /chat` is the older address and still works.
- `GET /chat/conversations` 🔒, `PUT | DELETE /chat/conversations/:id` 🔒: coach conversations, kept on the account so they follow you across devices
- `GET | POST | DELETE /chat/history` 🔒: the single saved conversation used by older clients

**Other**
- `POST /contact`: the contact form (emailed to `EMAIL_USERNAME`)
- `GET /health`: which AI provider and model are active

## Deployment (Vercel)

One Vercel project serves both halves from the repository root:

- **Frontend:** `npm --prefix frontend run build` → static files in `frontend/dist`.
- **Backend:** `api/index.js` is a serverless function that runs the Express app
  (`backend/app.js`) for every `/api/*` request.

`vercel.json` holds the build and install commands and two rewrites, applied only when no
static file matches: `/api/*` → the function (the original URL is kept, so Express routes
match), anything else → `index.html` (so deep links like `/library` work on reload).

**Vercel project settings to check**

- *Root Directory*: empty (the repository root). With `frontend` the API cannot deploy.
- *Framework Preset*: Other (or Vite); `vercel.json` overrides the build, install and output settings.
- *Node.js version*: 18 or newer (the backend uses the built-in `fetch`).
- *Environment variables*: everything in `backend/.env.example`, with `NODE_ENV=production`,
  `FRONTEND_URL` set to the production URL and `GROQ_MODEL=openai/gpt-oss-120b`.
  `VITE_API_URL` is not needed: in production the app calls the API on its own origin.

After deploying, `GET /api/health` should answer `{"ok":true,"provider":"groq",...}`.

## Conventions

- **API contract:** the coach always answers `{ content, suggestions, source }`; chat text is
  formatted for reading, never raw JSON.
- **Backend layers:** routes wire URLs to middleware and controllers; controllers hold the logic;
  everything AI lives in `backend/ai/`. Secrets come from environment variables only.
- **Frontend:** follow [DESIGN.md](DESIGN.md) and the semantic tokens in `frontend/src/theme`.
  Color only means data; panels use 1px borders; no gradients, glows or hover lift.
- **Before committing:** `npm run check`.

## Shared code

`shared/` holds pure modules used by both the backend AI agents and the frontend, so the
readiness score is computed one way everywhere. The frontend imports them through the `@shared`
Vite alias. Keep them free of Node and browser APIs.
