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
import { searchExercises } from '../../services/api';

const WorkoutSearchInput = ({ value, onChange, onWorkoutSelect, placeholder = "Search for workout..." }) => {
  // State
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  
  // Refs
  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);

  // Color mode values - all defined at the top
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  
  // Selected state colors
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBorder = useColorModeValue('blue.300', 'blue.500');
  const selectedFocusBorder = useColorModeValue('blue.400', 'blue.400');
  const selectedHoverBorder = useColorModeValue('blue.300', 'blue.400');
  const selectedTextColor = useColorModeValue('blue.700', 'blue.200');
  const selectedBoxBorder = useColorModeValue('blue.200', 'blue.600');
  
  // Regular state colors
  const regularFocusBorder = useColorModeValue('blue.400', 'blue.300');
  const regularHoverBorder = useColorModeValue('gray.300', 'gray.500');

  // Search function
  const performSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchExercises(query);
      setSearchResults(response.workouts || []);
      setShowResults(true);
    } catch (error) {
      console.error('Exercise search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
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
          bg={selectedWorkout ? selectedBg : bgColor}
          borderColor={selectedWorkout ? selectedBorder : borderColor}
          color={textColor}
          _placeholder={{ color: subTextColor }}
          _focus={{
            borderColor: selectedWorkout ? selectedFocusBorder : regularFocusBorder,
            boxShadow: selectedWorkout ? 
              `0 0 0 1px ${selectedFocusBorder}` : 
              `0 0 0 1px ${regularFocusBorder}`
          }}
          _hover={{
            borderColor: selectedWorkout ? selectedHoverBorder : regularHoverBorder
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
          bg={selectedBg}
          borderRadius="lg" 
          borderWidth="1px" 
          borderColor={selectedBoxBorder}
          boxShadow="sm"
        >
          <Text fontSize="sm" color={selectedTextColor} fontWeight="semibold">
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