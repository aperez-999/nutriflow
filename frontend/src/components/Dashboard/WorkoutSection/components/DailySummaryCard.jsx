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
import { getDailyTotals, getNavigationDates } from '../utils/workoutUtils';

const DailySummaryCard = ({ workouts, selectedDate, setSelectedDate }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  const dailyTotals = getDailyTotals(workouts, selectedDate);
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
          Daily Workout Summary
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
  );
};

export default DailySummaryCard;
