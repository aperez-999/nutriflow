import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { orchestrateAI } from '../ai/orchestrator/orchestrate.js';

// No provider is reachable here (nothing listens on port 9), so these cover the offline
// path: readiness falls back to the computed, rule-based answer instead of failing.
process.env.AI_PROVIDER = 'ollama';
process.env.OLLAMA_URL = 'http://127.0.0.1:9';

// The exact prompt the "How ready am I today?" quick action sends from the chat.
const READINESS_ACTION_PROMPT = 'Based on my recent workouts and nutrition, how ready am I for a harder training day today? Keep it short: my score, the main reason, and what to do today. Respond in plain language, not JSON.';

describe('orchestrateAI intent routing', () => {
  it('routes the readiness quick action to the readiness agent and keeps its numbers offline', async () => {
    const result = await orchestrateAI({ message: READINESS_ACTION_PROMPT, context: {} });
    assert.match(result.content, /Daily Readiness Score: \d+\/100/);
  });

  it('routes the progress quick action to the computed insights, not free chat', async () => {
    const result = await orchestrateAI({ message: 'How is my week going? Give me the one thing that is working and the one thing to change, briefly.', context: {} });
    assert.equal(result.suggestions.includes('Create meal plan'), true);
  });

  it('answers "why is today a ... day" from the readiness numbers', async () => {
    const result = await orchestrateAI({ message: 'Why is today a recovery day?', context: {} });
    assert.match(result.content, /Daily Readiness Score/);
  });

  it('routes a direct readiness question the same way', async () => {
    const result = await orchestrateAI({ message: 'How ready am I?', context: {} });
    assert.match(result.content, /Daily Readiness Score/);
  });
});
