# NutriFlow Roadmap

## Product direction

Most nutrition apps are calorie ledgers that punish missed days. NutriFlow's angle is **Fuel / Train / Recover in rhythm**:

- **Readiness without a wearable.** Logs plus a 20-second check-in produce one honest daily score.
- **Fuel for training, not dieting.** Meals are judged against the training ahead; no food is labeled good or bad.
- **Consistency that forgives.** Streaks survive a single missed day; the rhythm map shows patterns, not failures.
- **A coach that knows your day.** The AI reads your own data (only when you are signed in) and gives one next step.

## Shipped in this pass

- Goals persisted per user (`PUT /api/auth/me/goals`)
- Daily check-in model and API; readiness blends check-in with logs (`shared/readinessScore.js`, one formula for UI and AI)
- Dashboard redesign: readiness + check-in, today's flows, rhythm map, weekly fuel chart, Fuel/Train log tabs
- Mobile tab bar, web app manifest, iOS home-screen meta and icons
- Landing page rewritten around the differentiators
- Security: AI chat no longer trusts a client-supplied `userId`
- Tooling: Vitest + `node:test`, `npm run check`, lint at zero errors, route code-splitting

## Next

1. **Fuel timing.** If a hard session is planned and today's intake is low, nudge a pre-workout meal. Needs a "planned session" field.
2. **Weekly recap.** A shareable Sunday card in the day-label style: rhythm, best day, readiness trend. Good for word of mouth.
3. **Reminders.** Optional morning check-in reminder (web push now, native notifications in iOS).
4. **Account deletion.** Required by the App Store before the iOS release.
5. **Undo instead of confirm** for deleting entries, once there is a toast with actions.

Done since the first pass: the design system (`DESIGN.md`) now covers every screen, the app icon is the rhythm-day mark, and the Coach page, log forms and auth pages were rebuilt.

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
