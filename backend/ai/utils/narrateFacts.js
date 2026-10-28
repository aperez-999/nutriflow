/**
 * narrateFacts: lets the LLM answer the user's actual question from numbers
 * NutriFlow computed itself (readiness, progress insights).
 *
 * The rule-based agents stay the source of truth for the figures; the model only
 * explains them in context. Callers keep their template text if this throws.
 */

import { generateChatCompletion } from '../config/aiProvider.js';
import { COACH_SYSTEM_PROMPT } from '../prompts/coachPrompt.js';

const MAX_HISTORY = 10;

/**
 * @param {{ message: string, facts: string, history?: Array<{ type: string, content: string }> }} params
 * @returns {Promise<{ content: string, source: string }>}
 */
export async function narrateFacts({ message, facts, history = [] }) {
  const messages = [
    { role: 'system', content: COACH_SYSTEM_PROMPT },
    {
      role: 'system',
      content: [
        'NutriFlow computed the facts below from this user\'s own log. Treat them as correct:',
        'use these numbers exactly and do not invent other figures.',
        'Answer the user\'s actual question from them in plain, encouraging language.',
        'Pick only the facts that matter for the question; keep to the length rules above. Do not return JSON.',
        '',
        facts,
      ].join('\n'),
    },
    ...history.slice(-MAX_HISTORY).map((m) => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  const { content, provider } = await generateChatCompletion(messages, { temperature: 0.5 });
  return { content, source: provider };
}
