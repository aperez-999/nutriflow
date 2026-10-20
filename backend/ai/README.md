# AI layer

Everything the coach does lives here. The rest of the backend calls one function,
`orchestrateAI({ message, context, history })` (from `controllers/aiController.js`), and gets
back the API contract the chat relies on:

```js
{ content: string, suggestions: string[], source: 'groq' | 'ollama' | 'fallback' | 'readiness' | ... }
```

## How a message is answered

1. **`orchestrator/orchestrate.js`** detects the intent from the message and runs one agent.
2. The agent produces the answer (see the table).
3. Plan and insight results go through **`VerifierAgent`**, then a formatter in `utils/` turns
   them into readable chat text (never raw JSON).
4. Readiness and insight answers are computed by rules, then **`utils/narrateFacts.js`** asks the
   model to answer the user's actual question from those numbers. If no model is reachable,
   the computed text is returned as is.
5. **`utils/followUps.js`** attaches at most four follow-up suggestions that continue the topic.
   Entries such as `Generate Weekly Plan` match the chat's quick actions; the rest are questions.

| Intent | Triggered by | Agent | Uses the model |
| --- | --- | --- | --- |
| coach | anything else, and plan requests marked `[[RETURN_JSON_WORKOUT_PLAN]]` | `HeadCoachAgent` | yes (JSON plan when marked) |
| meal_plan | "meal plan" | `MealPlannerAgent` | yes |
| workout_plan | "workout plan" | `WorkoutPlannerAgent` | yes |
| readiness | "how ready am I", "should I train today", "why is today a … day" | `ReadinessAgent` | to explain the score |
| insights | "analyze my progress", "how is my week going" | `InsightsAgent` | to explain the numbers |

## Parts

- **`config/aiProvider.js`**: the only place that talks to Groq or Ollama. With a local
  `OLLAMA_URL` (and not on Vercel) it tries Ollama first, then Groq; otherwise Groq.
  `AI_PROVIDER` forces one. If Groq has retired `GROQ_MODEL`, it retries with
  `DEFAULT_GROQ_MODEL` (`openai/gpt-oss-120b`) and logs a warning.
- **`prompts/coachPrompt.js`**: the coach persona, the length rules (one-line answer, at most
  three bullets) and the summary of the user's recent log.
- **`tools/get_user_stats.js`**: loads the signed-in user's recent workouts, meals and check-in.
  The user id always comes from the verified token (`identifyUser`), never from the client.
- **`agents/`**: one focused agent per intent (registered in `agents/index.js`), plus
  `VerifierAgent`, which sanity-checks plan values without calling a model.
- **`utils/`**: `fetchCompat` (fetch with a timeout), the plan and insight formatters,
  `narrateFacts` and `followUps`.

Readiness scoring itself is shared with the frontend: `shared/readinessScore.js`.

## Tests

`backend/tests/orchestrate.test.js` and `followUps.test.js` cover routing and follow-ups. They
point the provider at an unreachable address, so they never call a real model.
