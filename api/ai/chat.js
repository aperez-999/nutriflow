import { handleCors } from '../_lib/middleware.js';

export default async function handler(req, res) {
  // Handle CORS
  handleCors(req, res, () => {});

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, context, history = [] } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Heuristic intent detection to pick suggestions
    const categorize = (text) => {
      const m = text.toLowerCase();
      if (m.includes('workout') || m.includes('exercise') || m.includes('train')) return 'workout';
      if (m.includes('form') || m.includes('technique') || m.includes('how to')) return 'form';
      if (m.includes('progress') || m.includes('analyze') || m.includes('track')) return 'progress';
      if (m.includes('plan') || m.includes('schedule') || m.includes('week')) return 'plan';
      return 'default';
    };

    // Build detailed context summary from provided arrays
    const formatDate = (d) => {
      try { return new Date(d).toISOString().split('T')[0]; } catch { return String(d); }
    };
    const workoutsSummary = (context?.recentWorkouts || [])
      .slice(-5)
      .map(w => `- ${formatDate(w.date)} • ${w.workoutName || w.type || 'Workout'} • ${w.duration || '?'} min • ${w.intensity || ''} • ${w.caloriesBurned || 0} kcal`)
      .join('\n');
    const dietsSummary = (context?.recentDiets || [])
      .slice(-5)
      .map(d => `- ${formatDate(d.date)} • ${d.mealType || ''}: ${d.foodName || ''} • ${d.calories || 0} kcal (P${d.protein || 0}/C${d.carbs || 0}/F${d.fats || 0})`)
      .join('\n');

    const ctxSummary = `Context Summary\nUser: ${context?.userName || 'User'}\nRecent Workouts:\n${workoutsSummary || '- none'}\nRecent Diet Entries:\n${dietsSummary || '- none'}`;

    // Build system prompt
    const systemPrompt = `You are an AI Fitness Coach.

Style:
- Friendly, motivational, and clear.
- Use emojis sparingly to highlight key points (💪 🧠 🥗 🕒 ✅).
- Use markdown for structure: headings, bold, lists when helpful.
- Offer scalable options (easier/harder) and equipment/time variants.
- Include brief safety notes when relevant (no diagnoses).

Behavior:
- Ask clarifying questions if needed.
- Personalize using the context summary.
- Avoid generic advice; be specific and actionable.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: ctxSummary },
      ...history.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content })),
      { role: 'user', content: message },
    ];

    // If the user asks for a workout plan/recommendations, enforce JSON array schema via system instruction
    const isPlanRequest = /\[\[RETURN_JSON_WORKOUT_PLAN\]\]/i.test(message);
    if (isPlanRequest) {
      const personalization = `Use the user's recent workouts and diet entries to tailor the plan. Scale volume and intensity based on recent caloric intake and macros (protein/carbs/fats). For lower-carb/recovery days, prefer technique, mobility, or shorter moderate sessions; for higher-carb days, include higher volume or strength work as appropriate.`;
      const schemaInstruction = `When generating workout recommendations or a weekly plan, respond with ONLY a valid JSON array (no code fences, no prose) of workout objects with EXACT fields:\n[\n  {\n    "title": "Workout Name",\n    "duration": 45,\n    "intensity": "Medium",\n    "focusAreas": ["Upper Body", "Core"],\n    "exercises": [\n      { "name": "Exercise Name", "sets": 3, "reps": 12, "interval": null }\n    ],\n    "videoId": "youtube_video_id_here",\n    "description": "Brief workout description",\n    "calories": "300-400",\n    "difficulty": "Beginner/Intermediate/Advanced"\n  }\n]\nReturn nothing else.`;
      // Insert after context summary so it applies to this turn
      messages.splice(2, 0, { role: 'system', content: personalization });
      messages.splice(3, 0, { role: 'system', content: schemaInstruction });
    }

    const suggestionsMap = {
      workout: ['Make it harder 💥', 'Dumbbells only 🏋️', 'Shorten to 20 min 🕒', 'Add mobility 🧘'],
      form: ['Show cues 🧠', 'Common mistakes ⚠️', 'Video tips 🎥', 'Regression/Progression ➕'],
      progress: ['Analyze weekly trends 📈', 'Set new goals 🎯', 'Recovery advice 😴', 'Nutrition tips 🥗'],
      plan: ['Customize days 📅', 'Equipment options 🧰', 'Time-optimized 🕒', 'Include cardio ❤️‍🔥'],
      default: ['Workout ideas 💡', 'Nutrition tips 🥗', 'Form help 🧠', 'Make a weekly plan 📅'],
    };

    const type = categorize(message);

    const fallbackResponse = () => ({
      content: `I'm here to help with your fitness journey! 🚀\n\nI can assist you with:\n• Workout recommendations based on your goals\n• Form guidance and technique tips\n• Progress analysis and goal setting\n• Nutrition advice to fuel your workouts\n\nWhat would you like to work on today?`,
      suggestions: suggestionsMap[type],
      source: 'fallback'
    });

    try {
      // Resolve provider key from multiple possible env names
      const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY || process.env.GROQ || process.env.NEXT_PUBLIC_GROQ_API_KEY;

      // If no provider key in prod, synthesize a structured response for plan requests
      if (!groqKey) {
        if (isPlanRequest) {
          const fallbackPlan = [
            { title: 'Full Body Strength', duration: 45, intensity: 'Medium', focusAreas: ['Full Body'], exercises: [{ name: 'Squat', sets: 3, reps: 10, interval: null }, { name: 'Push-up', sets: 3, reps: 12, interval: null }, { name: 'Bent-over Row', sets: 3, reps: 10, interval: null }], videoId: null, description: 'Balanced strength session', calories: '250-350', difficulty: 'Beginner/Intermediate' },
            { title: 'Cardio Intervals', duration: 30, intensity: 'High', focusAreas: ['Cardio'], exercises: [{ name: 'Run/Bike', sets: 1, reps: null, interval: 20 }, { name: 'Walk/Easy Spin', sets: 1, reps: null, interval: 40 }], videoId: null, description: 'Interval cardio for conditioning', calories: '200-300', difficulty: 'Beginner/Intermediate' },
            { title: 'Mobility & Core', duration: 20, intensity: 'Low', focusAreas: ['Mobility', 'Core'], exercises: [{ name: 'Plank', sets: 3, reps: 30, interval: null }, { name: 'Hip Hinge Mobility', sets: 2, reps: 10, interval: null }, { name: 'Thoracic Opener', sets: 2, reps: 8, interval: null }], videoId: null, description: 'Recovery-focused mobility and core', calories: '80-150', difficulty: 'Beginner' }
          ];
          const content = JSON.stringify(fallbackPlan);
          return res.status(200).json({ content, suggestions: suggestionsMap[type], source: 'fallback-plan' });
        }
        // Non-plan requests: return a helpful fallback
        const fb = fallbackResponse();
        return res.status(200).json(fb);
      }

      // Groq API call
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${groqKey}` 
        },
        body: JSON.stringify({ 
          model: process.env.GROQ_MODEL || 'llama3-8b-8192', 
          messages, 
          temperature: 0.7 
        }),
      });

      if (!response.ok) throw new Error(`Groq error ${response.status}`);
      const data = await response.json();
      let content = data?.choices?.[0]?.message?.content?.trim() || '';

      if (isPlanRequest) {
        const isEmptyArray = /^\s*\[\s*\]\s*$/.test(content);
        const hasArray = content.includes('[') && content.includes(']');
        if (!hasArray || isEmptyArray) {
          // Server-side fallback plan to avoid empty arrays
          const fallbackPlan = [
            { title: 'Full Body Strength', duration: 45, intensity: 'Medium', focusAreas: ['Full Body'], exercises: [{ name: 'Squat', sets: 3, reps: 10, interval: null }, { name: 'Push-up', sets: 3, reps: 12, interval: null }, { name: 'Bent-over Row', sets: 3, reps: 10, interval: null }], videoId: null, description: 'Balanced strength session', calories: '250-350', difficulty: 'Beginner/Intermediate' },
            { title: 'Cardio Intervals', duration: 30, intensity: 'High', focusAreas: ['Cardio'], exercises: [{ name: 'Run/Bike', sets: 1, reps: null, interval: 20 }, { name: 'Walk/Easy Spin', sets: 1, reps: null, interval: 40 }], videoId: null, description: 'Interval cardio for conditioning', calories: '200-300', difficulty: 'Beginner/Intermediate' },
            { title: 'Mobility & Core', duration: 20, intensity: 'Low', focusAreas: ['Mobility', 'Core'], exercises: [{ name: 'Plank', sets: 3, reps: 30, interval: null }, { name: 'Hip Hinge Mobility', sets: 2, reps: 10, interval: null }, { name: 'Thoracic Opener', sets: 2, reps: 8, interval: null }], videoId: null, description: 'Recovery-focused mobility and core', calories: '80-150', difficulty: 'Beginner' }
          ];
          content = JSON.stringify(fallbackPlan);
        }
      }

      if (!content) content = fallbackResponse().content;
      return res.status(200).json({ content, suggestions: suggestionsMap[type], source: 'groq' });

    } catch (apiErr) {
      console.error('AI provider error:', apiErr);
      const fb = fallbackResponse();
      return res.status(200).json(fb);
    }
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ message: 'Error generating AI response' });
  }
}