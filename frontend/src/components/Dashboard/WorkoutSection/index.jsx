import { useState, useMemo, useCallback } from 'react';
import {
  VStack,
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiAward, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  DailySummaryCard,
  WorkoutForm,
  WorkoutCard,
} from './components';
import { getTodayDayKey, toDayKey } from '../../../utils/dateUtils';

const MotionBox = motion(Box);

const initialFormState = {
  date: getTodayDayKey(),
  type: '',
  workoutName: '',
  duration: '',
  caloriesBurned: '',
  intensity: '',
  equipment: '',
  notes: ''
};

function WorkoutSection({ workouts, onAddWorkout, onUpdateWorkout, onDeleteWorkout }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDayKey());

  const handleSubmit = useCallback(async (formattedData) => {
    try {
      if (isEditing) {
        await onUpdateWorkout(editingId, formattedData);
        setIsEditing(false);
        setEditingId(null);
      } else {
        await onAddWorkout(formattedData);
      }
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error in workout operation:', error);
    }
  }, [editingId, isEditing, onAddWorkout, onUpdateWorkout]);

  const handleEdit = useCallback((workout) => {
    setIsEditing(true);
    setEditingId(workout._id);
    setFormData({
      date: toDayKey(workout.date),
      type: workout.type || '',
      workoutName: workout.workoutName || workout.type || '',
      duration: workout.duration?.toString() || '',
      caloriesBurned: workout.caloriesBurned?.toString() || '',
      intensity: workout.intensity || '',
      equipment: workout.equipment || '',
      notes: workout.notes || ''
    });
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
  }, []);

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const recentWorkouts = useMemo(
    () => [...(Array.isArray(workouts) ? workouts : [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6),
    [workouts]
  );

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      h="100%"
    >
      <VStack spacing={6} align="stretch" h="100%">
        <DailySummaryCard
          workouts={workouts}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        <WorkoutForm
          isEditing={isEditing}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={formData}
        />

        {/* Workout Records Section */}
        <Box
          p={{ base: 5, md: 6 }}
          bg={bgColor}
          borderRadius="2xl"
          borderWidth="1px" 
          borderColor={borderColor}
          boxShadow="lg"
          flex="1"
          display="flex"
          minH={{ base: '300px', xl: '360px' }}
        >
          <VStack spacing={4} align="stretch" h="100%" w="100%">
            <HStack justify="space-between" align={{ base: 'start', md: 'center' }} flexWrap="wrap" gap={3}>
              <Box>
                <Heading size="md" color={textColor} display="flex" alignItems="center" gap={2}>
                  <Box as={FiAward} />
                  Training Log
                </Heading>
                <Text fontSize="sm" color={subTextColor} mt={1}>
                  Recent sessions with clearer performance and burn details.
                </Text>
              </Box>
              <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                {workouts.length} total record{workouts.length === 1 ? '' : 's'}
              </Badge>
            </HStack>
            
            {recentWorkouts.length === 0 ? (
              <VStack spacing={4} py={8} px={2} align="center" justify="center" flex="1">
                <Box as={FiActivity} boxSize="48px" color={subTextColor} />
                <Text fontSize="lg" color={textColor} textAlign="center" fontWeight="medium">
                  No workout records yet
                </Text>
                <Text fontSize="sm" color={subTextColor} textAlign="center" maxW="320px">
                  Add your first workout to start building your fitness streak.
                </Text>
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} alignItems="stretch">
                {recentWorkouts.map((workout) => (
                    <WorkoutCard
                      key={workout._id}
                      workout={workout}
                      onEdit={handleEdit}
                      onDelete={onDeleteWorkout}
                    />
                ))}
              </SimpleGrid>
            )}
            
            {recentWorkouts.length > 0 && workouts.length > 6 && (
              <Text fontSize="sm" color={subTextColor} textAlign="center" mt={4}>
                Showing the 6 most recent workout records.
              </Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </MotionBox>
  );
}

export default WorkoutSection;
