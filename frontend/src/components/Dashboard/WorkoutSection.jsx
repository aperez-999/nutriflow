import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Select,
  HStack,
  Badge,
  Flex,
  Textarea,
  SimpleGrid,
  Card,
  CardBody,
  Tooltip,
} from '@chakra-ui/react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  DeleteIcon, 
  EditIcon,
  CalendarIcon,
  SearchIcon,
  AddIcon,
  SettingsIcon,
  TimeIcon
} from '@chakra-ui/icons';
import { 
  FiBarChart2, 
  FiActivity, 
  FiZap, 
  FiClock,
  FiTrendingUp,
  FiTarget,
  FiHeart,
  FiAward,
  FiPackage
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import WorkoutSearchInput from '../Workout/WorkoutSearchInput';

const MotionBox = motion(Box);

function WorkoutSection({ workouts, onAddWorkout, onUpdateWorkout, onDeleteWorkout }) {
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

  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculate daily totals for selected date
  const getDailyTotals = () => {
    const todaysWorkouts = workouts.filter(workout => 
      workout.date && workout.date.split('T')[0] === selectedDate
    );
    
    return todaysWorkouts.reduce((totals, workout) => ({
      duration: totals.duration + (workout.duration || 0),
      caloriesBurned: totals.caloriesBurned + (workout.caloriesBurned || 0),
      count: totals.count + 1
    }), { duration: 0, caloriesBurned: 0, count: 0 });
  };

  const dailyTotals = getDailyTotals();

  // Date navigation functions
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle workout selection from search
  const handleWorkoutSelect = (workout) => {
    if (workout) {
      setFormData(prev => ({
        ...prev,
        workoutName: workout.name,
        type: workout.type,
        // Calculate estimated calories based on duration if duration is set
        caloriesBurned: prev.duration ? 
          (workout.caloriesPerMinute * Number(prev.duration)).toString() : 
          workout.caloriesPerMinute.toString()
      }));
    }
  };

  // Handle workout name change (for manual entry)
  const handleWorkoutNameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      workoutName: value
    }));
  };

  // Auto-calculate calories when duration changes and workout is selected
  const handleDurationChange = (e) => {
    const duration = e.target.value;
    setFormData(prev => {
      const newFormData = { ...prev, duration };
      // If we have a workout selected with calories per minute, auto-calculate
      if (prev.workoutName && duration) {
        // This is a simplified calculation - in a real app you'd store the selected workout data
        const estimatedCalories = Math.round(duration * 8); // Average 8 cal/min
        return { ...newFormData, caloriesBurned: estimatedCalories.toString() };
      }
      return newFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        duration: Number(formData.duration),
        caloriesBurned: Number(formData.caloriesBurned)
      };

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

  // Get workout type color
  const getWorkoutTypeColor = (type) => {
    switch (type) {
      case 'Cardio': return 'red';
      case 'Strength': return 'blue';
      case 'Flexibility': return 'green';
      case 'Sports': return 'purple';
      default: return 'gray';
    }
  };

  // Get workout type icon
  const getWorkoutTypeIcon = (type) => {
    switch (type) {
      case 'Cardio': return FiHeart;
      case 'Strength': return FiActivity;
      case 'Flexibility': return FiTarget;
      case 'Sports': return FiTrendingUp;
      default: return FiActivity;
    }
  };

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <VStack spacing={6} align="stretch">
        {/* Daily Summary Card */}
        <Box 
          p={6} 
          bg={cardBg} 
          borderRadius="xl" 
          borderWidth="1px" 
          borderColor={borderColor}
          boxShadow="lg"
        >
          <VStack spacing={4}>
            <Heading size="lg" color={accentColor} textAlign="center" display="flex" alignItems="center" justifyContent="center" gap={3}>
              <Box as={FiBarChart2} />
              Daily Workout Summary
            </Heading>
            
            <VStack spacing={3}>
              <Text fontSize="sm" color={subTextColor} fontWeight="medium">
                Viewing Date
              </Text>
              <HStack spacing={4} align="center">
                <IconButton
                  icon={<ChevronLeftIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={goToPreviousDay}
                  aria-label="Previous day"
                  _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
                />
                
                <VStack spacing={1} minW="120px">
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </Text>
                  <Text fontSize="xs" color={subTextColor}>
                    {new Date(selectedDate).getFullYear()}
                  </Text>
                </VStack>

                <IconButton
                  icon={<ChevronRightIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={goToNextDay}
                  aria-label="Next day"
                  _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
                />
              </HStack>
              
              <Button
                size="xs"
                variant="ghost"
                colorScheme="blue"
                onClick={goToToday}
                fontSize="xs"
                _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
              >
                Today
              </Button>
            </VStack>

            <HStack spacing={6} justify="center" wrap="wrap">
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
                  {Math.round(dailyTotals.duration)}
                </Text>
                <Text fontSize="sm" color={subTextColor}>Minutes</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="xl" fontWeight="semibold" color="red.400">
                  {Math.round(dailyTotals.caloriesBurned)}
                </Text>
                <Text fontSize="sm" color={subTextColor}>Calories</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="xl" fontWeight="semibold" color="purple.400">
                  {dailyTotals.count}
                </Text>
                <Text fontSize="sm" color={subTextColor}>Workouts</Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* Add/Edit Form */}
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
                      onClick={handleCancel}
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

        {/* Workout Records Table */}
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
                  .map((workout) => {
                    const TypeIcon = getWorkoutTypeIcon(workout.type);
                    return (
                      <Card 
                        key={workout._id}
                        size="sm"
                        variant="outline"
                        _hover={{ 
                          transform: 'translateY(-2px)', 
                          boxShadow: 'lg',
                          borderColor: useColorModeValue('blue.200', 'blue.500')
                        }}
                        transition="all 0.2s"
                        cursor="pointer"
                        height="220px"
                      >
                        <CardBody p={4}>
                          <VStack spacing={3} align="stretch" height="100%">
                            {/* Header Section */}
                            <HStack justify="space-between" align="center">
                              <Badge 
                                colorScheme={getWorkoutTypeColor(workout.type)}
                                variant="subtle"
                                fontSize="xs"
                                px={2}
                                py={1}
                              >
                                <HStack spacing={1}>
                                  <Box as={TypeIcon} size={3} />
                                  <Text>{workout.type}</Text>
                                </HStack>
                              </Badge>
                              <Text fontSize="xs" color={subTextColor}>
                                {new Date(workout.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </Text>
                            </HStack>
                            
                            {/* Workout Name Section */}
                            <Tooltip label={workout.workoutName || workout.type} hasArrow>
                              <Text 
                                fontSize="sm" 
                                fontWeight="semibold" 
                                color={textColor}
                                noOfLines={1}
                              >
                                {workout.workoutName || workout.type || 'Unknown Workout'}
                              </Text>
                            </Tooltip>
                            
                            {/* Metrics Section */}
                            <SimpleGrid columns={4} spacing={2} width="100%">
                              <VStack spacing={1}>
                                <Text fontSize="md" fontWeight="bold" color="blue.500">
                                  {Math.round(workout.duration || 0)}
                                </Text>
                                <Text fontSize="xs" color={subTextColor}>Min</Text>
                              </VStack>
                              <VStack spacing={1}>
                                <Text fontSize="md" fontWeight="bold" color="red.400">
                                  {Math.round(workout.caloriesBurned || 0)}
                                </Text>
                                <Text fontSize="xs" color={subTextColor}>Cal</Text>
                              </VStack>
                              <VStack spacing={1}>
                                <Text fontSize="md" fontWeight="bold" color="green.400">
                                  {workout.type === 'Cardio' ? '❤️' : workout.type === 'Strength' ? '💪' : workout.type === 'Flexibility' ? '🧘' : '⚽'}
                                </Text>
                                <Text fontSize="xs" color={subTextColor}>Type</Text>
                              </VStack>
                              <VStack spacing={1}>
                                <Text fontSize="md" fontWeight="bold" color="purple.400">
                                  {workout.caloriesBurned && workout.duration ? Math.round((workout.caloriesBurned / workout.duration) * 10) / 10 : '0'}
                                </Text>
                                <Text fontSize="xs" color={subTextColor}>Cal/Min</Text>
                              </VStack>
                            </SimpleGrid>
                            
                            {/* Notes Section */}
                            {workout.notes && (
                              <Text fontSize="xs" color={subTextColor} noOfLines={2}>
                                📝 {workout.notes}
                              </Text>
                            )}
                            
                            {/* Actions Section */}
                            <HStack spacing={2} justify="center" pt={2}>
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleEdit(workout)}
                                aria-label="Edit workout"
                              />
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => onDeleteWorkout(workout._id)}
                                aria-label="Delete workout"
                              />
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    );
                  })}
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