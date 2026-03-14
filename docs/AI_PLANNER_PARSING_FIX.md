# AI Planner Parsing Fix

This document describes the parsing improvements made to `WorkoutPlannerAgent` and `MealPlannerAgent` so that valid content is no longer dropped. The API response contract is unchanged: all responses still return `{ content, suggestions, source }`. No frontend changes were made.

---

## 1. WorkoutPlannerAgent — Day detection

### Regex changes

**Weekday pattern**

- **Before:** Only matched weekdays with a strict `[–\-]` separator and trailing text (e.g. `Monday – Push Day`), and did not allow parentheses.
- **After:** Weekday regex now allows optional suffix with parenthesis or dash/endash:

  ```js
  /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(\s*[-–(].*)?$/i
  ```

  This matches:

  - `Monday`
  - `Monday (Push Day)`
  - `Monday - Push Day`
  - `Monday – Push Day`

**Split labels (standalone only)**

- Split labels (`Push Day`, `Pull Day`, `Leg Day`, `Upper`, `Lower`, `Rest Day`) are only treated as day headings when they are the **entire line** (after stripping a leading bullet). This avoids misclassifying lines like "Push Day exercises" as a day heading.
- Pattern: ` /^(Push\s+Day|Pull\s+Day|Leg\s+Day|Upper|Lower|Rest\s+Day)$/i `

### Behavior

- Leading bullets (`•`, `-`, `*`) are stripped before testing for a day heading.
- A line is considered a day heading only if it matches the weekday pattern (with optional suffix) or the standalone split-label pattern.

---

## 2. WorkoutPlannerAgent — Exercise parsing

### Fallback logic

Exercises are detected when any of the following is true:

1. Line starts with a bullet: `•`, `-`, or `*`.
2. Line contains a reps pattern: `\d+x\d+` (e.g. `3x10`, `4x8`).
3. Line contains parentheses with reps: `(\s*\d+\s*x\s*\d+\s*)` (e.g. `(3x10)`).

So lines like:

- `• Bench Press`
- `- Squats`
- `Bench Press (3x10)`
- `Squats 4x8`

are all treated as exercise lines. Bullets are stripped before storing the exercise name.

### Implementation

- `isExerciseLine(line)` returns true if the trimmed line starts with `•`, `-`, or `*`, or if it matches the reps patterns above.
- Exercise lines are only attached to the current day; if there is no current day, they are skipped (no orphan exercises).

---

## 3. MealPlannerAgent — Parsing improvements

### Step 1 — Strip bullet characters

- All lines are normalized by removing leading `*`, `-`, and `•` (and any following space) before further parsing.
- This allows lines like `* Breakfast: Greek yogurt` or `- Lunch - Salad` to be parsed correctly.

### Step 2 — Detect meal labels

- Only these labels are recognized (case-insensitive, at start of line after stripping bullets): **Breakfast**, **Lunch**, **Dinner**, **Snack**.
- `detectMealType(line)` returns the label if the trimmed line starts with one of these; otherwise returns `null`.

### Step 3 — Split using `:`, `-`, or first space

- Once a line is identified as starting with a meal label, the **food** part is taken as everything after the label and an optional separator.
- Separators supported: colon (`:`), dash (`-`), en-dash (`–`), or a single space.
- Implemented via: strip the leading meal label plus optional `[\s:–-]*` from the line; the remainder is the food.
- Examples:
  - `Breakfast: Greek yogurt` → meal = Breakfast, food = Greek yogurt
  - `Breakfast - Greek yogurt` → meal = Breakfast, food = Greek yogurt
  - `Breakfast Greek yogurt` → meal = Breakfast, food = Greek yogurt
  - `* Lunch: Grilled chicken` (after strip bullet) → meal = Lunch, food = Grilled chicken

Meals are still capped at 6 entries. No duplicate-day logic was added; the agent remains focused on a single daily plan.

---

## 4. Empty plans fallback

If parsing produces no structured data, the user still sees the raw model output instead of a generic “no plan” message.

- **Workout:** In `formatWorkoutPlanForChat()`, if `result.plan.length === 0`, the function returns `result.rawContent` (or a short fallback string if `rawContent` is missing).
- **Meal:** In `formatMealPlanForChat()`, if `result.meals.length === 0`, the function returns `result.rawContent` (or a short fallback string if missing).

So the API still returns `{ content, suggestions, source }` with `content` set to the raw LLM text when parsing yields an empty plan or meal list.

---

## 5. Debug logging

Temporary `console.log` statements were added to verify parsing:

- **WorkoutPlannerAgent:** After building the `plan` array, log `Parsed workout plan:` and the `plan` array.
- **MealPlannerAgent:** After building the capped `meals` array, log `Parsed meal plan:` and that array.

These can be removed or gated behind a debug flag once parsing behavior is confirmed.

---

## 6. Files changed

| File | Change |
|------|--------|
| `backend/ai/agents/WorkoutPlannerAgent.js` | New weekday regex; standalone split-label regex; exercise detection with bullet + reps fallback; debug log. |
| `backend/ai/agents/MealPlannerAgent.js` | Strip bullets first; `extractFoodAfterLabel()` for `:`, `-`, first space; debug log. |
| `backend/ai/utils/formatPlannerOutput.js` | If `plan.length === 0` or `meals.length === 0`, return `rawContent` (with fallback string). |
| `docs/AI_PLANNER_PARSING_FIX.md` | This report. |

---

## Summary

- **Workout days:** More flexible weekday suffixes (`(Push Day)`, `- Push Day`, `– Push Day`) and standalone split labels only.
- **Workout exercises:** Bullet lines plus lines with reps (`3x10`, `(3x10)`) are treated as exercises.
- **Meals:** Bullets stripped; Breakfast/Lunch/Dinner/Snack detected; food extracted after `:`, `-`, or first space.
- **Empty plans:** Formatter falls back to `rawContent` so users always see something.
- **Debug:** Temporary logs added for parsed workout plan and meal plan.

API contract and frontend are unchanged.
