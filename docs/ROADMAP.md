# Roadmap

## Done

- **Today:** the daily verdict and readiness score, the morning check-in, meal and workout
  logging, goals, weigh-ins with a weekly check-in that learns your real burn, a 12-week rhythm
  map and a weekly calorie chart.
- **Coach:** chat on Groq that reads your own log, follow-up suggestions, plans it builds and
  saves to the Library, memory of what you tell it, conversations kept on the account.
- **Library:** saved training and meal plans logged in one tap, and a 36-exercise library with
  muscle maps.
- **Profile and Settings:** your week, stats, a profile photo, goals, appearance, and your data
  (download it, or delete the account).
- **Accounts:** email and password or Google sign-in, email confirmation, password reset,
  sessions in an httpOnly cookie, sign out other devices, security emails.
- **Running costs:** limits and daily allowances counted in MongoDB, a daily budget on the AI
  provider with a lighter fallback model, 30-day caches for food lookups, and caps on stored
  chats and plans so the free database tier lasts.

## Next

1. **Morning reminders** for the check-in, through web push.
2. **Fuel timing:** when a hard session is planned and intake is low, suggest a meal before it.
3. **Error tracking** and browser end-to-end tests in CI.
4. **Redirect-mode Google sign-in**, for browsers whose ad blockers stop Google's popup.

## Known limits

- Readiness weights are heuristics, not clinically validated, so the copy stays advisory.
- The free MongoDB tier has no backups. Download your data from Settings now and then.
