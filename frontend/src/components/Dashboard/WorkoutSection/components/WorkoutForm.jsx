import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  HStack,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { EditIcon, AddIcon, DeleteIcon, CalendarIcon, SearchIcon, TimeIcon } from '@chakra-ui/icons';
import { FiActivity, FiZap, FiTrendingUp, FiTarget, FiPackage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import WorkoutSearchInput from '../../../Workout/WorkoutSearchInput';

const WorkoutForm = ({ isEditing, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWorkoutSelect = (workout) => {
    if (workout) {
      setFormData(prev => ({
        ...prev,
        workoutName: workout.name,
        type: workout.type,
        caloriesBurned: prev.duration ? 
          (workout.caloriesPerMinute * Number(prev.duration)).toString() : 
          workout.caloriesPerMinute.toString()
      }));
    }
  };

  const handleWorkoutNameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      workoutName: value
    }));
  };

  const handleDurationChange = (e) => {
    const duration = e.target.value;
    setFormData(prev => {
      const newFormData = { ...prev, duration };
      if (prev.workoutName && duration) {
        const estimatedCalories = Math.round(duration * 8); // Average 8 cal/min
        return { ...newFormData, caloriesBurned: estimatedCalories.toString() };
      }
      return newFormData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      duration: Number(formData.duration),
      caloriesBurned: Number(formData.caloriesBurned)
    };
    onSubmit(formattedData);
  };

  return (
    <Box 
      p={6} 
      bg={bgColor} 
      borderRadius="xl" 
      borderWidth="1px" 
      borderColor={borderColor}
      boxShadow="lg"
    >
      <VStack spacing={5} align="stretch">
        <Heading size="md" color={textColor} textAlign="center" display="flex" alignItems="center" justifyContent="center" gap={2}>
          {isEditing ? <EditIcon /> : <AddIcon />}
          {isEditing ? 'Edit Workout Record' : 'Add New Workout Record'}
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            <HStack spacing={4} width="100%">
              <FormControl isRequired flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <CalendarIcon />
                  Date
                </FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>

              <FormControl isRequired flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiActivity} />
                  Workout Type
                </FormLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="Select workout type"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="Cardio">Cardio</option>
                  <option value="Strength">Strength</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                <SearchIcon />
                Workout Name
              </FormLabel>
              <WorkoutSearchInput
                value={formData.workoutName}
                onChange={handleWorkoutNameChange}
                onWorkoutSelect={handleWorkoutSelect}
                placeholder="Search for workout (e.g., running, push-ups, yoga)..."
              />
            </FormControl>

            <HStack spacing={4} width="100%">
              <FormControl isRequired flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <TimeIcon />
                  Duration (minutes)
                </FormLabel>
                <Input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleDurationChange}
                  placeholder="0"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiZap} />
                  Calories Burned
                </FormLabel>
                <Input
                  type="number"
                  name="caloriesBurned"
                  value={formData.caloriesBurned}
                  onChange={handleInputChange}
                  placeholder="0"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
            </HStack>

            <HStack spacing={4} width="100%">
              <FormControl flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiTrendingUp} />
                  Intensity Level
                </FormLabel>
                <Select
                  name="intensity"
                  value={formData.intensity}
                  onChange={handleInputChange}
                  placeholder="Select intensity"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </FormControl>

              <FormControl flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiTarget} />
                  Equipment Used
                </FormLabel>
                <Input
                  type="text"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  placeholder="e.g., Dumbbells, Treadmill, None"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                <Box as={FiPackage} />
                Notes (optional)
              </FormLabel>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any notes about your workout..."
                bg={useColorModeValue('white', 'gray.700')}
                borderColor={borderColor}
                color={textColor}
                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                rows={3}
              />
            </FormControl>

            <HStack spacing={4} width="100%">
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                flex={1}
                as={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                leftIcon={isEditing ? <EditIcon /> : <AddIcon />}
                fontWeight="bold"
              >
                {isEditing ? 'Update Record' : 'Add Record'}
              </Button>

              {isEditing && (
                <Button
                  onClick={onCancel}
                  colorScheme="gray"
                  size="lg"
                  flex={1}
                  leftIcon={<DeleteIcon />}
                >
                  Cancel Edit
                </Button>
              )}
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default WorkoutForm;
