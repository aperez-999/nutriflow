import EntryRow from '../../components/EntryRow';
import { formatDayKey, toDayKey } from '../../../../utils/dateUtils';

const DietCard = ({ diet, onEdit, onDelete }) => {
  const date = formatDayKey(toDayKey(diet.date), { month: 'short', day: 'numeric' });
  const protein = Number(diet.protein) || 0;

  return (
    <EntryRow
      title={diet.foodName || 'Meal'}
      meta={`${diet.mealType || 'Meal'}, ${date}`}
      primary={`${Math.round(Number(diet.calories) || 0).toLocaleString()} kcal`}
      secondary={protein > 0 ? `${Math.round(protein)} g protein` : null}
      notes={diet.notes}
      onEdit={() => onEdit(diet)}
      onDelete={() => onDelete(diet._id)}
    />
  );
};

export default DietCard;
