# Archive

This folder contains files that are **not used** by the current NutriFlow v2 application. They are kept for reference only and are not part of the active runtime.

## Contents

### frontend-legacy/
- **Layout/Footer.jsx** — Old footer component. The app uses `frontend/src/components/Footer.jsx` instead.
- **Layout/Header.jsx** — Old header component. The app uses `frontend/src/components/Navbar.jsx` instead.

- **Dashboard/** — Dashboard cards (TodayAISummary, QuickStatsStrip, GoalsSection, WeeklySummaryCard, RecommendedActionsCard, QuickActionsCard, DailyReadinessCard, DailyActionsCard, RecentActivityCard) replaced by the Fuel / Train / Recover dashboard (`ReadinessCheckInCard`, `TodayFlowsCard`, `RhythmCard`).
- **Dashboard/DietSection, Dashboard/WorkoutSection, Dashboard/index.js** — unused section wrappers and the old date navigators (replaced by `DaySummaryLabel`).
- **Diet/AddDiet, Diet/DietList, Workout/AddWorkout, Workout/WorkoutList, Global/PageTransition** — unused since the dashboard forms replaced them.
- **Marketing-PreAuthSurface.jsx** — gradient/glass landing and auth shell, replaced by `pages/Home.jsx` and `components/Auth/AuthLayout.jsx`.

The Layout files were moved from `frontend/src/components/legacy/` during the production audit. Do not import from this folder.
