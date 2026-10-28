/**
 * The coach's memory: when someone tells the coach something lasting about themselves, the
 * reply ends with a [[REMEMBER: ...]] line. It is taken out of the reply before anyone sees
 * it and saved as a note, which the coach reads on every later answer and the person can
 * see and delete.
 */

import CoachNote from '../../models/CoachNote.js';

export const MEMORY_RULES = `Memory:
- When their latest message tells you something new and lasting about themselves (a diet, allergy, injury, schedule, equipment, a goal or event, a food they hate), end your reply with one line: [[REMEMBER: <the fact in under 12 words, without their name, e.g. "Lactose intolerant" or "Trains at 6 am before work">]]
- Only what they just said. Never something already in the brief above, never today's numbers, never a guess.
- At most one per reply. Most replies have none.`;

const TAG = /\n?\s*\[\[\s*REMEMBER\s*:\s*([^\]]*)\]\]\s*/gi;
const MAX_NOTES = 30;
const MAX_LENGTH = 160;

/** Splits a reply into what the person sees and the note to save (the first one, if any). */
export function takeRememberedNote(content) {
  if (typeof content !== 'string') return { content, note: null };
  let note = null;
  const visible = content.replace(TAG, (_, text) => {
    const cleaned = text.replace(/\s+/g, ' ').trim().replace(/\.$/, '');
    if (!note && cleaned) note = cleaned.slice(0, MAX_LENGTH);
    return '\n';
  }).trim();
  return { content: visible, note };
}

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const COMMON = new Set(['about', 'after', 'also', 'always', 'before', 'does', 'from', 'have', 'into', 'just', 'like', 'more', 'only', 'that', 'their', 'them', 'they', 'this', 'what', 'when', 'with', 'would', 'your']);
const words = (text) => normalize(text).split(' ').filter((word) => word.length >= 4 && !COMMON.has(word));

/**
 * The note as it should be kept, or null when it doesn't come from what the person just
 * said. A model sometimes "remembers" things nobody told it (the brief it was given, or a
 * guess), so a note has to share a real word with the message: "I'm lactose intolerant"
 * can become "Lactose intolerant", but "Should I do legs tomorrow?" can't become anything.
 */
export function groundedNote(note, { message = '', userName = '' } = {}) {
  if (!note) return null;
  let text = note.trim();
  if (userName) {
    const escaped = userName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`^${escaped}(?:'s)?\\s+(?:is\\s+)?`, 'i'), '');
  }
  text = text.replace(/^(?:the user|user|they|he|she)\s+(?:is\s+)?/i, '');
  text = text.charAt(0).toUpperCase() + text.slice(1);
  const said = new Set(words(message));
  return words(text).some((word) => said.has(word)) ? text : null;
}

/**
 * Saves a note unless the coach already has it, keeping the newest thirty.
 * Returns the saved text, or null when nothing new was saved.
 */
export async function rememberNote(userId, text) {
  if (!userId || !text) return null;
  const existing = await CoachNote.find({ user: userId }).select('text').lean();
  const key = normalize(text);
  if (!key || existing.some((note) => normalize(note.text).includes(key) || key.includes(normalize(note.text)))) return null;

  await CoachNote.create({ user: userId, text });
  if (existing.length + 1 > MAX_NOTES) {
    const oldest = await CoachNote.find({ user: userId })
      .sort({ createdAt: 1 })
      .limit(existing.length + 1 - MAX_NOTES)
      .select('_id')
      .lean();
    await CoachNote.deleteMany({ _id: { $in: oldest.map((note) => note._id) } });
  }
  return text;
}
