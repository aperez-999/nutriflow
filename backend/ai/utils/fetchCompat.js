/**
 * Fetch compatibility for the AI layer.
 * Uses globalThis.fetch when available (Node 18+), otherwise node-fetch.
 * Keeps HTTP calls for Groq/Ollama in one place without duplicating app-level logic.
 */

let _fetch = globalThis.fetch;

export async function fetchCompat(...args) {
  if (!_fetch) {
    const mod = await import('node-fetch');
    _fetch = mod.default;
  }
  return _fetch(...args);
}
