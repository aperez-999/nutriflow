import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  Text,
  Spinner,
  Flex,
  IconButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { CloseIcon, SearchIcon } from '@chakra-ui/icons';
import { searchExercises } from '../../services/api';

const WorkoutSearchInput = ({ value, onChange, onWorkoutSelect, placeholder = 'Search for workout...' }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);

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
    <Box
      position="relative"
      ref={resultsRef}
      // Close the results when focus leaves the field and its list (keyboard users).
      onBlur={(e) => {
        if (!resultsRef.current?.contains(e.relatedTarget)) setShowResults(false);
      }}
    >
      <InputGroup>
        <InputLeftElement pointerEvents="none" color="fg.muted">
          <SearchIcon />
        </InputLeftElement>
        <Input
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery.trim().length >= 2) setShowResults(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowResults(false);
          }}
          placeholder={placeholder}
          pr={10}
          role="combobox"
          aria-expanded={shouldShowDropdown}
          aria-autocomplete="list"
        />
        <InputRightElement>
          {isLoading ? (
            <Spinner size="sm" color="fg.muted" />
          ) : selectedWorkout ? (
            <IconButton icon={<CloseIcon boxSize={2.5} />} size="xs" aria-label="Clear exercise" variant="ghost" onClick={clearSelection} />
          ) : null}
        </InputRightElement>
      </InputGroup>

      {shouldShowDropdown && (
        <Box
          position="absolute"
          top="calc(100% + 6px)"
          left={0}
          right={0}
          zIndex="dropdown"
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border"
          borderRadius="panel"
          boxShadow="overlay"
          maxH="320px"
          overflowY="auto"
          role="listbox"
        >
          {isLoading ? (
            <Flex align="center" p={4} gap={3}>
              <Spinner size="sm" color="fg.muted" />
              <Text fontSize="sm" color="fg.muted">Searching exercises</Text>
            </Flex>
          ) : searchResults.length === 0 ? (
            <Text fontSize="sm" color="fg.muted" p={4}>
              No matches. Try a broader word like &ldquo;row&rdquo; or &ldquo;squat&rdquo;, or keep your own name.
            </Text>
          ) : (
            searchResults.map((workout) => (
              <Box
                as="button"
                type="button"
                role="option"
                key={`${workout.name}-${workout.type}`}
                display="block"
                w="100%"
                textAlign="left"
                px={4}
                py={2.5}
                borderBottomWidth="1px"
                borderColor="border"
                _last={{ borderBottomWidth: 0 }}
                _hover={{ bg: 'bg.muted' }}
                _focusVisible={{ bg: 'bg.muted', outline: 'none' }}
                // Keep focus in the input while pressing a result (Safari does not focus buttons on click).
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleWorkoutSelect(workout)}
              >
                <Flex justify="space-between" gap={4} align="baseline">
                  <Text fontSize="sm" fontWeight="600" noOfLines={1}>{workout.name}</Text>
                  <Text fontSize="sm" fontWeight="700" flexShrink={0}>
                    {workout.caloriesPerMinute} kcal/min
                  </Text>
                </Flex>
                <Text fontSize="xs" color="fg.muted" noOfLines={1}>
                  {[workout.type, workout.intensity && `${workout.intensity.toLowerCase()} intensity`, workout.target || workout.bodyPart, workout.equipment && workout.equipment !== 'None' ? workout.equipment : null].filter(Boolean).join(', ')}
                </Text>
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default WorkoutSearchInput;
