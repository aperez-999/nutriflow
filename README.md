# NutriFlow

NutriFlow is a fitness and nutrition tracker that looks at your meals, workouts and sleep
together and gives you a call for the day each morning: push, hold steady, or recover. Your
carb target and the coach's advice adjust to match.

Live at [nutriflowdev.vercel.app](https://nutriflowdev.vercel.app).

## The idea

Food usually goes in one app, workouts in another and sleep in a third, and none of them answers
the question you have in the morning: should I train hard today, and what should I eat for it?
NutriFlow keeps all three in one place and answers that.

How it works:

- Each morning you answer four quick questions (sleep, energy, soreness, water). Together with
  your recent meals and training, that gives a readiness score from 0 to 100 and a verdict:
  Push day, Steady day or Recovery day. You don't need a watch or a ring.
- On a push day the carb target goes up, and on a recovery day it goes down. Protein stays the
  same either way.
- If you weigh in a few times a week, the weekly check-in works out what you really burn from
  your weight trend and what you ate, and suggests a calorie target for your goal.
- Missing a day doesn't break your streak. Missing two does.
- The coach is an AI chat that can see your log, so you can ask "should I do legs after five
  hours of sleep?" and get an answer based on your week. Readiness and progress questions are
  answered from the computed numbers.

## Features

| | |
| --- | --- |
| **Today** | The verdict and readiness score, the morning check-in, meal and workout logging, goals, weigh-ins, a 12-week rhythm map and a weekly calorie chart |
| **Logging** | Food search from the USDA database and exercise search from API Ninjas, or enter the numbers yourself. Meals track calories, protein, carbs, fat and fiber against your targets |
| **Coach** | Chat about training, food or recovery. It suggests follow-up questions, can plan a week of workouts or meals, and keeps your conversations across devices |
| **Library** | Plans from the coach, saved to your account and logged with a tap, plus 36 exercises with muscle maps and form cues |
| **Profile** | Your week: readiness by day, your best day, totals compared with the week before, and what you log most |
| **Settings** | Goals, light or dark mode, profile photo, password, email confirmation, signing out other devices, and downloading or deleting your data |

The landing page has a demo you can try without an account: set your sleep, energy and
soreness, and it runs the same readiness formula the app uses.

## Privacy and security

- No ads, no analytics, no tracking scripts. Data is used only to run the app for you
  ([privacy policy](https://nutriflowdev.vercel.app/privacy)).
- Sign in with email and password or with Google. Passwords are hashed with bcrypt and need at
  least 8 characters.
- The website's session lives in an httpOnly, same-site cookie that scripts can't read, and
  every write needs the site's own request header. Changing or resetting a password signs out
  every other device.
- New accounts confirm their email. Password changes, resets and newly linked Google sign-ins
  send a short security email.
- Sign-in, sign-up, password reset, the coach and photo uploads are rate limited, and the coach
  has a daily allowance so it stays free to run.

## Built with

- **Frontend:** React 18, Vite, Chakra UI with a custom theme, Framer Motion, React Router, Recharts
- **Backend:** Node.js 20+, Express, MongoDB with Mongoose, JWT sessions, Nodemailer (Gmail)
- **AI:** Groq (`openai/gpt-oss-120b`, falling back to `openai/gpt-oss-20b`), or a local Ollama model in development
- **Data:** USDA FoodData Central, Open Food Facts, API Ninjas exercises
- **Hosting:** one Vercel project: the static frontend and a serverless function that runs the Express app

The readiness formula lives in `shared/readinessScore.js` and is used by both the server and the
browser, so the score is worked out the same way everywhere.

## Run it locally

You need Node.js 20 or newer, a MongoDB database (a free Atlas cluster works), and API keys for
USDA, API Ninjas and Groq (or [Ollama](https://ollama.com/) running locally).

```bash
npm --prefix frontend install
npm --prefix backend install

cp backend/.env.example backend/.env                 # then fill in the values
cp frontend/.env.local.example frontend/.env.local

npm --prefix backend run dev     # API on http://localhost:3000
npm --prefix frontend run dev    # site on http://localhost:5173
```

Every setting is explained in [`backend/.env.example`](backend/.env.example). Google sign-in and
email are optional: without `GOOGLE_CLIENT_IDS` the Google button is hidden, and without the
email settings the account emails are skipped.

## Checks

`npm run check` from the repository root runs the linter, the backend tests (`node:test`), the
frontend tests (Vitest) and a production build. GitHub Actions runs it on every push and pull
request.

## Deploying to Vercel

The repository root is the Vercel project. `vercel.json` builds the frontend into
`frontend/dist` and sends every `/api/*` request to `api/index.js`, which runs the Express app.

1. Leave **Root Directory** empty and the framework preset on Other.
2. Add the variables from `backend/.env.example`, with `NODE_ENV=production` and `FRONTEND_URL`
   set to the site's address. Add `VITE_GOOGLE_CLIENT_ID` to show the Google button.
3. Deploy, then open `/api/health`. It should answer `{"ok":true,"provider":"groq",...}`.

## Repository layout

```
api/index.js          Vercel entry: runs backend/app.js
shared/               Code both sides use (the readiness formula)
backend/
  app.js              Middleware and route wiring
  routes/             URLs, validation and limits
  controllers/        Request handling
  models/             Mongoose models
  middleware/         Sessions, rate limits, errors
  ai/                 The coach: agents, prompts, the model provider
  utils/              Email, sessions, Google sign-in, energy balance, caches
  tests/              node:test suites
frontend/src/
  pages/              One file per route
  components/         Grouped by area: Auth, Dashboard, FitnessHub (the coach), Library, Profile...
  services/api.js     Every API call
  theme/              The Chakra theme
```

## More

- [DESIGN.md](DESIGN.md): the design system every screen follows
- [docs/API.md](docs/API.md): every API route
- [backend/ai/README.md](backend/ai/README.md): how the coach answers
- [docs/ROADMAP.md](docs/ROADMAP.md): what's done and what's next
