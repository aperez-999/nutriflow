# NutriFlow Roadmap

## Product direction

Most nutrition apps are calorie ledgers that punish missed days. NutriFlow's angle is **Fuel / Train / Recover in rhythm**:

- **Readiness without a wearable.** Logs plus a 20-second check-in produce one honest daily score.
- **Fuel for training, not dieting.** Meals are judged against the training ahead; no food is labeled good or bad.
- **Consistency that forgives.** Streaks survive a single missed day; the rhythm map shows patterns, not failures.
- **A coach that knows your day.** The AI reads your own data (only when you are signed in) and gives one next step.

## Shipped

- **Today:** daily verdict and readiness score, 20-second check-in, meal and workout logging in slide-in panels, goals, rhythm map, weekly calorie chart, a getting-started guide
- **Coach:** AI chat on Groq (`openai/gpt-oss-120b`) that reads the user's own log, short answers, four follow-ups per reply, several conversations, today's read and log insights; readiness and progress answers come from computed numbers
- **Library:** saved training and meal plans as tiles with per-item progress, one-tap logging, a muscle map per plan, and a 36-exercise library (MongoDB) with muscle maps and form cues
- **Profile and Settings**, light/dark/device appearance
- **Landing page** with a live readiness demo; sign-in pages that adapt to returning and new users
- **Design system** (`DESIGN.md`) across every screen; one swap animation; skeleton loading
- **Platform:** shared readiness formula (`shared/readinessScore.js`), web app manifest and icons, mobile tab bar, `npm run check` (lint, tests, build)
- **Security:** the AI only reads the data of the verified token's user; rate limits on AI chat and password reset; escaped contact-form email

## Next

1. **Saved plans in MongoDB.** Plans live in `localStorage` today, so they do not sync across devices and vanish if storage is cleared. Required for the iOS app.
2. **CI.** Run `npm run check` and the browser flows (Playwright) on every push.
3. **Chat history per conversation.** The server keeps one conversation per user; the conversation list is per device.
4. **Account deletion and data export.** Required by the App Store before the iOS release.
5. **Morning check-in reminder.** Web push now, native notifications in iOS.
6. **Safer sessions.** Move the token from `localStorage` to an httpOnly cookie, and add refresh (tokens last one day).
7. **Error tracking** (for example Sentry) and split the large chart bundle.
8. **Weekly recap.** A shareable Sunday card: rhythm, best day, readiness trend.

## iOS app plan (Capacitor)

Capacitor wraps the existing React + Chakra build in a native shell, so web and iOS share one codebase. React Native would mean rewriting every screen.

1. `cd frontend && npm i @capacitor/core @capacitor/ios && npm i -D @capacitor/cli`
2. `npx cap init NutriFlow com.<you>.nutriflow --web-dir dist`
3. Point the API at the deployed backend: build with `VITE_API_URL=https://<your-domain>`. The native app is not served from your origin, so add `capacitor://localhost` to the backend CORS allow-list (it is currently a single `FRONTEND_URL`).
4. `npm run build && npx cap add ios && npx cap sync && npx cap open ios` (needs Xcode on macOS).
5. Native polish: `@capacitor/status-bar` (match `theme-color`), `@capacitor/haptics` on check-in save, `@capacitor/local-notifications` for the morning check-in, and `@capacitor/preferences` instead of `localStorage` for the auth token.
6. App Store: privacy nutrition labels (health and fitness data, email), account deletion in-app (required by Apple; not implemented yet), and a support URL.

Already in place for this: safe-area padding (`viewport-fit=cover`, `env(safe-area-inset-bottom)`), the bottom tab bar, PNG icons and the manifest.

## Known risks

- `vercel.json` routes every path to `index.html`; confirm on a preview deploy that `/manifest.webmanifest` and `/icons/*` are served as files.
- Readiness weights are heuristics, not clinically validated. Keep the copy advisory.
