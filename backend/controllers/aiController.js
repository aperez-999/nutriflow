import { orchestrateAI } from '../ai/orchestrator/orchestrate.js';
import { DEFAULT_GROQ_MODEL, selectProvider } from '../ai/config/aiProvider.js';

/** POST /api/ai/chat: hands the message to the AI orchestration layer. */
export const chatWithCoach = async (req, res) => {
  try {
    const { message, context, history = [] } = req.body || {};
    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Only a verified token may select whose data the agents read; never trust a client-sent userId.
    const safeContext = { ...context, userId: req.user ? String(req.user._id) : undefined };
    const result = await orchestrateAI({ message, context: safeContext, history });
    return res.status(200).json(result);
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ message: 'Error generating AI response' });
  }
};

/** GET /api/health: which AI provider and model answer; more detail outside production. */
export const getHealth = (req, res) => {
  const provider = selectProvider();
  const model = provider === 'groq'
    ? process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL
    : process.env.OLLAMA_MODEL || 'llama3:latest';
  const payload = { ok: true, provider, model };

  if (process.env.NODE_ENV !== 'production') {
    payload.env = process.env.NODE_ENV || 'development';
    payload.baseUrl = provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : `${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/chat`;
  }

  res.json(payload);
};
