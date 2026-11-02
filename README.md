# NutriFlow

**Know what today needs.** NutriFlow reads what you ate, how you trained and how you slept, and
every morning gives you one call for the day: **Push day**, **Steady day** or **Recovery day**.
Then it tells you what to eat and how hard to train around it.

**Live:** [nutriflowdev.vercel.app](https://nutriflowdev.vercel.app)

## Why NutriFlow

Most nutrition apps are ledgers. They count every calorie, keep a streak, and leave it to you to
work out what the numbers mean. Training apps don't know what you ate, and sleep apps don't know
you trained. NutriFlow puts the three together.

- **One call for the day, not a spreadsheet.** Your logs and a 20-second morning check-in become
  a readiness score from 0 to 100 and a plain verdict. No watch, ring or subscription needed.
- **Targets that follow the day.** On a push day your carb target goes up; on a recovery day it
  comes down. Protein stays where it is.
- **Food is fuel, not a grade.** Meals are compared with the training ahead. No food is labeled
  good or bad.
- **It learns what you actually burn.** Weigh in a few mornings a week and the weekly check-in
  works out your real daily burn from your weight trend and what you ate, then suggests a
  calorie target for your goal.
- **Consistency that forgives.** A streak survives one missed day, and a 12-week rhythm map shows
  patterns instead of failures.
- **A coach that has read your log.** Ask it anything about training, food or recovery. It
  answers in a few lines from your own data, and readiness and progress answers come from the
  computed numbers, not guesses.

## What's in it

| | |
| --- | --- |
| **Today** | The verdict and readiness score, the morning check-in, meal and workout logging, goals, weigh-ins, the rhythm map and a weekly calorie chart |
| **Logging** | Search the USDA food database for meals and API Ninjas for exercises, or type the numbers in. Meals carry calories, protein, carbs, fat and fiber, against your own targets |
| **Coach** | Chat that reads your log, with follow-up suggestions after each answer. It can build a week of training or meals, and conversations follow you across devices |
| **Library** | Plans the coach built, saved to your account and logged in one tap, plus a 36-exercise library with muscle maps and form cues |
| **Profile** | Your week at a glance: readiness for each day, the best day, totals against the week before, and what you log most |
| **Settings** | Goals, appearance, profile photo, password, email confirmation, signing out other devices, and your data: download all of it or delete the account |

The landing page has a working demo: set last night's sleep, energy and soreness, and the real
readiness formula gives the verdict.

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
