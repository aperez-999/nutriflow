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
import { searchFoods } from '../../services/api';

const formatMacro = (value) => `${Math.round((Number(value) || 0) * 10) / 10} g`;

const FoodSearchInput = ({ value, onChange, onFoodSelect, placeholder = 'Search for food...' }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

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
          placeholder={placeholder}
          pr={10}
          role="combobox"
          aria-expanded={shouldShowDropdown}
          aria-autocomplete="list"
        />
        <InputRightElement>
          {isLoading ? (
            <Spinner size="sm" color="fg.muted" />
          ) : selectedFood ? (
            <IconButton icon={<CloseIcon boxSize={2.5} />} size="xs" aria-label="Clear food" variant="ghost" onClick={clearSelection} />
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
              <Text fontSize="sm" color="fg.muted">Searching USDA foods</Text>
            </Flex>
          ) : searchResults.length === 0 ? (
            <Text fontSize="sm" color="fg.muted" p={4}>
              No matches. Try a simpler word like &ldquo;salmon&rdquo; or &ldquo;oats&rdquo;, or keep your own name and enter the numbers.
            </Text>
          ) : (
            searchResults.map((food) => (
              <Box
                as="button"
                type="button"
                role="option"
                key={food.fdcId}
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
                onClick={() => handleFoodSelect(food)}
              >
                <Flex justify="space-between" gap={4} align="baseline">
                  <Text fontSize="sm" fontWeight="600" noOfLines={1}>{food.description}</Text>
                  <Text fontSize="sm" fontWeight="700" flexShrink={0} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {food.nutrition.calories} kcal
                  </Text>
                </Flex>
                <Text fontSize="xs" color="fg.muted" noOfLines={1}>
                  {formatMacro(food.nutrition.protein)} protein, {formatMacro(food.nutrition.carbs)} carbs, {formatMacro(food.nutrition.fats)} fat
                  {' '}per {food.servingSize || 100} {food.servingSizeUnit || 'g'}
                  {food.brandOwner ? `, ${food.brandOwner}` : ''}
                </Text>
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default FoodSearchInput;
