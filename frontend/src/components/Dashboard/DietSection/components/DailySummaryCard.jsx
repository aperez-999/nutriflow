import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiBarChart2 } from 'react-icons/fi';
import DateNavigation from './DateNavigation';
import { getDailyTotals, getNavigationDates } from '../utils/dietUtils';

const DailySummaryCard = ({ diets, selectedDate, setSelectedDate }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  const dailyTotals = getDailyTotals(diets, selectedDate);
  const { getPreviousDay, getNextDay, getToday } = getNavigationDates(selectedDate);

  return (
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
          Daily Nutrition Summary
        </Heading>
        
        <DateNavigation
          selectedDate={selectedDate}
          onPreviousDay={() => setSelectedDate(getPreviousDay())}
          onNextDay={() => setSelectedDate(getNextDay())}
          onToday={() => setSelectedDate(getToday())}
        />

        <HStack spacing={6} justify="center" wrap="wrap">
          <VStack spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
              {Math.round(dailyTotals.calories)}
            </Text>
            <Text fontSize="sm" color={subTextColor}>Calories</Text>
          </VStack>
          <VStack spacing={1}>
            <Text fontSize="xl" fontWeight="semibold" color="blue.400">
              {Math.round(dailyTotals.protein)}g
            </Text>
            <Text fontSize="sm" color={subTextColor}>Protein</Text>
          </VStack>
          <VStack spacing={1}>
            <Text fontSize="xl" fontWeight="semibold" color="orange.400">
              {Math.round(dailyTotals.carbs)}g
            </Text>
            <Text fontSize="sm" color={subTextColor}>Carbs</Text>
          </VStack>
          <VStack spacing={1}>
            <Text fontSize="xl" fontWeight="semibold" color="red.400">
              {Math.round(dailyTotals.fats)}g
            </Text>
            <Text fontSize="sm" color={subTextColor}>Fats</Text>
          </VStack>
          <VStack spacing={1}>
            <Text fontSize="xl" fontWeight="semibold" color="purple.400">
              {dailyTotals.count}
            </Text>
            <Text fontSize="sm" color={subTextColor}>Meals</Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default DailySummaryCard;
