/**
 * Format insights agent result as chat-ready text.
 * Used by the orchestrator so the API returns { content, suggestions, source }
 * with content as plain text.
 */

/**
 * @param {{ type: string, insights?: string[] }} result
 * @returns {string}
 */
export function formatInsightsForChat(result) {
  if (!result || result.type !== 'insights' || !Array.isArray(result.insights)) {
    return result?.rawContent || 'No insights available yet. Log workouts and meals to get personalized insights.';
  }
  if (result.insights.length === 0) {
    return result.rawContent || 'Keep logging to receive insights.';
  }
  const lines = ['AI Insights', ''];
  for (const text of result.insights) {
    const t = String(text).trim();
    if (t) lines.push(`• ${t}`);
  }
  return lines.join('\n\n');
}
