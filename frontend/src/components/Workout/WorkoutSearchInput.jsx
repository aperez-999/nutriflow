import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  Spinner,
  useColorModeValue,
  Flex,
  Badge,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { 
  FiActivity, 
  FiZap, 
  FiClock, 
  FiTrendingUp,
  FiTarget,
  FiHeart
} from 'react-icons/fi';

const WorkoutSearchInput = ({ value, onChange, onWorkoutSelect, placeholder = "Search for workout..." }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');

  // Predefined workout database with estimated calories per minute
  const workoutDatabase = [
    // Cardio Workouts
    { id: 1, name: 'Running (6 mph)', type: 'Cardio', caloriesPerMinute: 10, intensity: 'High', equipment: 'None' },
    { id: 2, name: 'Cycling (moderate)', type: 'Cardio', caloriesPerMinute: 8, intensity: 'Medium', equipment: 'Bike' },
    { id: 3, name: 'Swimming (freestyle)', type: 'Cardio', caloriesPerMinute: 11, intensity: 'High', equipment: 'Pool' },
    { id: 4, name: 'Walking (brisk)', type: 'Cardio', caloriesPerMinute: 4, intensity: 'Low', equipment: 'None' },
    { id: 5, name: 'Elliptical Machine', type: 'Cardio', caloriesPerMinute: 9, intensity: 'Medium', equipment: 'Elliptical' },
    { id: 6, name: 'Rowing Machine', type: 'Cardio', caloriesPerMinute: 12, intensity: 'High', equipment: 'Rowing Machine' },
    { id: 7, name: 'Jump Rope', type: 'Cardio', caloriesPerMinute: 13, intensity: 'High', equipment: 'Jump Rope' },
    { id: 8, name: 'Stair Climbing', type: 'Cardio', caloriesPerMinute: 9, intensity: 'Medium', equipment: 'Stairs' },
    
    // Strength Training
    { id: 9, name: 'Weight Training (general)', type: 'Strength', caloriesPerMinute: 6, intensity: 'Medium', equipment: 'Weights' },
    { id: 10, name: 'Push-ups', type: 'Strength', caloriesPerMinute: 7, intensity: 'Medium', equipment: 'None' },
    { id: 11, name: 'Pull-ups', type: 'Strength', caloriesPerMinute: 8, intensity: 'High', equipment: 'Pull-up Bar' },
    { id: 12, name: 'Squats', type: 'Strength', caloriesPerMinute: 6, intensity: 'Medium', equipment: 'None' },
    { id: 13, name: 'Deadlifts', type: 'Strength', caloriesPerMinute: 7, intensity: 'High', equipment: 'Barbell' },
    { id: 14, name: 'Bench Press', type: 'Strength', caloriesPerMinute: 6, intensity: 'Medium', equipment: 'Barbell/Bench' },
    { id: 15, name: 'Planks', type: 'Strength', caloriesPerMinute: 3, intensity: 'Low', equipment: 'None' },
    
    // Flexibility & Recovery
    { id: 16, name: 'Yoga (Hatha)', type: 'Flexibility', caloriesPerMinute: 3, intensity: 'Low', equipment: 'Yoga Mat' },
    { id: 17, name: 'Yoga (Vinyasa)', type: 'Flexibility', caloriesPerMinute: 5, intensity: 'Medium', equipment: 'Yoga Mat' },
    { id: 18, name: 'Pilates', type: 'Flexibility', caloriesPerMinute: 4, intensity: 'Low', equipment: 'Mat' },
    { id: 19, name: 'Stretching', type: 'Flexibility', caloriesPerMinute: 2, intensity: 'Low', equipment: 'None' },
    { id: 20, name: 'Tai Chi', type: 'Flexibility', caloriesPerMinute: 3, intensity: 'Low', equipment: 'None' },
    
    // Sports
    { id: 21, name: 'Basketball', type: 'Sports', caloriesPerMinute: 8, intensity: 'High', equipment: 'Basketball' },
    { id: 22, name: 'Tennis', type: 'Sports', caloriesPerMinute: 7, intensity: 'Medium', equipment: 'Racket' },
    { id: 23, name: 'Soccer', type: 'Sports', caloriesPerMinute: 9, intensity: 'High', equipment: 'Soccer Ball' },
    { id: 24, name: 'Volleyball', type: 'Sports', caloriesPerMinute: 6, intensity: 'Medium', equipment: 'Volleyball' },
    { id: 25, name: 'Golf', type: 'Sports', caloriesPerMinute: 4, intensity: 'Low', equipment: 'Golf Clubs' },
    { id: 26, name: 'Rock Climbing', type: 'Sports', caloriesPerMinute: 11, intensity: 'High', equipment: 'Climbing Gear' },
    
    // HIIT & Circuit Training
    { id: 27, name: 'HIIT Training', type: 'Cardio', caloriesPerMinute: 15, intensity: 'High', equipment: 'Varies' },
    { id: 28, name: 'Circuit Training', type: 'Strength', caloriesPerMinute: 10, intensity: 'High', equipment: 'Varies' },
    { id: 29, name: 'Burpees', type: 'Cardio', caloriesPerMinute: 12, intensity: 'High', equipment: 'None' },
    { id: 30, name: 'Mountain Climbers', type: 'Cardio', caloriesPerMinute: 10, intensity: 'High', equipment: 'None' },
    
    // Dance & Fun Activities
    { id: 31, name: 'Zumba', type: 'Cardio', caloriesPerMinute: 7, intensity: 'Medium', equipment: 'None' },
    { id: 32, name: 'Dance (general)', type: 'Cardio', caloriesPerMinute: 6, intensity: 'Medium', equipment: 'None' },
    { id: 33, name: 'Martial Arts', type: 'Sports', caloriesPerMinute: 8, intensity: 'High', equipment: 'None' },
    { id: 34, name: 'Boxing', type: 'Sports', caloriesPerMinute: 12, intensity: 'High', equipment: 'Gloves' },
  ];

  // Search function
  const performSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay for better UX
    setTimeout(() => {
      const filteredWorkouts = workoutDatabase.filter(workout =>
        workout.name.toLowerCase().includes(query.toLowerCase()) ||
        workout.type.toLowerCase().includes(query.toLowerCase()) ||
        workout.equipment.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8); // Limit to 8 results

      setSearchResults(filteredWorkouts);
      setShowResults(true);
      setIsLoading(false);
    }, 100);
  };

  // Handle input change with real-time search
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onChange(query);
    
    // Clear selected workout if user is typing
    if (selectedWorkout) {
      setSelectedWorkout(null);
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 150);
  };

  // Handle workout selection
  const handleWorkoutSelect = (workout) => {
    setSelectedWorkout(workout);
    setSearchQuery(workout.name);
    setShowResults(false);
    onChange(workout.name);
    
    // Notify parent component with workout data
    if (onWorkoutSelect) {
      onWorkoutSelect(workout);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedWorkout(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    onChange('');
    if (onWorkoutSelect) {
      onWorkoutSelect(null);
    }
  };

  // Get intensity color
  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'Low': return 'green';
      case 'Medium': return 'yellow';
      case 'High': return 'red';
      default: return 'gray';
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Cardio': return FiHeart;
      case 'Strength': return FiActivity;
      case 'Flexibility': return FiTarget;
      case 'Sports': return FiTrendingUp;
      default: return FiActivity;
    }
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box position="relative" ref={resultsRef}>
      <Flex>
        <Input
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          bg={selectedWorkout ? useColorModeValue('blue.50', 'blue.900') : useColorModeValue('white', 'gray.700')}
          borderColor={selectedWorkout ? useColorModeValue('blue.300', 'blue.500') : borderColor}
          color={textColor}
          _placeholder={{ color: subTextColor }}
          _focus={{
            borderColor: selectedWorkout ? useColorModeValue('blue.400', 'blue.400') : useColorModeValue('blue.400', 'blue.300'),
            boxShadow: selectedWorkout ? 
              useColorModeValue('0 0 0 1px blue.400', '0 0 0 1px blue.400') : 
              useColorModeValue('0 0 0 1px blue.400', '0 0 0 1px blue.300')
          }}
          _hover={{
            borderColor: selectedWorkout ? useColorModeValue('blue.300', 'blue.400') : useColorModeValue('gray.300', 'gray.500')
          }}
        />
        {selectedWorkout && (
          <IconButton
            icon={<CloseIcon />}
            size="sm"
            ml={2}
            onClick={clearSelection}
            aria-label="Clear selection"
            colorScheme="gray"
            variant="ghost"
          />
        )}
      </Flex>

      {/* Selected workout indicator */}
      {selectedWorkout && (
        <Box 
          mt={2} 
          p={3} 
          bg={useColorModeValue('blue.50', 'blue.900')} 
          borderRadius="lg" 
          borderWidth="1px" 
          borderColor={useColorModeValue('blue.200', 'blue.600')}
          boxShadow="sm"
        >
          <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.200')} fontWeight="semibold">
            ✓ Selected: {selectedWorkout.name}
          </Text>
          <Flex wrap="wrap" gap={2} mt={1}>
            <Badge colorScheme="blue" variant="subtle" fontSize="xs">
              <HStack spacing={1}>
                <Box as={getTypeIcon(selectedWorkout.type)} size={3} />
                <Text>{selectedWorkout.type}</Text>
              </HStack>
            </Badge>
            <Badge colorScheme={getIntensityColor(selectedWorkout.intensity)} variant="subtle" fontSize="xs">
              {selectedWorkout.intensity} intensity
            </Badge>
            <Badge colorScheme="orange" variant="subtle" fontSize="xs">
              <HStack spacing={1}>
                <Box as={FiZap} size={3} />
                <Text>{selectedWorkout.caloriesPerMinute} cal/min</Text>
              </HStack>
            </Badge>
          </Flex>
        </Box>
      )}

      {/* Search results dropdown */}
      {showResults && (searchResults.length > 0 || isLoading) && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          boxShadow="lg"
          maxHeight="300px"
          overflowY="auto"
          mt={1}
        >
          {isLoading ? (
            <Flex justify="center" align="center" p={4}>
              <Spinner size="sm" mr={2} />
              <Text fontSize="sm" color={subTextColor}>Searching workouts...</Text>
            </Flex>
          ) : (
            <VStack spacing={0} align="stretch">
              {searchResults.map((workout) => {
                const TypeIcon = getTypeIcon(workout.type);
                return (
                  <Box
                    key={workout.id}
                    p={3}
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    borderBottomWidth="1px"
                    borderBottomColor={borderColor}
                    onClick={() => handleWorkoutSelect(workout)}
                  >
                    <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
                      {workout.name}
                    </Text>
                    <Flex wrap="wrap" gap={2}>
                      <Badge colorScheme="blue" fontSize="xs">
                        <HStack spacing={1}>
                          <Box as={TypeIcon} size={3} />
                          <Text>{workout.type}</Text>
                        </HStack>
                      </Badge>
                      <Badge colorScheme={getIntensityColor(workout.intensity)} fontSize="xs">
                        {workout.intensity}
                      </Badge>
                      <Badge colorScheme="orange" fontSize="xs">
                        <HStack spacing={1}>
                          <Box as={FiZap} size={3} />
                          <Text>{workout.caloriesPerMinute} cal/min</Text>
                        </HStack>
                      </Badge>
                    </Flex>
                    {workout.equipment !== 'None' && (
                      <Text fontSize="xs" color={subTextColor} mt={1}>
                        Equipment: {workout.equipment}
                      </Text>
                    )}
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default WorkoutSearchInput;