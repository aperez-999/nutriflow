# AI Agent Stabilization Report

This report summarizes the stabilization pass for the NutriFlow v2 AI planner agents. The chat API contract is unchanged: all responses still return `{ content, suggestions, source }`. No frontend API or contract changes were made.

---

## 1. Parser fixes

### WorkoutPlannerAgent

- **Day headings:** Only lines that match defined day patterns are treated as day headings:
  - Weekdays: `Monday`, `Tuesday`, … `Sunday`, optionally with a suffix (e.g. `Monday – Push Day`).
  - Split labels: `Push Day`, `Pull Day`, `Leg Day`, `Upper`, `Lower`, `Rest Day`.
- **No exercise-as-day:** Lines that look like exercise names (e.g. “Bench Press”) are never classified as day headings; only the patterns above are.
- **Exercises:** Only lines that start with a bullet character (`•`, `-`, `*`) are parsed as exercises. All such characters are stripped before storing the exercise name.
- **Prompt:** System prompt was updated to ask the LLM to use these day labels and bullet lists only, and to avoid using exercise names as day headings.

### MealPlannerAgent

- **Bullet stripping:** Leading `*`, `-`, and `•` are removed from every line before parsing.
- **Meal extraction:** Only the labels **Breakfast**, **Lunch**, **Dinner**, and **Snack** are detected. Lines are parsed so that the label becomes `meal` and the rest of the line (or the next line) becomes `food`.
- **Cap:** Parsed meals are limited to at most **6** entries. VerifierAgent also enforces a maximum of 6 meals.
- **Single-day focus:** Parsing is geared toward one daily plan (no duplicate days); the prompt asks for a “daily meal plan” with 3–4 meals and optional snack.

---

## 2. Formatting improvements

### Planner output as chat content

- **Before:** For `workout_plan` and `meal_plan`, the orchestrator returned JSON-stringified objects in `content`.
- **After:** A dedicated formatter is used so `content` is human-readable text.

**New module:** `backend/ai/utils/formatPlannerOutput.js`

- **`formatWorkoutPlanForChat(result)`**  
  Builds a string in this shape:
  ```
  Workout Plan

  Monday – Push Day
  • Bench Press
  • Shoulder Press
  • Tricep Pushdowns

  Wednesday – Pull Day
  • Pull-ups
  ...
  ```
  - Uses verified `result.plan` (array of `{ day, exercises }`).
  - Falls back to `result.rawContent` if the plan is missing or invalid.

- **`formatMealPlanForChat(result)`**  
  Builds a string in this shape:
  ```
  Daily Meal Plan

  Target: 2000 calories

  Breakfast
  Greek yogurt with berries and granola

  Lunch
  Grilled chicken with quinoa and vegetables
  ...
  ```
  - Uses verified `result.meals` (array of `{ meal, food }`).
  - Optional `result.calories` is shown as “Target: X calories”.
  - Falls back to `result.rawContent` if meals are missing or invalid.

The orchestrator now calls these formatters for planner results so the API still returns `{ content, suggestions, source }` with `content` as plain text.

---

## 3. Verifier integration

- **Orchestrator:** For intents `workout_plan` and `meal_plan`, the flow is:
  1. Run the planner agent.
  2. Run **VerifierAgent** on the result: `result = verifyAgentResult(result)`.
  3. Format the verified result with `formatWorkoutPlanForChat` or `formatMealPlanForChat`.
  4. Return `{ content: formattedString, suggestions, source }`.

- **VerifierAgent behavior (unchanged conceptually, one cap tightened):**
  - **Workout plans:** Keeps only valid day entries, trims `day` and exercise strings to safe lengths, caps the plan to 14 days.
  - **Meal plans:** Clamps `calories` to 800–4000 if present, trims meal/food strings, and **caps meals at 6** (was 8; updated to match MealPlannerAgent and requirements).

No new verification logic was added; VerifierAgent is now consistently applied to planner outputs before formatting.

---

## 4. UI adjustments (typing indicator)

- **Copy:** The typing message is now exactly: **“AI Coach is analyzing your activity...”** (with ellipsis). Updated in `frontend/src/components/FitnessHub/AIFitnessChat/constants.js` (`TYPING_INDICATOR_TEXT`).

- **Layout (AIFitnessChat):**
  - The typing bubble uses `minH="40px"`, `display="flex"`, and `alignItems="center"` so the spinner and text are vertically centered.
  - The inner `HStack` (spinner + text + dots) uses `align="center"` and `flex="1"`.
  - Spinner has `flexShrink={0}` so it doesn’t shrink; the text box uses `lineHeight="1"` for consistent height.

- **TypingIndicator.jsx (TypingDots):**
  - The dots container has `alignSelf="center"` so the animated dots align vertically with the text when used in the flex row with the spinner and message.

No other frontend behavior or API contracts were changed.

---

## 5. Backward compatibility

- **Special token `[[RETURN_JSON_WORKOUT_PLAN]]`:**  
  Intent detection still forces this to the **HeadCoachAgent** path. That path continues to return the existing JSON workout plan format in `content` for the current frontend parser. No changes were made to this behavior.

- **API contract:**  
  Every response still has the shape `{ content, suggestions, source }`. Planner responses now use formatted text in `content` instead of raw JSON; suggestions still use `COACHING_ACTION_SUGGESTIONS` when not provided by the agent.

---

## 6. Files changed

| File | Change |
|------|--------|
| `backend/ai/utils/formatPlannerOutput.js` | **Added.** Formatters for workout and meal plan results to readable chat text. |
| `backend/ai/orchestrator/orchestrate.js` | Run VerifierAgent on planner results; use formatters for `content`; add `COACHING_ACTION_SUGGESTIONS` for planner replies. |
| `backend/ai/agents/WorkoutPlannerAgent.js` | Stricter day-heading and exercise-line parsing; updated system prompt. |
| `backend/ai/agents/MealPlannerAgent.js` | Bullet stripping; Breakfast/Lunch/Dinner/Snack extraction; meals capped at 6. |
| `backend/ai/agents/VerifierAgent.js` | Meal plan cap reduced from 8 to 6. |
| `frontend/.../AIFitnessChat/constants.js` | `TYPING_INDICATOR_TEXT` set to “AI Coach is analyzing your activity...”. |
| `frontend/.../AIFitnessChat/index.jsx` | Typing bubble layout: min height, flex, align center for spinner and text. |
| `frontend/.../AIFitnessChat/components/TypingIndicator.jsx` | Dots container given `alignSelf="center"` for vertical alignment. |
| `docs/AI_AGENT_STABILIZATION_REPORT.md` | **Added.** This report. |

---

## 7. Summary

- Planner outputs are now formatted as readable chat text instead of JSON.
- Workout and meal parsing are stricter and aligned with documented day/meal labels and bullet rules.
- VerifierAgent is always used for `workout_plan` and `meal_plan` before formatting; meal count is capped at 6.
- Typing indicator copy and layout were adjusted so “AI Coach is analyzing your activity...” is clearly shown and vertically centered with the spinner and dots.
- The `[[RETURN_JSON_WORKOUT_PLAN]]` path and the `{ content, suggestions, source }` API contract are unchanged.
