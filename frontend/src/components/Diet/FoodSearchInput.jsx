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
import { FiPackage, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import { searchFoods } from '../../services/api';

const formatMacro = (value) => `${Math.round((Number(value) || 0) * 10) / 10}g`;

const FoodSearchInput = ({ value, onChange, onFoodSelect, placeholder = 'Search for food...' }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.650');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const helperColor = useColorModeValue('gray.500', 'gray.400');
  const selectedBg = useColorModeValue('teal.50', 'teal.900');
  const selectedBorder = useColorModeValue('teal.200', 'teal.500');
  const focusBorder = useColorModeValue('teal.400', 'teal.300');
  const resultBorder = useColorModeValue('gray.100', 'whiteAlpha.100');

  const performSearch = async (query) => {
    if (query.trim().length < 2) {
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
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onChange(query);

    if (selectedFood && query !== selectedFood.description) {
      setSelectedFood(null);
      onFoodSelect?.(null);
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 180);
  };

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setSearchQuery(food.description);
    setShowResults(false);
    onChange(food.description);
    onFoodSelect?.(food);
  };

  const clearSelection = () => {
    setSelectedFood(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    onChange('');
    onFoodSelect?.(null);
  };

  useEffect(() => {
    setSearchQuery(value || '');
    if (!value) {
      setSelectedFood(null);
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
          bg={selectedFood ? selectedBg : bgColor}
          borderColor={selectedFood ? selectedBorder : borderColor}
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
            <Spinner size="sm" color="teal.400" />
          ) : selectedFood ? (
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
        Search whole foods or mixed meals like &ldquo;chicken and rice&rdquo; for smarter USDA matches.
      </Text>

      {selectedFood && (
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
                {selectedFood.description}
              </Text>
              <Text fontSize="xs" color={subTextColor} mt={1}>
                {selectedFood.dataType || 'USDA result'}
                {selectedFood.brandOwner ? ` · ${selectedFood.brandOwner}` : ''}
              </Text>
            </Box>
            <Badge colorScheme="teal" borderRadius="full" px={2.5} py={1}>
              {selectedFood.nutrition.calories} cal
            </Badge>
          </HStack>

          <HStack spacing={2} wrap="wrap" mt={3}>
            <Badge colorScheme="blue" variant="subtle">Protein {formatMacro(selectedFood.nutrition.protein)}</Badge>
            <Badge colorScheme="orange" variant="subtle">Carbs {formatMacro(selectedFood.nutrition.carbs)}</Badge>
            <Badge colorScheme="red" variant="subtle">Fat {formatMacro(selectedFood.nutrition.fats)}</Badge>
            <Badge colorScheme="purple" variant="subtle">
              Serving {selectedFood.servingSize || 100}{selectedFood.servingSizeUnit || 'g'}
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
              <Spinner size="sm" color="teal.400" />
              <Text fontSize="sm" color={subTextColor}>Searching USDA foods...</Text>
            </Flex>
          ) : searchResults.length === 0 ? (
            <VStack spacing={2} p={5} align="start">
              <Text fontSize="sm" fontWeight="600" color={textColor}>
                No close food matches yet
              </Text>
              <Text fontSize="sm" color={subTextColor}>
                Try a simpler term like &ldquo;salmon&rdquo;, &ldquo;greek yogurt&rdquo;, or &ldquo;chicken rice bowl&rdquo;.
              </Text>
            </VStack>
          ) : (
            <VStack spacing={0} align="stretch">
              {searchResults.map((food, index) => (
                <Box
                  key={food.fdcId}
                  px={4}
                  py={3.5}
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleFoodSelect(food)}
                >
                  <HStack justify="space-between" align="start" spacing={4}>
                    <Box minW={0} flex="1">
                      <HStack spacing={2} mb={1.5} wrap="wrap">
                        <Badge colorScheme="teal" variant="subtle">
                          {food.nutrition.calories} cal
                        </Badge>
                        {food.dataType && (
                          <Badge variant="outline">{food.dataType}</Badge>
                        )}
                      </HStack>
                      <Text fontSize="sm" fontWeight="700" color={textColor} noOfLines={2}>
                        {food.description}
                      </Text>
                      <HStack spacing={3} wrap="wrap" mt={2}>
                        <HStack spacing={1} color={subTextColor}>
                          <Box as={FiBarChart2} boxSize={3.5} />
                          <Text fontSize="xs">Protein {formatMacro(food.nutrition.protein)}</Text>
                        </HStack>
                        <HStack spacing={1} color={subTextColor}>
                          <Box as={FiTrendingUp} boxSize={3.5} />
                          <Text fontSize="xs">Carbs {formatMacro(food.nutrition.carbs)}</Text>
                        </HStack>
                        <HStack spacing={1} color={subTextColor}>
                          <Box as={FiPackage} boxSize={3.5} />
                          <Text fontSize="xs">
                            Serving {food.servingSize || 100}{food.servingSizeUnit || 'g'}
                          </Text>
                        </HStack>
                      </HStack>
                      {food.brandOwner && (
                        <Text fontSize="xs" color={subTextColor} mt={2} noOfLines={1}>
                          {food.brandOwner}
                        </Text>
                      )}
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

export default FoodSearchInput;
