import AIInsightsSection from './AIInsightsSection';

/**
 * The Coach page's insights block, under its own section heading.
 */
export default function FitnessHubInsightsSection({ insights = [], onAsk }) {
  return <AIInsightsSection insights={insights} onAsk={onAsk} />;
}
