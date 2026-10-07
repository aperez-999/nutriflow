import { useMemo } from 'react';
import DaySummaryLabel from '../../components/DaySummaryLabel';
import { calculateCaloriesPerMinute, getDailyTotals } from '../utils/workoutUtils';

const DailySummaryCard = ({ workouts, selectedDate, setSelectedDate }) => {
  const totals = useMemo(() => getDailyTotals(workouts, selectedDate), [selectedDate, workouts]);

  return (
    <DaySummaryLabel
      title="Train"
      flow="train"
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      headline={{ label: 'Minutes', value: Math.round(totals.duration) }}
      rows={[
        { label: 'Sessions', value: totals.count },
        { label: 'Calories burned', value: Math.round(totals.caloriesBurned), unit: 'kcal' },
        { label: 'Burn rate', value: calculateCaloriesPerMinute(totals.caloriesBurned, totals.duration), unit: 'kcal/min' },
      ]}
    />
  );
};

export default DailySummaryCard;
