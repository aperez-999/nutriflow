import EntryRow from '../../components/EntryRow';
import { formatDayKey, toDayKey } from '../../../../utils/dateUtils';

const WorkoutCard = ({ workout, onEdit, onDelete }) => {
  const date = formatDayKey(toDayKey(workout.date), { month: 'short', day: 'numeric' });
  const details = [workout.type, workout.intensity && `${workout.intensity.toLowerCase()} intensity`, date].filter(Boolean);
  const calories = Number(workout.caloriesBurned) || 0;

  return (
    <EntryRow
      title={workout.workoutName || workout.type || 'Workout'}
      meta={details.join(', ')}
      primary={`${Number(workout.duration) || 0} min`}
      secondary={calories > 0 ? `${Math.round(calories).toLocaleString()} kcal` : null}
      notes={workout.notes}
      onEdit={() => onEdit(workout)}
      onDelete={() => onDelete(workout._id)}
    />
  );
};

export default WorkoutCard;
