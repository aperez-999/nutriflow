/**
 * aiProvider — central AI provider configuration.
 *
 * This module is responsible for:
 * - Choosing provider (Groq in production, Ollama in development)
 * - Model selection
 * - Temperature and request formatting
 * - Making the HTTP call via fetchCompat
 *
 * Agents should NOT talk directly to Groq/Ollama HTTP APIs. Instead they call
 * generateChatCompletion(messages, options) and receive { content, provider }.
 */

import { fetchCompat } from '../utils/fetchCompat.js';

/**
 * @typedef {{ role: 'system'|'user'|'assistant', content: string }} ChatMessage
 */

/**
 * Returns the active provider id: 'groq' in production, 'ollama' otherwise.
 */
export function selectProvider() {
  return process.env.NODE_ENV === 'production' ? 'groq' : 'ollama';
}

/**
 * Generates a chat completion using the configured provider.
 *
 * @param {ChatMessage[]} messages
 * @param {{ temperature?: number }} [options]
 * @returns {Promise<{ content: string, provider: 'groq'|'ollama' }>}
 */
export async function generateChatCompletion(messages, options = {}) {
  const provider = selectProvider();
  const temperature = typeof options.temperature === 'number' ? options.temperature : 0.7;

  if (provider === 'groq') {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Missing GROQ_API_KEY');
    }

    const response = await fetchCompat('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama3-8b-8192',
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq error ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || '';
    return { content, provider: 'groq' };
  }

  // Ollama (development / fallback)
  const base = process.env.OLLAMA_URL || 'http://localhost:11434';
  const response = await fetchCompat(`${base.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'llama3:latest',
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error ${response.status}`);
  }

  const data = await response.json();
  const content = data?.message?.content?.trim() || '';
  return { content, provider: 'ollama' };
}

