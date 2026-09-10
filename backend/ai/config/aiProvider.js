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

const DEFAULT_GROQ_TIMEOUT_MS = 20000;
const DEFAULT_OLLAMA_TIMEOUT_MS = 45000;

function getTimeoutMs(envKey, fallback) {
  const raw = Number(process.env[envKey]);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

/**
 * @typedef {{ role: 'system'|'user'|'assistant', content: string }} ChatMessage
 */

/**
 * Returns the active provider id: 'groq' in production, 'ollama' otherwise.
 */
function isLocalOllamaUrl(url = '') {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(String(url).trim());
}

function hasGroqConfig() {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

function getExplicitProviderOverride() {
  const explicit = String(process.env.AI_PROVIDER || '').trim().toLowerCase();
  return explicit === 'ollama' || explicit === 'groq' ? explicit : null;
}

function shouldPreferLocalOllama() {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  return !process.env.VERCEL && isLocalOllamaUrl(ollamaUrl);
}

export function selectProvider() {
  const explicit = getExplicitProviderOverride();
  if (explicit) return explicit;
  if (shouldPreferLocalOllama()) return 'ollama';
  return process.env.NODE_ENV === 'production' ? 'groq' : 'ollama';
}

function getProviderAttemptOrder() {
  const explicit = getExplicitProviderOverride();
  if (explicit === 'ollama') return ['ollama'];
  if (explicit === 'groq') return ['groq'];

  if (shouldPreferLocalOllama()) {
    return hasGroqConfig() ? ['ollama', 'groq'] : ['ollama'];
  }

  if (process.env.NODE_ENV === 'production') {
    return hasGroqConfig() ? ['groq', 'ollama'] : ['ollama'];
  }

  return hasGroqConfig() ? ['ollama', 'groq'] : ['ollama'];
}

async function callGroq(messages, temperature) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY');
  }

  const response = await fetchCompat('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    timeoutMs: getTimeoutMs('GROQ_TIMEOUT_MS', DEFAULT_GROQ_TIMEOUT_MS),
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

async function callOllama(messages, temperature) {
  const base = process.env.OLLAMA_URL || 'http://localhost:11434';
  const response = await fetchCompat(`${base.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    timeoutMs: getTimeoutMs('OLLAMA_TIMEOUT_MS', DEFAULT_OLLAMA_TIMEOUT_MS),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'llama3:latest',
      messages,
      stream: false,
      temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error ${response.status}`);
  }

  const data = await response.json();
  const content = data?.message?.content?.trim() || '';
  return { content, provider: 'ollama' };
}

/**
 * Generates a chat completion using the configured provider.
 *
 * @param {ChatMessage[]} messages
 * @param {{ temperature?: number }} [options]
 * @returns {Promise<{ content: string, provider: 'groq'|'ollama' }>}
 */
export async function generateChatCompletion(messages, options = {}) {
  const temperature = typeof options.temperature === 'number' ? options.temperature : 0.7;
  const attemptOrder = getProviderAttemptOrder();
  const errors = [];

  for (const candidate of attemptOrder) {
    try {
      if (candidate === 'groq') {
        const result = await callGroq(messages, temperature);
        if (result.content) return result;
        errors.push(new Error('Groq returned an empty response'));
      } else {
        const result = await callOllama(messages, temperature);
        if (result.content) return result;
        errors.push(new Error('Ollama returned an empty response'));
      }
    } catch (error) {
      errors.push(error);
    }
  }

  throw new Error(errors.map((error) => error?.message).filter(Boolean).join(' | ') || 'All AI providers failed');
}
