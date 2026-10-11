// Helpers for saved AI plans: progress, and linking plan exercises to the exercise library.

const tokens = (text) => String(text || '')
  .toLowerCase()
  .replace(/[^a-z\s-]/g, ' ')
  .split(/[\s-]+/)
  .filter(Boolean)
  .map((word) => (word.length > 2 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word));

// Common names the coach uses that differ from the library's names.
const ALIASES = [
  ['overhead press', 'Shoulder Press'],
  ['military press', 'Shoulder Press'],
  ['chin up', 'Pull-ups'],
  ['pullup', 'Pull-ups'],
  ['pushup', 'Push-ups'],
  ['rdl', 'Romanian Deadlift'],
  ['split squat', 'Bulgarian Split Squat'],
  ['row', 'Seated Cable Row'],
  ['lunge', 'Walking Lunge'],
  ['curl', 'Bicep Curl'],
  ['fly', 'Dumbbell Fly'],
  ['pulldown', 'Lat Pulldown'],
  ['pushdown', 'Triceps Pushdown'],
  ['swing', 'Kettlebell Swing'],
  ['bridge', 'Glute Bridge'],
  ['carry', "Farmer's Carry"],
  ['jump rope', 'Jump Rope Intervals'],
];

const containsAll = (have, want) => want.length > 0 && want.every((word) => have.has(word));

/** Plan exercises arrive as objects ({ name, sets, reps }) or strings ("Squats 3x8"). */
export const exerciseName = (exercise) => (typeof exercise === 'string' ? exercise : exercise?.name || '');

/** The library exercise a plan exercise refers to, or null. Prefers the most specific name. */
export const matchExercise = (name, catalog = []) => {
  const words = tokens(name);
  const have = new Set(words);
  const compact = words.join('');
  let best = null;
  let bestSize = 0;
  for (const item of catalog) {
    const want = tokens(item.name);
    if ((containsAll(have, want) || compact.includes(want.join(''))) && want.length > bestSize) {
      best = item;
      bestSize = want.length;
    }
  }
  if (best) return best;
  const alias = ALIASES.find(([phrase]) => containsAll(have, tokens(phrase)) || compact.includes(phrase.replace(/\s/g, '')));
  return alias ? catalog.find((item) => item.name === alias[1]) || null : null;
};

/** Muscles a whole plan works: main muscles of any matched exercise, and those only ever helping. */
export const planMuscles = (workouts = [], catalog = []) => {
  const primary = new Set();
  const secondary = new Set();
  let matched = 0;
  let total = 0;
  workouts.forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      total += 1;
      const item = matchExercise(exerciseName(exercise), catalog);
      if (!item) return;
      matched += 1;
      item.primary.forEach((m) => primary.add(m));
      item.secondary.forEach((m) => secondary.add(m));
    });
  });
  return {
    primary: [...primary],
    secondary: [...secondary].filter((m) => !primary.has(m)),
    matched,
    total,
  };
};

/** How many items of a saved plan (sessions or meals) have been logged. */
export const planProgress = (items = []) => ({
  done: items.filter((item) => item?.completedRecordId).length,
  total: items.length,
});
