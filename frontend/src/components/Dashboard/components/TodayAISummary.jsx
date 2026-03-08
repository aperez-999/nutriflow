import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiZap, FiActivity } from 'react-icons/fi';

const cardStyles = {
  borderRadius: 'xl',
  boxShadow: 'sm',
  borderWidth: '1px',
  _hover: {
    transform: 'translateY(-2px)',
    boxShadow: 'lg',
  },
  transition: 'all 0.2s ease',
};

function getSuggestion(dailyCalories, dailyCalorieGoal, weeklyWorkouts, weeklyWorkoutGoal) {
  if (dailyCalorieGoal > 0 && dailyCalories < dailyCalorieGoal * 0.8) {
    return 'You are behind your calorie target today.';
  }
  if (dailyCalorieGoal > 0 && dailyCalories > dailyCalorieGoal * 1.2) {
    return "You've exceeded your calorie target. Consider lighter options for your next meal.";
  }
  if (weeklyWorkoutGoal > 0 && weeklyWorkouts < weeklyWorkoutGoal) {
    return 'Complete one more workout this week to hit your goal.';
  }
  if (weeklyWorkouts >= weeklyWorkoutGoal && weeklyWorkoutGoal > 0) {
    return "You're on track with workouts this week. Keep it up!";
  }
  return 'Log meals and workouts to get personalized suggestions.';
}

export default function TodayAISummary({
  dailyCalories = 0,
  dailyCalorieGoal = 2000,
  weeklyWorkouts = 0,
  weeklyWorkoutGoal = 5,
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const suggestionColor = useColorModeValue('gray.500', 'gray.500');
  const teal = useColorModeValue('teal.500', 'teal.300');
  const blue = useColorModeValue('blue.500', 'blue.300');

  const suggestion = getSuggestion(dailyCalories, dailyCalorieGoal, weeklyWorkouts, weeklyWorkoutGoal);

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} {...cardStyles}>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Text fontSize="sm" fontWeight="600" color={subColor} letterSpacing="wider">
            TODAY&apos;S AI SUMMARY
          </Text>
          <SimpleGrid columns={2} spacing={4}>
            <HStack spacing={2} align="center">
              <Icon as={FiZap} boxSize={4} color={teal} flexShrink={0} />
              <Box>
                <Text fontSize="xs" color={subColor}>Calories Logged</Text>
                <Text fontSize="sm" fontWeight="600" color={textColor}>
                  {dailyCalories} / {dailyCalorieGoal}
                </Text>
              </Box>
            </HStack>
            <HStack spacing={2} align="center">
              <Icon as={FiActivity} boxSize={4} color={blue} flexShrink={0} />
              <Box>
                <Text fontSize="xs" color={subColor}>Workouts Completed</Text>
                <Text fontSize="sm" fontWeight="600" color={textColor}>
                  {weeklyWorkouts} / {weeklyWorkoutGoal}
                </Text>
              </Box>
            </HStack>
          </SimpleGrid>
          <Text fontSize="xs" color={suggestionColor} fontStyle="italic">
            {suggestion}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
}
