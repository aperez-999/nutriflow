# NutriFlow 2.0 — AI Layer

This directory is the **AI orchestration layer** for NutriFlow. It centralizes all AI behavior (prompts, agents, tools) so the rest of the app stays unchanged.

## Purpose of each part

- **orchestrator/** — Entry point. Receives user message and context, detects intent (coach / workout_plan / meal_plan), and routes to the right agent. Returns `{ content, suggestions, source }` to match the existing API.

- **agents/** — One agent per capability. **HeadCoachAgent** handles general fitness/nutrition conversation (Phase 1). Future: MealPlannerAgent, WorkoutPlannerAgent, VerifierAgent.

- **tools/** — Functions that agents (or the orchestrator) can call to read/write data. **get_user_stats(userId)** returns recent workouts, diets, and user name from the DB. Future: search_food, search_exercise, log_diet, log_workout.

- **prompts/** — System and context prompt templates. **coachPrompt.js** defines the NutriFlow AI Coach persona and the context summary format. Future: mealPlanner, workoutPlanner, verifier.

- **utils/** — Shared helpers for the AI layer (e.g. fetchCompat for Groq/Ollama HTTP calls).

## Phase 1 & 2

Only the **coach** intent is implemented. All requests go through `orchestrateAI()` → `HeadCoachAgent`.

**Phase 2:** When the client sends `context.userId`, the HeadCoachAgent calls `get_user_stats(userId)` to load recent workouts, diets, and user name from the DB. The prompt receives a structured context summary (User, Recent Workouts this week, Recent Diet Entries, Average Calories) so the AI can analyze patterns and give personalized advice (e.g. suggest more strength work, calorie adjustment). Suggestions include category-based chips plus "Generate workout plan", "Create meal plan", "Analyze my progress" for future agents.

Existing behavior (suggestions, fallback, JSON workout plan via `[[RETURN_JSON_WORKOUT_PLAN]]`) is preserved.
