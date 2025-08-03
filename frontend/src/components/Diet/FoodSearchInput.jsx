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
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { searchFoods } from '../../services/api';

const FoodSearchInput = ({ value, onChange, onFoodSelect, placeholder = "Search for food..." }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');

  // Debounced search function
  const performSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchFoods(query);
      setSearchResults(response.foods || []);
      setShowResults(true);
    } catch (error) {
      console.error('Food search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with real-time search
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onChange(query); // Update parent component
    
    // Clear selected food if user is typing
    if (selectedFood) {
      setSelectedFood(null);
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Immediate search for better UX (reduced delay)
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 150); // Faster response - 150ms delay
  };

  // Handle food selection
  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setSearchQuery(food.description);
    setShowResults(false);
    onChange(food.description);
    
    // Notify parent component with nutrition data
    if (onFoodSelect) {
      onFoodSelect(food);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedFood(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    onChange('');
    if (onFoodSelect) {
      onFoodSelect(null);
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
          bg={selectedFood ? useColorModeValue('green.50', 'green.900') : useColorModeValue('white', 'gray.700')}
          borderColor={selectedFood ? useColorModeValue('green.300', 'green.500') : borderColor}
          color={textColor}
          _placeholder={{ color: subTextColor }}
          _focus={{
            borderColor: selectedFood ? useColorModeValue('green.400', 'green.400') : useColorModeValue('blue.400', 'blue.300'),
            boxShadow: selectedFood ? 
              useColorModeValue('0 0 0 1px green.400', '0 0 0 1px green.400') : 
              useColorModeValue('0 0 0 1px blue.400', '0 0 0 1px blue.300')
          }}
          _hover={{
            borderColor: selectedFood ? useColorModeValue('green.300', 'green.400') : useColorModeValue('gray.300', 'gray.500')
          }}
        />
        {selectedFood && (
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

      {/* Selected food indicator */}
      {selectedFood && (
        <Box 
          mt={2} 
          p={3} 
          bg={useColorModeValue('green.50', 'green.900')} 
          borderRadius="lg" 
          borderWidth="1px" 
          borderColor={useColorModeValue('green.200', 'green.600')}
          boxShadow="sm"
        >
          <Text fontSize="sm" color={useColorModeValue('green.700', 'green.200')} fontWeight="semibold">
            ✓ Selected: {selectedFood.description}
          </Text>
          <Flex wrap="wrap" gap={2} mt={1}>
            <Badge colorScheme="green" variant="subtle" fontSize="xs">
              {selectedFood.nutrition.calories} cal
            </Badge>
            <Badge colorScheme="blue" variant="subtle" fontSize="xs">
              {selectedFood.nutrition.protein}g protein
            </Badge>
            <Badge colorScheme="orange" variant="subtle" fontSize="xs">
              {selectedFood.nutrition.carbs}g carbs
            </Badge>
            <Badge colorScheme="red" variant="subtle" fontSize="xs">
              {selectedFood.nutrition.fats}g fat
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
              <Text fontSize="sm" color={subTextColor}>Searching foods...</Text>
            </Flex>
          ) : (
            <VStack spacing={0} align="stretch">
              {searchResults.map((food) => (
                <Box
                  key={food.fdcId}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  borderBottomWidth="1px"
                  borderBottomColor={borderColor}
                  onClick={() => handleFoodSelect(food)}
                >
                  <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
                    {food.description}
                  </Text>
                  <Flex wrap="wrap" gap={2}>
                    <Badge colorScheme="blue" fontSize="xs">
                      {food.nutrition.calories} cal
                    </Badge>
                    <Badge colorScheme="green" fontSize="xs">
                      {food.nutrition.protein}g protein
                    </Badge>
                    <Badge colorScheme="orange" fontSize="xs">
                      {food.nutrition.carbs}g carbs
                    </Badge>
                    <Badge colorScheme="red" fontSize="xs">
                      {food.nutrition.fats}g fat
                    </Badge>
                  </Flex>
                  {food.brandOwner && (
                    <Text fontSize="xs" color={subTextColor} mt={1}>
                      {food.brandOwner}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FoodSearchInput;