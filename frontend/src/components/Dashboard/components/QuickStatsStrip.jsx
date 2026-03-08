import React from 'react';
import { HStack, Box, Text, useColorModeValue, Icon } from '@chakra-ui/react';
import { FiZap, FiActivity } from 'react-icons/fi';

/**
 * Compact strip showing today's calories and this week's workouts at a glance.
 */
export default function QuickStatsStrip({ dailyCalories, dailyCalorieGoal, weeklyWorkouts, weeklyWorkoutGoal }) {
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const teal = useColorModeValue('teal.500', 'teal.300');
  const blue = useColorModeValue('blue.500', 'blue.300');
  const iconBgTeal = useColorModeValue('teal.50', 'whiteAlpha.100');
  const iconBgBlue = useColorModeValue('blue.50', 'whiteAlpha.100');

  return (
    <HStack
      spacing={{ base: 4, md: 6 }}
      p={4}
      bg={bg}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      flexWrap="wrap"
      justify={{ base: 'center', md: 'flex-start' }}
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
      transition="all 0.2s ease"
    >
      <HStack spacing={3}>
        <Box p={2} borderRadius="lg" bg={iconBgTeal}>
          <Icon as={FiZap} boxSize={5} color={teal} />
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="700" color={textColor}>
            {dailyCalories}
            <Text as="span" fontSize="sm" fontWeight="500" color={subColor} ml={1}>
              / {dailyCalorieGoal}
            </Text>
          </Text>
          <Text fontSize="xs" color={subColor}>Calories today</Text>
        </Box>
      </HStack>
      <HStack spacing={3}>
        <Box p={2} borderRadius="lg" bg={iconBgBlue}>
          <Icon as={FiActivity} boxSize={5} color={blue} />
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="700" color={textColor}>
            {weeklyWorkouts}
            <Text as="span" fontSize="sm" fontWeight="500" color={subColor} ml={1}>
              / {weeklyWorkoutGoal}
            </Text>
          </Text>
          <Text fontSize="xs" color={subColor}>Workouts this week</Text>
        </Box>
      </HStack>
    </HStack>
  );
}
