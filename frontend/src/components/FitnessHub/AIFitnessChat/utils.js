import { DEFAULT_SUGGESTIONS, GENERIC_BACKEND_FALLBACK_MESSAGE } from './constants';

export const parseAIRecommendations = (content) => {
  try {
    if (!content || typeof content !== 'string') return false;
    let cleaned = content.trim();
    // Remove code fences and normalize unicode dashes to ASCII hyphen
    cleaned = cleaned.replace(/```json|```/gi, '').replace(/[\u2013\u2014]/g, '-').trim();
    
    // If no brackets found, try to parse entire string
    let start = cleaned.indexOf('[');
    let end = cleaned.lastIndexOf(']');
    let jsonText = '';
    
    if (start !== -1 && end !== -1 && end > start) {
      jsonText = cleaned.slice(start, end + 1);
    } else {
      // If the model returned a single object, wrap it into an array
      if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
        jsonText = `[${cleaned}]`;
      } else {
        return false;
      }
    }
    
    // Clean up JSON formatting issues
    jsonText = jsonText
      // Remove trailing commas before ] or }
      .replace(/,\s*([}\]])/g, '$1')
      // Fix common invalid JSON from models: reps: 8-12 should be a string
      .replace(/("reps"\s*:\s*)(\d+)\s*-\s*(\d+)/g, '$1"$2-$3"')
      // Handle en-dash ranges
      .replace(/("reps"\s*:\s*)(\d+)\s*[-\u2013\u2014]\s*(\d+)/g, '$1"$2-$3"')
      // Quote any bare reps value (e.g., 30-60 seconds)
      .replace(/("reps"\s*:\s*)(?!")(.*?)(?=,|[}\]])/g, (m, p1, p2) => p1 + '"' + String(p2).trim().replace(/"/g, '\\"') + '"')
      // Quote calories ranges like 250-300
      .replace(/("calories"\s*:\s*)(\d+)\s*[-\u2013\u2014]\s*(\d+)/g, '$1"$2-$3"')
      // Quote difficulty fractions like 6/10
      .replace(/("difficulty"\s*:\s*)(\d+)\s*\/\s*(\d+)/g, '$1"$2/$3"')
      // Ensure N/A is quoted
      .replace(/("difficulty"\s*:\s*)(N\/A)/gi, '$1"N/A"');

    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed) || parsed.length === 0) return false;

    const normalizeIntensity = (val) => {
      const s = String(val || '').toLowerCase();
      if (s.startsWith('high')) return 'High';
      if (s.startsWith('medium') || s.startsWith('moderate')) return 'Medium';
      if (s.startsWith('low') || s === 'n/a') return 'Low';
      return 'Medium';
    };

    const extractYouTubeId = (v) => {
      if (!v) return null;
      const str = String(v);
      const m = str.match(/(?:v=|be\/|embed\/)([A-Za-z0-9_-]{6,})/);
      // If it looks like a bare ID already (common YouTube ID length 11), accept it
      if (!m && /^[A-Za-z0-9_-]{8,15}$/.test(str)) return str;
      return m ? m[1] : null;
    };

    const guessVideoUrl = (title, focusAreas) => {
      const text = `${title} ${(focusAreas || []).join(' ')}`.toLowerCase();
      const vids = {
        upper: 'https://www.youtube.com/watch?v=U0bhE67HuDY', // Upper Body Workout - Athlean-X
        lower: 'https://www.youtube.com/watch?v=H6mRkx1x77k', // Lower Body Workout - Jeff Nippard
        cardio: 'https://www.youtube.com/watch?v=ml6cT4AZdqI', // 20 min Cardio HIIT - MadFit
        core: 'https://www.youtube.com/watch?v=AnYl6Nk9GOA', // 10 min Abs Workout - FitnessBlender
        mobility: 'https://www.youtube.com/watch?v=jj2AAH6jbHk', // Mobility Routine
        full: 'https://www.youtube.com/watch?v=nxisr1AalNc', // Full Body Workout - Jeff Nippard 
      };
      if (/(upper|chest|shoulder|tricep|bicep|arms)/.test(text)) return vids.upper;
      if (/(lower|legs|glute|quad|hamstring|calf)/.test(text)) return vids.lower;
      if (/(cardio|hiit|interval|run|bike)/.test(text)) return vids.cardio;
      if (/(core|abs|plank|oblique)/.test(text)) return vids.core;
      if (/(mobility|stretch|flexibility)/.test(text)) return vids.mobility;
      return vids.full;
    };

    return parsed.map((w, idx) => {
      const title = (typeof w.title === 'string' && w.title.trim())
        ? w.title.trim()
        : (typeof w.name === 'string' && w.name.trim())
          ? w.name.trim()
          : (typeof w.day === 'string' && w.day.trim())
            ? w.day.trim()
            : `Workout ${idx + 1}`;

      const focusAreas = Array.isArray(w.focusAreas)
        ? w.focusAreas.filter(Boolean).map(String)
        : (typeof w.focusAreas === 'string' && w.focusAreas.trim())
          ? w.focusAreas.split(/,|\//).map(s => s.trim()).filter(Boolean)
          : ['General Fitness'];

      const exercises = Array.isArray(w.exercises) ? w.exercises.map(ex => ({
        name: String(ex?.name || 'Exercise'),
        sets: ex?.sets ?? undefined,
        reps: ex?.reps != null ? String(ex.reps) : undefined,
        interval: ex?.interval != null ? String(ex.interval) : undefined,
        equipment: ex?.equipment || undefined,
        difficulty: ex?.difficulty || undefined,
      })) : [];

      return {
        title,
        duration: Number.isFinite(Number(w.duration)) ? Number(w.duration) : 45,
        intensity: normalizeIntensity(w.intensity),
        focusAreas,
        exercises,
        videoId: extractYouTubeId(w.videoId) || guessVideoUrl(title, focusAreas),
        description: (typeof w.description === 'string' && w.description.trim())
          ? w.description.trim()
          : (focusAreas.length ? `Focus: ${focusAreas.join(', ')}` : 'AI-generated workout plan'),
        calories: (typeof w.calories === 'string' || typeof w.calories === 'number') ? String(w.calories) : '300-400',
        difficulty: typeof w.difficulty === 'string' ? w.difficulty : 'Intermediate',
      };
    });
  } catch {
    return false;
  }
};

export const fallbackParseWorkoutPlan = (content) => {
  if (!content || typeof content !== 'string') return false;

  const cleaned = content.replace(/```/g, '').trim();
  const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return false;

  const dayHeadingRegex = /^(?:#{1,3}\s*)?(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Push Day|Pull Day|Leg Day|Upper Body|Lower Body|Full Body|Recovery Day|Conditioning|Mobility Day)(?:\s*[:-].*)?$/i;
  const bulletRegex = /^(?:[-*•]\s+)(.+)$/;
  const repRegex = /(.+?)(?:\s+\(?\d+\s*x\s*[\d-]+\)?|\s+\d+\s*reps?)/i;

  const plan = [];
  let current = null;

  lines.forEach((line, index) => {
    const headingMatch = line.match(dayHeadingRegex);
    if (headingMatch) {
      current = {
        title: line.replace(/^#{1,3}\s*/, '').trim(),
        duration: 45,
        intensity: 'Medium',
        focusAreas: ['General Fitness'],
        exercises: [],
        description: `Training focus for ${line.replace(/^#{1,3}\s*/, '').trim()}`,
        calories: '250-350',
        difficulty: 'Intermediate',
      };
      plan.push(current);
      return;
    }

    if (!current && index === 0) {
      current = {
        title: 'Weekly Plan',
        duration: 45,
        intensity: 'Medium',
        focusAreas: ['General Fitness'],
        exercises: [],
        description: 'AI-generated weekly training outline',
        calories: '250-350',
        difficulty: 'Intermediate',
      };
      plan.push(current);
    }

    const bulletMatch = line.match(bulletRegex);
    const repMatch = line.match(repRegex);
    const exerciseName = bulletMatch?.[1] || repMatch?.[1];

    if (current && exerciseName) {
      current.exercises.push({
        name: exerciseName.trim(),
        sets: undefined,
        reps: undefined,
        interval: undefined,
      });
    }
  });

  const normalized = plan
    .map((workout, index) => ({
      ...workout,
      title: workout.title || `Workout ${index + 1}`,
      exercises: Array.isArray(workout.exercises) && workout.exercises.length > 0
        ? workout.exercises.slice(0, 6)
        : [{ name: `Workout block ${index + 1}` }],
    }))
    .filter((workout) => Array.isArray(workout.exercises) && workout.exercises.length > 0);

  return normalized.length > 0 ? normalized : false;
};

export const parseAIMealPlan = (content) => {
  if (!content || typeof content !== 'string') return false;

  const cleaned = content.replace(/```/g, '').trim();
  const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return false;

  const mealHeadingRegex = /^(?:#{1,3}\s*)?(Breakfast|Lunch|Dinner|Snack|Snacks)\s*:?\s*(.*)$/i;
  const titleLine = lines.find((line) => /daily meal plan|meal plan/i.test(line));
  const calorieLine = lines.find((line) => /^target\s*:/i.test(line));
  const calorieMatch = calorieLine?.match(/(\d{3,4})/);

  const meals = [];
  let currentMealType = null;
  let currentFood = [];

  const pushMeal = () => {
    const joined = currentFood
      .join(' ')
      .replace(/^[-•*]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (currentMealType && joined) {
      meals.push({
        mealType: currentMealType === 'Snacks' ? 'Snack' : currentMealType,
        foodName: joined,
      });
    }
  };

  lines.forEach((line) => {
    const mealMatch = line.match(mealHeadingRegex);
    if (mealMatch) {
      pushMeal();
      currentMealType = mealMatch[1].charAt(0).toUpperCase() + mealMatch[1].slice(1).toLowerCase();
      currentFood = mealMatch[2] ? [mealMatch[2]] : [];
      return;
    }

    if (!currentMealType) return;
    if (/^(overview|next steps|wins|watchouts|recommendation|why)\b/i.test(line)) {
      pushMeal();
      currentMealType = null;
      currentFood = [];
      return;
    }

    currentFood.push(line);
  });

  pushMeal();

  if (meals.length === 0) return false;

  return {
    title: titleLine || `Meal Plan ${new Date().toLocaleDateString()}`,
    calories: calorieMatch ? Number(calorieMatch[1]) : null,
    meals,
  };
};

const ACTION_PROMPT_MAP = {
  'Generate Weekly Plan': 'Can you generate a personalized weekly fitness plan for me based on my recent activity and fitness level? Include a short readable overview with headings for each workout day, and also include the machine-readable plan payload. [[RETURN_JSON_WORKOUT_PLAN]]',
  'Create Meal Plan': 'Create a personalized meal plan based on my recent activity and nutrition patterns. Use clear markdown headings like Overview, Breakfast, Lunch, Dinner, Snacks, and Next Steps. Respond in plain language, not JSON.',
  'Analyze My Progress': 'Analyze my recent fitness and nutrition progress. Use markdown headings for Wins, Watchouts, and Next Steps. Respond in plain language, not JSON.',
  'How ready am I?': 'Based on my recent workouts and nutrition, tell me how ready I am for a harder training day today. Use markdown headings for Readiness, Why, and Recommendation. Respond in plain language, not JSON.',
  'Nutrition Advice': 'Give me personalized nutrition advice based on my recent habits. Use markdown headings for Priority Focus, What to Keep, and What to Adjust. Respond in plain language, not JSON.',
  'Form Tips': 'Give me practical form tips for safer, more effective workouts. Use markdown headings for Setup, Common Mistakes, and Coaching Cues. Respond in plain language, not JSON.',
};

export const resolveAssistantActionPrompt = (text) => ACTION_PROMPT_MAP[text] || text;

export const isGenericBackendFallback = (content) =>
  typeof content === 'string' && content.trim().includes(GENERIC_BACKEND_FALLBACK_MESSAGE.slice(0, 36));

const pickTailoredOpening = (message, context) => {
  const normalized = (message || '').trim().toLowerCase();
  const userName = context?.userName || 'there';
  const workoutCount = Array.isArray(context?.recentWorkouts) ? context.recentWorkouts.length : 0;
  const dietCount = Array.isArray(context?.recentDiets) ? context.recentDiets.length : 0;

  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/.test(normalized)) {
    return `Hey ${userName}! I can help with training, nutrition, recovery, or reviewing your progress.`;
  }

  if (/(build|gain|add) muscle|muscle gain|get stronger|strength/.test(normalized)) {
    return `To build muscle, focus on progressive overload, 3-5 strength sessions a week, enough protein, and solid recovery.`;
  }

  if (/(lose fat|fat loss|weight loss|cutting|lean down|drop weight)/.test(normalized)) {
    return `For fat loss, keep protein high, stay consistent with training, and aim for a calorie deficit you can sustain.`;
  }

  if (/(recover|rest|sore|fatigued|tired|burnt out)/.test(normalized)) {
    return `If recovery is the goal, reduce intensity for a day, sleep a little more, and keep the next session lighter.`;
  }

  if (workoutCount > 0 || dietCount > 0) {
    return `Based on your recent activity, I can tailor this to the ${workoutCount} workouts and ${dietCount} nutrition logs you’ve already tracked.`;
  }

  return `I can help you build a training plan, review nutrition, or answer fitness questions in a more specific way.`;
};

export const buildConversationalFallbackResponse = (message, context = {}) => {
  const opening = pickTailoredOpening(message, context);
  const normalized = (message || '').trim().toLowerCase();

  let followUp = 'Tell me your main goal and how many days you want to train each week, and I’ll shape the next step.';
  if (/(build|gain|add) muscle|muscle gain|get stronger|strength/.test(normalized)) {
    followUp = 'If you want, I can turn that into a weekly split or a full-body plan next.';
  } else if (/(lose fat|fat loss|weight loss|cutting|lean down|drop weight)/.test(normalized)) {
    followUp = 'If you want, I can also help with meal timing and calorie targets.';
  } else if (/^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/.test(normalized)) {
    followUp = 'If you want a jump start, ask me for a weekly plan, meal plan, or readiness check.';
  }

  return {
    content: `${opening} ${followUp}`,
    suggestions: DEFAULT_SUGGESTIONS,
  };
};

export const createUserMessage = (text) => ({
  id: `user-${Date.now()}`,
  type: 'user',
  content: text.replace(/\s*\[\[RETURN_JSON_WORKOUT_PLAN\]\]\s*/i, '').trim(),
  timestamp: new Date(),
});

export const createAIMessage = (content, suggestions) => ({
  id: `ai-${Date.now()}`,
  type: 'ai',
  content,
  suggestions,
  timestamp: new Date(),
});

export const createErrorMessage = () => ({
  id: `error-${Date.now()}`,
  type: 'ai',
  content: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🤖",
  timestamp: new Date(),
});

export const formatWorkoutsAsMarkdown = (workouts = []) => {
  if (!Array.isArray(workouts) || workouts.length === 0) {
    return 'I generated a plan, but there were no workouts to display.';
  }

  const sections = workouts.map((workout, index) => {
    const heading = workout.title || `Workout ${index + 1}`;
    const focus = Array.isArray(workout.focusAreas) && workout.focusAreas.length > 0
      ? `Focus: ${workout.focusAreas.join(', ')}`
      : 'Focus: General fitness';
    const exercises = Array.isArray(workout.exercises) && workout.exercises.length > 0
      ? workout.exercises
          .slice(0, 5)
          .map((exercise) => {
            const details = [];
            if (exercise.sets && exercise.reps) details.push(`${exercise.sets} x ${exercise.reps}`);
            if (exercise.interval) details.push(`${exercise.interval}`);
            return `- ${exercise.name}${details.length ? ` (${details.join(', ')})` : ''}`;
          })
          .join('\n')
      : '- Personalized exercise details available in the plan card';

    return `## ${heading}
${focus}

${workout.description || 'A personalized training block based on your recent activity.'}

### Key exercises
${exercises}`;
  });

  return `# Your Weekly Plan
I created a personalized weekly training plan and saved it to your AI Generated Plans section.

${sections.join('\n\n')}`;
};

export const createSuccessMessage = (workouts = []) => ({
  id: `success-${Date.now()}`,
  type: 'ai',
  content: formatWorkoutsAsMarkdown(workouts),
  timestamp: new Date(),
});

export const createPlanFormattingMessage = () => ({
  id: `plan-format-${Date.now()}`,
  type: 'ai',
  content: 'I generated a weekly plan, but I had to fall back to the plain-text version this time. The plan details are still shown below.',
  timestamp: new Date(),
});
