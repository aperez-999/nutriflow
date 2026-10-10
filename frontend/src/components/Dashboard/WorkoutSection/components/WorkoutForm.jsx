import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import WorkoutSearchInput from '../../../Workout/WorkoutSearchInput';

const WORKOUT_TYPES = ['Strength', 'Cardio', 'Flexibility', 'Sports', 'Other'];
const INTENSITIES = ['Low', 'Medium', 'High'];
// Used when a custom (non-searched) workout has a duration but no burn rate.
const DEFAULT_KCAL_PER_MINUTE = 8;

/** Segmented single choice with radio semantics. */
function ChoiceGroup({ id, label, options, value, onChange }) {
  return (
    <ButtonGroup role="radiogroup" aria-labelledby={id} isAttached size="sm" w="100%" variant="outline">
      {options.map((option) => {
        const selected = value === option;
        return (
          <Button
            key={option}
            flex="1"
            px={2}
            role="radio"
            aria-checked={selected}
            aria-label={`${label}: ${option}`}
            onClick={() => onChange(option)}
            bg={selected ? 'fg' : 'bg.surface'}
            color={selected ? 'bg.surface' : 'fg'}
            borderColor={selected ? 'fg' : 'border'}
            _hover={{ bg: selected ? 'fg' : 'bg.muted' }}
          >
            {option}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}

const WorkoutForm = ({ isEditing, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    setFormData(initialData);
    setSelectedWorkout(null);
  }, [initialData]);

  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));
  const handleInputChange = (e) => setField(e.target.name, e.target.value);

  const handleWorkoutSelect = (workout) => {
    setSelectedWorkout(workout);
    setFormData((prev) => {
      const duration = Number(prev.duration) || 0;
      return {
        ...prev,
        workoutName: workout.name,
        type: workout.type,
        intensity: workout.intensity || prev.intensity,
        equipment: workout.equipment === 'None' ? '' : workout.equipment,
        caloriesBurned: duration
          ? Math.round(workout.caloriesPerMinute * duration).toString()
          : workout.caloriesPerMinute.toString(),
      };
    });
  };

  const handleWorkoutNameChange = (value) => {
    setField('workoutName', value);
    if (selectedWorkout && value !== selectedWorkout.name) {
      setSelectedWorkout(null);
    }
  };

  const handleDurationChange = (e) => {
    const duration = e.target.value;
    setFormData((prev) => {
      const nextData = { ...prev, duration };
      if (selectedWorkout && duration) {
        nextData.caloriesBurned = Math.round(selectedWorkout.caloriesPerMinute * Number(duration)).toString();
      } else if (prev.workoutName && duration && !selectedWorkout) {
        nextData.caloriesBurned = Math.round(Number(duration) * DEFAULT_KCAL_PER_MINUTE).toString();
      }
      return nextData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      duration: Number(formData.duration),
      caloriesBurned: Number(formData.caloriesBurned),
    });
  };

  const canSubmit = Boolean(formData.type && formData.duration !== '' && Number(formData.duration) > 0);

  return (
    <Box>

      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Exercise</FormLabel>
            <WorkoutSearchInput
              value={formData.workoutName}
              onChange={handleWorkoutNameChange}
              onWorkoutSelect={handleWorkoutSelect}
              placeholder="Search exercises, or type your own"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel id="workout-type-label">Type</FormLabel>
            <ChoiceGroup id="workout-type-label" label="Type" options={WORKOUT_TYPES} value={formData.type} onChange={(v) => setField('type', v)} />
          </FormControl>

          <SimpleGrid columns={2} spacing={3}>
            <FormControl isRequired>
              <FormLabel>Duration</FormLabel>
              <InputGroup>
                <Input type="number" inputMode="numeric" min={1} name="duration" value={formData.duration} onChange={handleDurationChange} placeholder="0" pr={12} />
                <InputRightElement pointerEvents="none" color="fg.muted" fontSize="sm" w={12}>min</InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl>
              <FormLabel>Calories burned</FormLabel>
              <InputGroup>
                <Input type="number" inputMode="numeric" min={0} name="caloriesBurned" value={formData.caloriesBurned} onChange={handleInputChange} placeholder="0" pr={12} />
                <InputRightElement pointerEvents="none" color="fg.muted" fontSize="sm" w={12}>kcal</InputRightElement>
              </InputGroup>
              {selectedWorkout && <FormHelperText color="fg.muted">Estimated from the exercise and duration.</FormHelperText>}
            </FormControl>
          </SimpleGrid>

          <FormControl>
            <FormLabel id="intensity-label">Intensity</FormLabel>
            <ChoiceGroup id="intensity-label" label="Intensity" options={INTENSITIES} value={formData.intensity} onChange={(v) => setField('intensity', v)} />
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <FormControl isRequired>
              <FormLabel>Date</FormLabel>
              <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Equipment</FormLabel>
              <Input name="equipment" value={formData.equipment} onChange={handleInputChange} placeholder="Barbell, bike, none" />
            </FormControl>
          </SimpleGrid>

          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Sets, pace, how it felt"
              rows={2}
              resize="vertical"
            />
          </FormControl>

          <HStack spacing={2} justify="flex-end">
            {isEditing && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
            <Button type="submit" isDisabled={!canSubmit} flex={{ base: 1, md: 'none' }} minW={{ md: '160px' }}>
              {isEditing ? 'Save changes' : 'Log workout'}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default WorkoutForm;
