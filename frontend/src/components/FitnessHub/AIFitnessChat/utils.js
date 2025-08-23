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
      .replace(/(\"reps\"\s*:\s*)(\d+)\s*-\s*(\d+)/g, '$1\"$2-$3\"')
      // Handle en-dash ranges
      .replace(/(\"reps\"\s*:\s*)(\d+)\s*[-\u2013\u2014]\s*(\d+)/g, '$1\"$2-$3\"')
      // Quote any bare reps value (e.g., 30-60 seconds)
      .replace(/(\"reps\"\s*:\s*)(?!\")(.*?)(?=,|[}\]])/g, (m, p1, p2) => p1 + '\"' + String(p2).trim().replace(/\"/g, '\\\"') + '\"')
      // Quote calories ranges like 250-300
      .replace(/(\"calories\"\s*:\s*)(\d+)\s*[-\u2013\u2014]\s*(\d+)/g, '$1\"$2-$3\"')
      // Quote difficulty fractions like 6/10
      .replace(/(\"difficulty\"\s*:\s*)(\d+)\s*\/\s*(\d+)/g, '$1\"$2/$3\"')
      // Ensure N/A is quoted
      .replace(/(\"difficulty\"\s*:\s*)(N\/A)/gi, '$1\"N/A\"');

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
      return m ? m[1] : str;
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
        videoId: extractYouTubeId(w.videoId),
        description: (typeof w.description === 'string' && w.description.trim())
          ? w.description.trim()
          : (focusAreas.length ? `Focus: ${focusAreas.join(', ')}` : 'AI-generated workout plan'),
        calories: (typeof w.calories === 'string' || typeof w.calories === 'number') ? String(w.calories) : '300-400',
        difficulty: typeof w.difficulty === 'string' ? w.difficulty : 'Intermediate',
      };
    });
  } catch (error) {
    console.log('Could not parse AI recommendations:', error);
    return false;
  }
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

export const createSuccessMessage = () => ({
  id: `success-${Date.now()}`,
  type: 'ai',
  content: '✅ **Workout Plan Generated!** I\'ve created a personalized fitness plan for you. Scroll down to view the workout cards.',
  timestamp: new Date(),
});
