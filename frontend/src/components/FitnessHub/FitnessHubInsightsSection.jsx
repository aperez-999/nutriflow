import React from 'react';
import AIInsightsSection from './AIInsightsSection';

/**
 * Fitness Hub — AI Insights block (wrapper for consistent section naming).
 */
export default function FitnessHubInsightsSection({ insights = [] }) {
  return <AIInsightsSection insights={insights} />;
}
