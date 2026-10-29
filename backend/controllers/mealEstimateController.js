import { generateChatCompletion } from '../ai/config/aiProvider.js';

/**
 * "Describe a meal": a sentence like "chipotle bowl, chicken, rice, beans, guac" becomes an
 * estimate per item that the person checks and adjusts before logging. It is always shown as
 * an estimate; the clients never log it without the person seeing it.
 */

const MAX_ITEMS = 12;

const ESTIMATE_PROMPT = `You estimate the nutrition of a meal someone describes, for a food log.
Reply with JSON only, no other text:
{"title": "<what they'd call the meal, under 40 characters>", "items": [{"name": "<short food name>", "grams": <number>, "calories": <number>, "protein": <number>, "carbs": <number>, "fats": <number>}]}
- One item per food. Use the amounts they give (convert cups, pieces or ounces to grams); otherwise a typical single portion.
- Numbers are for that amount, not per 100 g. Drinks: grams equal millilitres.
- Use common restaurant or USDA values. Don't round everything to tens.
- If it isn't food, reply {"title": "", "items": []}.`;

const number = (value, max) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= max ? Math.round(parsed * 10) / 10 : null;
};

/**
 * The model's reply as a checked estimate, or null when it isn't one. Items with impossible
 * numbers are dropped; when calories disagree with the macros by more than a quarter, the
 * macros win (4 kcal per gram of protein and carbs, 9 per gram of fat).
 */
export function parseMealEstimate(content) {
  if (typeof content !== 'string') return null;
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  let parsed;
  try {
    parsed = JSON.parse(content.slice(start, end + 1));
  } catch {
    return null;
  }
  const items = (Array.isArray(parsed?.items) ? parsed.items : [])
    .slice(0, MAX_ITEMS)
    .map((item) => {
      const name = typeof item?.name === 'string' ? item.name.trim().slice(0, 60) : '';
      const grams = number(item?.grams, 2000);
      const protein = number(item?.protein, 300);
      const carbs = number(item?.carbs, 500);
      const fats = number(item?.fats, 300);
      let calories = number(item?.calories, 4000);
      if (!name || !grams || calories === null || protein === null || carbs === null || fats === null) return null;
      const fromMacros = protein * 4 + carbs * 4 + fats * 9;
      if (fromMacros > 0 && Math.abs(calories - fromMacros) > fromMacros * 0.25) calories = Math.round(fromMacros);
      return { name: name.charAt(0).toUpperCase() + name.slice(1), grams, calories, protein, carbs, fats };
    })
    .filter(Boolean);
  if (!items.length) return null;
  const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim().slice(0, 60) : items.map((item) => item.name).join(', ').slice(0, 60);
  return { title, items };
}

/** POST /api/food/estimate { description } */
export const estimateMeal = async (req, res) => {
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
  if (description.length < 3) {
    return res.status(400).json({ message: 'Describe what you ate, e.g. "two eggs and toast".' });
  }
  if (description.length > 300) {
    return res.status(400).json({ message: 'Keep it under 300 characters.' });
  }
  try {
    const { content } = await generateChatCompletion([
      { role: 'system', content: ESTIMATE_PROMPT },
      { role: 'user', content: description },
    ], { temperature: 0.2, light: true });
    const estimate = parseMealEstimate(content);
    if (!estimate) {
      return res.status(422).json({ message: "That didn't read as a meal. Try naming the foods, like \"chicken, rice and broccoli\"." });
    }
    return res.json(estimate);
  } catch (error) {
    console.error('Meal estimate error:', error);
    return res.status(503).json({ message: 'Estimates are unavailable right now. Search the foods or type the numbers instead.' });
  }
};
