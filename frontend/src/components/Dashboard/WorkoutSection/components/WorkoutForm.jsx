import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Textarea,
  useColorModeValue,
  Text,
  SimpleGrid,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { EditIcon, AddIcon, DeleteIcon, CalendarIcon, SearchIcon, TimeIcon } from '@chakra-ui/icons';
import { FiActivity, FiZap, FiTrendingUp, FiTarget, FiPackage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import WorkoutSearchInput from '../../../Workout/WorkoutSearchInput';

const MotionButton = motion(Button);

const previewMetrics = [
  { key: 'duration', label: 'Duration', suffix: 'min', icon: TimeIcon, color: 'blue.400' },
  { key: 'caloriesBurned', label: 'Calories', suffix: 'cal', icon: FiZap, color: 'red.400' },
];

const WorkoutForm = ({ isEditing, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    setFormData(initialData);
    setSelectedWorkout(null);
  }, [initialData]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const mutedBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const inputBg = useColorModeValue('white', 'gray.700');
  const iconBg = useColorModeValue('blue.50', 'whiteAlpha.100');

  const estimatedCaloriesPerMinute = useMemo(() => {
    if (!formData.duration || !formData.caloriesBurned) return 0;
    return Math.round((Number(formData.caloriesBurned) / Number(formData.duration)) * 10) / 10;
  }, [formData.duration, formData.caloriesBurned]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
    setFormData((prev) => ({
      ...prev,
      workoutName: value,
    }));
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
        nextData.caloriesBurned = Math.round(Number(duration) * 8).toString();
      }
      return nextData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      duration: Number(formData.duration),
      caloriesBurned: Number(formData.caloriesBurned),
    };
    onSubmit(formattedData);
  };

  return (
    <Box
      p={{ base: 5, md: 6 }}
      bg={bgColor}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="lg"
      minH={{ base: 'auto', xl: '760px' }}
    >
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack spacing={3} mb={2}>
            <Box
              p={2.5}
              borderRadius="xl"
              bg={iconBg}
              color={accentColor}
            >
              {isEditing ? <EditIcon /> : <AddIcon />}
            </Box>
            <Box>
              <Heading size="md" color={textColor}>
                {isEditing ? 'Edit Workout Record' : 'Add Workout Record'}
              </Heading>
              <Text fontSize="sm" color={subTextColor}>
                Search Ninja workout matches, review the session preview, then log the workout.
              </Text>
            </Box>
          </HStack>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <CalendarIcon />
                  Date
                </FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiActivity} />
                  Workout Type
                </FormLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="Select workout type"
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="Cardio">Cardio</option>
                  <option value="Strength">Strength</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                <SearchIcon />
                Workout Search
              </FormLabel>
              <WorkoutSearchInput
                value={formData.workoutName}
                onChange={handleWorkoutNameChange}
                onWorkoutSelect={handleWorkoutSelect}
                placeholder="Search workouts like incline dumbbell press, rowing, or mobility flow"
              />
            </FormControl>

            <Box p={4} borderRadius="2xl" bg={mutedBg} borderWidth="1px" borderColor={borderColor}>
              <HStack justify="space-between" align={{ base: 'start', md: 'center' }} flexWrap="wrap" gap={3} mb={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="700" color={textColor}>
                    Workout Preview
                  </Text>
                  <Text fontSize="sm" color={subTextColor}>
                    {selectedWorkout
                      ? `Using Ninja details for ${selectedWorkout.name}`
                      : 'Calories and session details update here as you build the entry.'}
                  </Text>
                </Box>
                {selectedWorkout && (
                  <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                    Smart match selected
                  </Badge>
                )}
              </HStack>

              <SimpleGrid columns={{ base: 2, xl: 4 }} spacing={3}>
                {previewMetrics.map((metric) => (
                  <Box key={metric.key} p={3.5} borderRadius="xl" bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <HStack spacing={2} mb={2} color={metric.color}>
                      <Box as={metric.icon} boxSize={4} />
                      <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                        {metric.label}
                      </Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="700" color={textColor}>
                      {formData[metric.key] || 0}
                      <Text as="span" fontSize="sm" color={subTextColor} ml={1}>
                        {metric.suffix}
                      </Text>
                    </Text>
                  </Box>
                ))}

                <Box p={3.5} borderRadius="xl" bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                  <HStack spacing={2} mb={2} color="purple.400">
                    <Box as={FiTrendingUp} boxSize={4} />
                    <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                      Intensity
                    </Text>
                  </HStack>
                  <Text fontSize="xl" fontWeight="700" color={textColor}>
                    {formData.intensity || selectedWorkout?.intensity || '—'}
                  </Text>
                </Box>

                <Box p={3.5} borderRadius="xl" bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                  <HStack spacing={2} mb={2} color="teal.400">
                    <Box as={FiTarget} boxSize={4} />
                    <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                      Rate
                    </Text>
                  </HStack>
                  <Text fontSize="xl" fontWeight="700" color={textColor}>
                    {estimatedCaloriesPerMinute || selectedWorkout?.caloriesPerMinute || 0}
                    <Text as="span" fontSize="sm" color={subTextColor} ml={1}>
                      cal/min
                    </Text>
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
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
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>

              <FormControl>
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
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiTrendingUp} />
                  Intensity Level
                </FormLabel>
                <Select
                  name="intensity"
                  value={formData.intensity}
                  onChange={handleInputChange}
                  placeholder="Select intensity"
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </FormControl>

              <FormControl>
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
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                <Box as={FiPackage} />
                Notes
              </FormLabel>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add notes about pacing, sets, recovery, or anything worth remembering."
                bg={inputBg}
                borderColor={borderColor}
                color={textColor}
                borderRadius="xl"
                rows={3}
                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
              />
            </FormControl>

            <HStack spacing={4} justify="flex-end" flexWrap="wrap">
              {isEditing && (
                <Button
                  onClick={onCancel}
                  colorScheme="gray"
                  variant="outline"
                  size="lg"
                  leftIcon={<DeleteIcon />}
                  minW={{ base: '100%', md: '180px' }}
                >
                  Cancel Edit
                </Button>
              )}

              <MotionButton
                type="submit"
                colorScheme="blue"
                size="lg"
                minW={{ base: '100%', md: '220px' }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                leftIcon={isEditing ? <EditIcon /> : <AddIcon />}
                fontWeight="700"
              >
                {isEditing ? 'Update Workout Record' : 'Save Workout Record'}
              </MotionButton>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default WorkoutForm;
