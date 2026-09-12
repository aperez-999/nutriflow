import { useState, useEffect, useRef } from 'react';
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
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Divider,
} from '@chakra-ui/react';
import { CloseIcon, SearchIcon } from '@chakra-ui/icons';
import { FiZap, FiTarget, FiClock, FiTool } from 'react-icons/fi';
import { searchExercises } from '../../services/api';

const WorkoutSearchInput = ({ value, onChange, onWorkoutSelect, placeholder = 'Search for workout...' }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.650');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const helperColor = useColorModeValue('gray.500', 'gray.400');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBorder = useColorModeValue('blue.200', 'blue.500');
  const focusBorder = useColorModeValue('blue.400', 'blue.300');
  const resultBorder = useColorModeValue('gray.100', 'whiteAlpha.100');

  const getIntensityColor = (intensity) => {
    if (intensity === 'High') return 'red';
    if (intensity === 'Low') return 'green';
    return 'yellow';
  };

  const performSearch = async (query) => {
    if (query.trim().length < 2) {
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
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onChange(query);

    if (selectedWorkout && query !== selectedWorkout.name) {
      setSelectedWorkout(null);
      onWorkoutSelect?.(null);
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 180);
  };

  const handleWorkoutSelect = (workout) => {
    setSelectedWorkout(workout);
    setSearchQuery(workout.name);
    setShowResults(false);
    onChange(workout.name);
    onWorkoutSelect?.(workout);
  };

  const clearSelection = () => {
    setSelectedWorkout(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    onChange('');
    onWorkoutSelect?.(null);
  };

  useEffect(() => {
    setSearchQuery(value || '');
    if (!value) {
      setSelectedWorkout(null);
    }
  }, [value]);

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

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const shouldShowDropdown = showResults && searchQuery.trim().length >= 2;

  return (
    <Box position="relative" ref={resultsRef}>
      <InputGroup size="lg">
        <InputLeftElement pointerEvents="none" color={subTextColor}>
          <SearchIcon />
        </InputLeftElement>
        <Input
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery.trim().length >= 2) setShowResults(true);
          }}
          placeholder={placeholder}
          bg={selectedWorkout ? selectedBg : bgColor}
          borderColor={selectedWorkout ? selectedBorder : borderColor}
          color={textColor}
          pl={10}
          pr={10}
          borderRadius="xl"
          _placeholder={{ color: subTextColor }}
          _focus={{ borderColor: focusBorder, boxShadow: `0 0 0 1px ${focusBorder}` }}
          _hover={{ borderColor: focusBorder }}
        />
        <InputRightElement width="3rem">
          {isLoading ? (
            <Spinner size="sm" color="blue.400" />
          ) : selectedWorkout ? (
            <IconButton
              icon={<CloseIcon />}
              size="sm"
              aria-label="Clear selection"
              variant="ghost"
              onClick={clearSelection}
            />
          ) : null}
        </InputRightElement>
      </InputGroup>

      <Text fontSize="xs" color={helperColor} mt={2}>
        Search moves, equipment, or muscle groups like &ldquo;dumbbell chest&rdquo; or &ldquo;hamstring stretch&rdquo;.
      </Text>

      {selectedWorkout && (
        <Box
          mt={3}
          p={4}
          bg={selectedBg}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={selectedBorder}
        >
          <HStack justify="space-between" align="start" spacing={4}>
            <Box minW={0}>
              <Text fontSize="sm" fontWeight="700" color={textColor} noOfLines={2}>
                {selectedWorkout.name}
              </Text>
              <Text fontSize="xs" color={subTextColor} mt={1}>
                {selectedWorkout.type} · {selectedWorkout.target || selectedWorkout.bodyPart || 'General'}
              </Text>
            </Box>
            <Badge colorScheme="blue" borderRadius="full" px={2.5} py={1}>
              {selectedWorkout.caloriesPerMinute} cal/min
            </Badge>
          </HStack>

          <HStack spacing={2} wrap="wrap" mt={3}>
            <Badge colorScheme="blue" variant="subtle">{selectedWorkout.type}</Badge>
            <Badge colorScheme={getIntensityColor(selectedWorkout.intensity)} variant="subtle">
              {selectedWorkout.intensity} intensity
            </Badge>
            <Badge colorScheme="purple" variant="subtle">
              Equipment: {selectedWorkout.equipment || 'None'}
            </Badge>
          </HStack>
        </Box>
      )}

      {shouldShowDropdown && (
        <Box
          position="absolute"
          top="calc(100% + 10px)"
          left={0}
          right={0}
          zIndex={1000}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="2xl"
          boxShadow="xl"
          maxH="360px"
          overflowY="auto"
        >
          {isLoading ? (
            <Flex justify="center" align="center" p={5} gap={3}>
              <Spinner size="sm" color="blue.400" />
              <Text fontSize="sm" color={subTextColor}>Searching workout matches...</Text>
            </Flex>
          ) : searchResults.length === 0 ? (
            <VStack spacing={2} p={5} align="start">
              <Text fontSize="sm" fontWeight="600" color={textColor}>
                No workout matches yet
              </Text>
              <Text fontSize="sm" color={subTextColor}>
                Try broader terms like &ldquo;rowing&rdquo;, &ldquo;chest press&rdquo;, or &ldquo;mobility&rdquo;.
              </Text>
            </VStack>
          ) : (
            <VStack spacing={0} align="stretch">
              {searchResults.map((workout, index) => (
                <Box
                  key={workout.id}
                  px={4}
                  py={3.5}
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleWorkoutSelect(workout)}
                >
                  <HStack justify="space-between" align="start" spacing={4}>
                    <Box minW={0} flex="1">
                      <HStack spacing={2} mb={1.5} wrap="wrap">
                        <Badge colorScheme="blue" variant="subtle">{workout.type}</Badge>
                        <Badge colorScheme={getIntensityColor(workout.intensity)} variant="subtle">
                          {workout.intensity}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" fontWeight="700" color={textColor} noOfLines={2}>
                        {workout.name}
                      </Text>
                      <HStack spacing={3} wrap="wrap" mt={2}>
                        <HStack spacing={1} color={subTextColor}>
                          <Box as={FiZap} boxSize={3.5} />
                          <Text fontSize="xs">{workout.caloriesPerMinute} cal/min</Text>
                        </HStack>
                        <HStack spacing={1} color={subTextColor}>
                          <Box as={FiTarget} boxSize={3.5} />
                          <Text fontSize="xs">{workout.target || workout.bodyPart || 'General'}</Text>
                        </HStack>
                        <HStack spacing={1} color={subTextColor}>
                          <Box as={FiTool} boxSize={3.5} />
                          <Text fontSize="xs">{workout.equipment || 'None'}</Text>
                        </HStack>
                        <HStack spacing={1} color={subTextColor}>
                          <Box as={FiClock} boxSize={3.5} />
                          <Text fontSize="xs">Quick lookup</Text>
                        </HStack>
                      </HStack>
                    </Box>
                  </HStack>
                  {index < searchResults.length - 1 && <Divider mt={3.5} borderColor={resultBorder} />}
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default WorkoutSearchInput;
