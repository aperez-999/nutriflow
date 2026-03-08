import React from 'react';
import { Box, VStack, Text, HStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { FiTrendingUp } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';

/**
 * Weekly snapshot: average calories, workout count, and logging streak.
 */
export default function WeeklySummaryCard({ weeklyWorkouts, weeklyWorkoutGoal, avgCaloriesThisWeek, loggingStreak }) {
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const teal = useColorModeValue('teal.500', 'teal.300');
  const orange = useColorModeValue('orange.500', 'orange.400');

  const onTrack = weeklyWorkoutGoal ? weeklyWorkouts >= weeklyWorkoutGoal : false;

  return (
    <Box
      p={5}
      bg={bg}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      height="100%"
      display="flex"
      flexDirection="column"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
      transition="all 0.2s ease"
    >
      <HStack spacing={2} mb={3}>
        <Icon as={FiTrendingUp} boxSize={4} color={teal} />
        <Text fontSize="sm" fontWeight="600" color={textColor}>This week</Text>
      </HStack>
      <VStack align="stretch" spacing={2} flex="1">
        <Text fontSize="sm" color={subColor}>
          <Text as="span" fontWeight="600" color={textColor}>{weeklyWorkouts}</Text> workouts
          {weeklyWorkoutGoal ? ` · goal ${weeklyWorkoutGoal}` : ''}
        </Text>
        {avgCaloriesThisWeek > 0 && (
          <Text fontSize="sm" color={subColor}>
            Avg <Text as="span" fontWeight="600" color={textColor}>{avgCaloriesThisWeek}</Text> cal/day
          </Text>
        )}
        {loggingStreak > 0 && (
          <HStack spacing={1} mt={1}>
            <Icon as={FaFire} boxSize={4} color={orange} />
            <Text fontSize="sm" fontWeight="600" color={textColor}>
              {loggingStreak} day {loggingStreak === 1 ? 'streak' : 'streak'}
            </Text>
          </HStack>
        )}
        {weeklyWorkoutGoal && (
          <Text fontSize="xs" color={onTrack ? 'green.500' : subColor} mt={1}>
            {onTrack ? 'Workout goal reached' : 'Keep going to hit your goal'}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
