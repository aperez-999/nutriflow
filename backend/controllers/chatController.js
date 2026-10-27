import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';

const MAX_HISTORY_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 4000;

export function sanitizeChatMessage(message) {
  if (!message || typeof message !== 'object') {
    return null;
  }

  const content = typeof message.content === 'string' ? message.content.trim() : '';
  if (!content) {
    return null;
  }

  const role = message.role === 'user' || message.role === 'assistant'
    ? message.role
    : message.type === 'user' || message.type === 'assistant'
      ? message.type
      : null;

  if (!role) {
    return null;
  }

  return {
    role,
    content: content.slice(0, MAX_MESSAGE_LENGTH),
  };
}

function sanitizeChatHistory(messages) {
  if (!Array.isArray(messages)) {
    return null;
  }

  return messages
    .map(sanitizeChatMessage)
    .filter(Boolean)
    .slice(0, MAX_HISTORY_MESSAGES);
}

/** POST /api/chat/history: replaces the saved conversation. */
export const saveHistory = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length > MAX_HISTORY_MESSAGES) {
      return res.status(400).json({ message: 'messages must be an array with at most 100 entries' });
    }

    const sanitizedMessages = sanitizeChatHistory(messages);
    const invalidCount = messages.length - sanitizedMessages.length;

    const userId = req.user._id;
    // Replace strategy: clear existing history and insert the new one
    await ChatMessage.deleteMany({ user: userId });
    if (sanitizedMessages.length > 0) {
      const docs = sanitizedMessages.map((m) => ({
        user: userId,
        role: m.role,
        content: m.content,
      }));
      await ChatMessage.insertMany(docs);
    }

    if (invalidCount > 0) {
      console.warn(`Ignored ${invalidCount} invalid chat history entr${invalidCount === 1 ? 'y' : 'ies'} for user ${userId}`);
    }

    res.json({
      success: true,
      saved: sanitizedMessages.length,
      ignored: invalidCount,
    });
  } catch (err) {
    console.error('Save history error:', err);
    res.status(500).json({ message: 'Failed to save history' });
  }
};

/** GET /api/chat/history?limit=40: the latest messages, oldest first. */
export const getHistory = async (req, res) => {
  try {
    const parsedLimit = parseInt(req.query.limit || '40', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), MAX_HISTORY_MESSAGES) : 40;
    // insertMany gives a saved conversation one shared createdAt; _id keeps insert order on ties.
    const messages = await ChatMessage.find({ user: req.user._id }).sort({ createdAt: -1, _id: -1 }).limit(limit);
    res.json(messages.reverse());
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ message: 'Failed to load history' });
  }
};

/** DELETE /api/chat/history */
export const clearHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    console.error('Clear history error:', err);
    res.status(500).json({ message: 'Failed to clear history' });
  }
};

const MAX_CONVERSATIONS = 50;
const MAX_SUGGESTIONS = 8;

/** A stored conversation message: role and content as for history, plus its follow-ups and time. */
export function sanitizeConversationMessage(message) {
  const base = sanitizeChatMessage(message);
  if (!base) return null;
  const suggestions = Array.isArray(message.suggestions)
    ? message.suggestions.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim().slice(0, 120)).slice(0, MAX_SUGGESTIONS)
    : [];
  const createdAt = Date.parse(message.createdAt);
  return {
    ...base,
    ...(suggestions.length && { suggestions }),
    createdAt: Number.isNaN(createdAt) ? new Date() : new Date(createdAt),
  };
}

const toClientConversation = (conversation) => ({
  id: conversation.clientId,
  title: conversation.title,
  updatedAt: new Date(conversation.updatedAt).toISOString(),
  messages: conversation.messages.map((m) => ({
    role: m.role,
    content: m.content,
    ...(m.suggestions?.length && { suggestions: m.suggestions }),
    createdAt: new Date(m.createdAt).toISOString(),
  })),
});

/** GET /api/chat/conversations: the latest conversations, most recent first. */
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(MAX_CONVERSATIONS).lean();
    res.json({ conversations: conversations.map(toClientConversation) });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ message: 'Failed to load conversations' });
  }
};

/** PUT /api/chat/conversations/:clientId: creates or replaces one conversation. */
export const saveConversation = async (req, res) => {
  try {
    const { title, updatedAt, messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0 || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'A conversation needs a title and at least one message' });
    }
    const clean = messages.map(sanitizeConversationMessage).filter(Boolean).slice(-MAX_HISTORY_MESSAGES);
    if (clean.length === 0) {
      return res.status(400).json({ message: 'A conversation needs at least one message' });
    }
    const at = Date.parse(updatedAt);
    const conversation = await Conversation.findOneAndUpdate(
      { user: req.user._id, clientId: req.params.clientId },
      { title: title.trim().slice(0, 120), updatedAt: Number.isNaN(at) ? new Date() : new Date(at), messages: clean },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    res.json(toClientConversation(conversation));
  } catch (err) {
    console.error('Save conversation error:', err);
    res.status(500).json({ message: 'Failed to save the conversation' });
  }
};

/** DELETE /api/chat/conversations/:clientId */
export const deleteConversation = async (req, res) => {
  try {
    await Conversation.deleteOne({ user: req.user._id, clientId: req.params.clientId });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete conversation error:', err);
    res.status(500).json({ message: 'Failed to delete the conversation' });
  }
};
