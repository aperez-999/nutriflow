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
      // Ensure N/A is quoted
      .replace(/("difficulty"\s*:\s*)(N\/A)/gi, '$1"N/A"');

    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed) || parsed.length === 0) return false;

    return parsed.map(workout => ({
      title: workout.title || 'Custom Workout',
      duration: Number.isFinite(Number(workout.duration)) ? Number(workout.duration) : 45,
      intensity: workout.intensity || 'Medium',
      focusAreas: Array.isArray(workout.focusAreas) ? workout.focusAreas : ['General Fitness'],
      exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
      videoId: workout.videoId || null,
      description: workout.description || 'AI-generated workout plan',
      calories: (typeof workout.calories === 'string' || typeof workout.calories === 'number') ? String(workout.calories) : '300-400',
      difficulty: workout.difficulty || 'Intermediate'
    }));
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
