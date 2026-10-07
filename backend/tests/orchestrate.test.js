import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { orchestrateAI } from '../ai/orchestrator/orchestrate.js';

// The exact prompt the "How ready am I today?" quick action sends from the chat.
const READINESS_ACTION_PROMPT = 'Based on my recent workouts and nutrition, tell me how ready I am for a harder training day today. Use markdown headings for Readiness, Why, and Recommendation. Respond in plain language, not JSON.';

describe('orchestrateAI intent routing', () => {
  it('routes the readiness quick action to the readiness agent (no LLM call)', async () => {
    const result = await orchestrateAI({ message: READINESS_ACTION_PROMPT, context: {} });
    assert.match(result.content, /Daily Readiness Score: \d+\/100/);
  });

  it('routes a direct readiness question the same way', async () => {
    const result = await orchestrateAI({ message: 'How ready am I?', context: {} });
    assert.match(result.content, /Daily Readiness Score/);
  });
});
