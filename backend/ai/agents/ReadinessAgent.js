import { get_user_stats } from '../tools/get_user_stats.js';
import { calculateReadinessScore } from '../../../shared/readinessScore.js';

function formatHoursLabel(hours) {
  if (hours === null || hours === undefined) return 'No recent workout logged';
  if (hours < 1) return 'Last workout logged less than 1 hour ago';
  if (hours < 24) return `Last workout logged ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `Last workout logged ${days} day${days === 1 ? '' : 's'} ago`;
}

function buildReadinessResponse({ score, level, shortRecommendation, recommendations, factors }) {
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  const lines = [
    `Daily Readiness Score: ${score}/100 (${label})`,
    '',
    shortRecommendation,
    '',
    `Why: ${factors.workoutsLast7Days} workout${factors.workoutsLast7Days === 1 ? '' : 's'} in the last 7 days, ${factors.todayMeals} meal log${factors.todayMeals === 1 ? '' : 's'} today, about ${factors.averageCalories || 0} average calories/day over your recent logged days, and a ${factors.loggingStreak}-day logging streak.`,
    formatHoursLabel(factors.latestWorkoutHours),
  ];

  if (recommendations.length > 0) {
    lines.push('', 'Recommended next step:');
    recommendations.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`);
    });
  }

  return lines.join('\n');
}

export async function runReadinessAgent({ context = {} }) {
  let stats = {
    recentWorkouts: context.recentWorkouts || [],
    recentDiets: context.recentDiets || [],
    userName: context.userName || 'User',
  };

  if (context.userId) {
    try {
      stats = await get_user_stats(context.userId);
    } catch (err) {
      console.error('ReadinessAgent get_user_stats error:', err);
    }
  }

  const readiness = calculateReadinessScore({
    workouts: stats.recentWorkouts,
    diets: stats.recentDiets,
    checkIn: stats.latestCheckIn || context.checkIn || null,
  });

  return {
    content: buildReadinessResponse(readiness),
    source: 'readiness',
    type: 'readiness',
    readiness,
  };
}
