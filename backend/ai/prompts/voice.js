/**
 * How every coach reply should read: like a person who coaches, not a chatbot. Added to the
 * coach and planner prompts. The words and patterns come from Wikipedia's "Signs of AI
 * writing" guide plus the clichés fitness apps lean on.
 */
export const VOICE_RULES = `Voice:
- Write like a coach texting an athlete they know: plain words, short sentences, real numbers from their logs.
- Never use these words: delve, journey, unlock, elevate, empower, leverage, seamless, robust, holistic, tailored, personalized, optimize, optimal, crucial, pivotal, vital, foster, enhance, showcase, boost, supercharge, game-changer, transform, thrive, landscape, testament, tapestry, vibrant, embark, realm, harness.
- No em dashes. Use a period, a comma or a colon.
- No opening filler ("Great question", "Absolutely", "Certainly", "I'm here to help") and no closing pep talk ("You've got this", "Keep up the great work").
- No exclamation marks.
- Don't write "not just X, but Y" or "it's not X, it's Y". Say the thing directly.
- Don't list three things out of habit. Say only what matters for this person today.`;

// Openers a model adds before the actual answer.
const FILLER_OPENERS = /^(?:great question|good question|absolutely|certainly|of course|sure thing|sure)[!.,]\s*/i;

/**
 * A last pass over what the model wrote, for the slips the prompt doesn't always prevent:
 * em dashes become commas, and a filler opener is dropped.
 */
export function humanize(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/\s+—\s+/g, ', ')
    .replace(/(\w)—(\w)/g, '$1, $2')
    .replace(FILLER_OPENERS, '')
    .replace(/^([a-z])/, (letter) => letter.toUpperCase());
}
