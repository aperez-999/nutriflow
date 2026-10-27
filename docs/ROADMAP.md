# NutriFlow Roadmap

What has shipped and what comes next. The product angle (Fuel / Train / Recover in rhythm) is
described in the README under "Why it is different".

## Shipped

- **Today:** daily verdict and readiness score, 20-second check-in, meal and workout logging in slide-in panels, goals, rhythm map, weekly calorie chart, a getting-started guide
- **Coach:** AI chat on Groq (`openai/gpt-oss-120b`) that reads the user's own log, short answers, four follow-ups per reply, conversations kept on the account (they follow the user across devices), today's read and log insights; readiness and progress answers come from computed numbers
- **Library:** saved training and meal plans kept on the account, as tiles with per-item progress, one-tap logging, a muscle map per plan, and a 36-exercise library with muscle maps and form cues
- **Profile:** "Your week" (readiness per day, best day, totals vs last week, shareable), stats, rhythm and favorites
- **Settings:** goals, appearance, profile, password, and your data (download everything, or delete the account and all of it)
- **Landing page** with a live readiness demo; sign-in pages that adapt to returning and new users; a 404 page; expired sessions return the user to where they were (sessions last 7 days)
- **Design system** (`DESIGN.md`) across every screen; one swap animation; skeleton loading
- **Platform:** shared readiness formula (`shared/readinessScore.js`), web app manifest and icons, mobile tab bar, `npm run check` (lint, tests, build) in CI on every push, the chart library loaded only where it is shown
- **Security:** the AI only reads the data of the verified token's user; rate limits on AI chat and password reset; escaped contact-form email; a 401 always means "log in again"

## Next

1. **Deploy** the current version to Vercel (see the README's Deployment checklist).
2. **Morning check-in reminder** through web push.
3. **Safer sessions.** Move the token from `localStorage` to an httpOnly cookie and add refresh.
4. **Error tracking** (for example Sentry) and browser end-to-end tests in CI (Playwright).
5. **Fuel timing.** If a hard session is planned and today's intake is low, nudge a pre-workout meal.

## Known risks

- The fixed `vercel.json` and serverless entry were verified with a local emulation of Vercel's routing, not on Vercel itself; check `/api/health`, a deep link reload and `/manifest.webmanifest` on the first preview deploy.
- Readiness weights are heuristics, not clinically validated. Keep the copy advisory.
