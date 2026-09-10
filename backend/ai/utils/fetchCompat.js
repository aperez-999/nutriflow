/**
 * Fetch compatibility for the AI layer.
 * Uses globalThis.fetch when available (Node 18+), otherwise node-fetch.
 * Keeps HTTP calls for Groq/Ollama in one place without duplicating app-level logic.
 */

let _fetch = globalThis.fetch;

export async function fetchCompat(input, init = {}) {
  if (!_fetch) {
    const mod = await import('node-fetch');
    _fetch = mod.default;
  }

  const { timeoutMs, ...restInit } = init || {};
  if (!timeoutMs || typeof AbortController === 'undefined') {
    return _fetch(input, restInit);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);

  try {
    return await _fetch(input, {
      ...restInit,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}
