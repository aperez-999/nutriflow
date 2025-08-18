import React, { useState } from 'react';
import {
  VStack,
  Box,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiAward, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  DailySummaryCard,
  WorkoutForm,
  WorkoutCard,
} from './components';

const MotionBox = motion(Box);

const initialFormState = {
  date: new Date().toISOString().split('T')[0],
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (formattedData) => {
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
  };

  const handleEdit = (workout) => {
    setIsEditing(true);
    setEditingId(workout._id);
    setFormData({
      date: workout.date.split('T')[0],
      type: workout.type || '',
      workoutName: workout.workoutName || workout.type || '',
      duration: workout.duration?.toString() || '',
      caloriesBurned: workout.caloriesBurned?.toString() || '',
      intensity: workout.intensity || '',
      equipment: workout.equipment || '',
      notes: workout.notes || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <VStack spacing={6} align="stretch">
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
          p={6} 
          bg={bgColor} 
          borderRadius="xl" 
          borderWidth="1px" 
          borderColor={borderColor}
          boxShadow="lg"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md" color={textColor} textAlign="center" display="flex" alignItems="center" justifyContent="center" gap={2}>
              <Box as={FiAward} />
              Your Workout Records
            </Heading>
            
            {workouts.length === 0 ? (
              <VStack spacing={4} py={8}>
                <Box as={FiActivity} size="48px" color={subTextColor} />
                <Text fontSize="lg" color={subTextColor} textAlign="center">
                  No workout records found
                </Text>
                <Text fontSize="sm" color={subTextColor} textAlign="center">
                  Start by adding your first workout above!
                </Text>
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {workouts
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 6) // Show only recent 6 records
                  .map((workout) => (
                    <WorkoutCard
                      key={workout._id}
                      workout={workout}
                      onEdit={handleEdit}
                      onDelete={onDeleteWorkout}
                    />
                  ))}
              </SimpleGrid>
            )}
            
            {workouts.length > 6 && (
              <Text fontSize="sm" color={subTextColor} textAlign="center" mt={4}>
                Showing 6 most recent records. Total: {workouts.length} records.
              </Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </MotionBox>
  );
}

export default WorkoutSection;
