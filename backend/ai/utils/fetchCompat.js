/**
 * HTTP for the AI layer: the built-in fetch (Node 18+) with an optional `timeoutMs`,
 * so Groq/Ollama calls never hang a serverless function.
 */
export async function fetchCompat(input, init = {}) {
  const { timeoutMs, ...restInit } = init || {};
  if (!timeoutMs) {
    return fetch(input, restInit);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);

  try {
    return await fetch(input, { ...restInit, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
