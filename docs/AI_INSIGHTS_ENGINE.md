# AI Insights Engine

The AI Insights Engine analyzes user workout and diet data and produces actionable insights about habits, trends, and improvements. It is rule-based (no LLM call) and uses the same user stats as other agents.

---

## Agent responsibilities

**InsightsAgent** (`backend/ai/agents/InsightsAgent.js`):

- **Input:** `{ message, context, history }`. Uses `context.userId` when present.
- **Data:** Calls `get_user_stats(userId)` from `backend/ai/tools/get_user_stats.js` to get:
  - `recentWorkouts` (last 10)
  - `recentDiets` (last 10)
  - `userName`
- **Computation:**
  - Workouts this week (count of workouts with `date >=` start of current week)
  - Workouts total (length of recent workouts)
  - Diet entries (length of recent diets)
  - Average calories (mean of `calories` across recent diet entries)
  - Workout types (counts by `type`: Cardio, Strength, etc.)
- **Output:** `{ type: 'insights', insights: string[], source: 'insights' }`

The agent does **not** call the LLM. Insights are generated from simple rules over the computed metrics.

---

## Insight rules

Rules are applied in order; multiple insights can be returned.

| Condition | Insight message |
|-----------|-----------------|
| `workoutsThisWeek <= 1` and at least one workout ever | "You're training only once per week. Try aiming for 3–4 sessions." |
| No workouts logged | "No workouts logged yet. Start with 2–3 sessions per week and build from there." |
| `averageCalories < 1500` (with some diet data) | "Your calorie intake is very low for your activity level." |
| `averageCalories > 3500` | "Your average intake is quite high. Consider balancing with your goals." |
| At least 2 workouts and cardio count > strength count | "Most of your workouts are cardio. Add resistance training for balance." |
| At least 2 workouts, some strength, no cardio | "Adding 1–2 cardio sessions per week can improve endurance." |
| `dietEntries < 3` and at least one entry | "You log meals inconsistently. Logging daily helps spot patterns." |
| No diet entries | "No meals logged yet. Logging food helps you hit your nutrition goals." |
| No rule matched | "Keep logging workouts and meals to get personalized insights." |

---

## Architecture flow

```
User message (e.g. "analyze my progress", "how am I doing", "fitness insights")
    ↓
Orchestrator intent detection → INTENT.INSIGHTS
    ↓
AGENTS.insights → runInsightsAgent({ message, context, history })
    ↓
get_user_stats(context.userId) → recentWorkouts, recentDiets
    ↓
Compute: workoutsThisWeek, workoutsTotal, dietEntries, averageCalories, workout types
    ↓
Apply rules → insights: string[]
    ↓
VerifierAgent.verifyAgentResult(result) → sanitize insights (max 12 items, 300 chars each)
    ↓
formatInsightsForChat(result) → "AI Insights\n\n• ...\n• ..."
    ↓
Return { content, suggestions: ["Generate workout plan", "Create meal plan"], source }
```

**API contract:** All responses continue to return `{ content, suggestions, source }`. No frontend or API contract changes.

---

## Intent detection

The orchestrator routes to **InsightsAgent** when the user message (lowercased) contains any of:

- `"analyze my progress"`
- `"progress analysis"`
- `"how am i doing"`
- `"fitness insights"`
- both `"analyze"` and `"progress"`

---

## Files

| File | Purpose |
|------|--------|
| `backend/ai/agents/InsightsAgent.js` | Rule-based insights from user stats; returns `{ type, insights, source }`. |
| `backend/ai/utils/formatInsightsOutput.js` | Formats insights array as chat text ("AI Insights" + bullet list). |
| `backend/ai/agents/VerifierAgent.js` | Sanitizes `insights` (strings only, max length/count). |
| `backend/ai/agents/index.js` | Registers `insights: runInsightsAgent` in `AGENTS`. |
| `backend/ai/orchestrator/orchestrate.js` | Adds `INTENT.INSIGHTS`, routes to insights agent, runs verifier → formatter, returns `INSIGHTS_SUGGESTIONS`. |

---

## Debug logging

InsightsAgent logs:

```text
Insights generated: [ '...', '...' ]
```

This allows verification of which insights were produced for a given user state.
