import { useMemo } from 'react';
import DaySummaryLabel from '../../components/DaySummaryLabel';
import { getDailyTotals } from '../utils/dietUtils';

const DailySummaryCard = ({ diets, selectedDate, setSelectedDate }) => {
  const totals = useMemo(() => getDailyTotals(diets, selectedDate), [diets, selectedDate]);

  return (
    <DaySummaryLabel
      title="Fuel"
      flow="fuel"
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      headline={{ label: 'Calories', value: Math.round(totals.calories) }}
      rows={[
        { label: 'Protein', value: Math.round(totals.protein), unit: 'g' },
        { label: 'Carbohydrate', value: Math.round(totals.carbs), unit: 'g' },
        { label: 'Fat', value: Math.round(totals.fats), unit: 'g' },
        { label: 'Meals logged', value: totals.count },
      ]}
    />
  );
};

export default DailySummaryCard;
