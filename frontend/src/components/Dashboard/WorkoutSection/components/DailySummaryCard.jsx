import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { FiBarChart2, FiZap, FiClock, FiActivity } from 'react-icons/fi';
import DateNavigation from './DateNavigation';
import { getDailyTotals, getNavigationDates } from '../utils/workoutUtils';

const DailySummaryCard = ({ workouts, selectedDate, setSelectedDate }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const panelBg = useColorModeValue('blue.50', 'whiteAlpha.50');

  const dailyTotals = getDailyTotals(workouts, selectedDate);
  const { getPreviousDay, getNextDay, getToday } = getNavigationDates(selectedDate);
  const averageBurnRate = dailyTotals.duration ? Math.round((dailyTotals.caloriesBurned / dailyTotals.duration) * 10) / 10 : 0;

  return (
    <Box
      p={{ base: 5, md: 6 }}
      bg={cardBg}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="lg"
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" insetX={0} top={0} h="4px" bgGradient="linear(to-r, blue.400, cyan.400)" />
      <VStack spacing={5} align="stretch">
        <HStack justify="space-between" align={{ base: 'start', md: 'center' }} flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="md" color={textColor} display="flex" alignItems="center" gap={3}>
              <Box as={FiBarChart2} color={accentColor} />
              Daily Workout Summary
            </Heading>
            <Text fontSize="sm" color={subTextColor} mt={1}>
              Session volume, burn, and training output for the day.
            </Text>
          </Box>
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
            {dailyTotals.count} session{dailyTotals.count === 1 ? '' : 's'}
          </Badge>
        </HStack>

        <DateNavigation
          selectedDate={selectedDate}
          onPreviousDay={() => setSelectedDate(getPreviousDay())}
          onNextDay={() => setSelectedDate(getNextDay())}
          onToday={() => setSelectedDate(getToday())}
        />

        <Box p={4} borderRadius="2xl" bg={panelBg} borderWidth="1px" borderColor={borderColor}>
          <HStack justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={subTextColor} fontWeight="700">
                Today&apos;s lead metric
              </Text>
              <Text fontSize="3xl" fontWeight="800" color={accentColor} lineHeight="1.1">
                {Math.round(dailyTotals.duration)}
              </Text>
              <Text fontSize="sm" color={subTextColor}>minutes trained</Text>
            </Box>
            <Box
              p={3}
              borderRadius="2xl"
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              color={accentColor}
            >
              <Box as={FiActivity} boxSize={5} />
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
            <Box p={3.5} borderRadius="xl" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <HStack spacing={2} mb={2} color="blue.400">
                <Box as={FiClock} boxSize={4} />
                <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                  Duration
                </Text>
              </HStack>
              <Text fontSize="xl" fontWeight="700" color={textColor}>
                {Math.round(dailyTotals.duration)}
                <Text as="span" fontSize="sm" color={subTextColor} ml={1}>min</Text>
              </Text>
            </Box>
            <Box p={3.5} borderRadius="xl" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <HStack spacing={2} mb={2} color="red.400">
                <Box as={FiZap} boxSize={4} />
                <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                  Calories
                </Text>
              </HStack>
              <Text fontSize="xl" fontWeight="700" color={textColor}>
                {Math.round(dailyTotals.caloriesBurned)}
                <Text as="span" fontSize="sm" color={subTextColor} ml={1}>cal</Text>
              </Text>
            </Box>
            <Box p={3.5} borderRadius="xl" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <HStack spacing={2} mb={2} color="purple.400">
                <Box as={FiBarChart2} boxSize={4} />
                <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                  Burn Rate
                </Text>
              </HStack>
              <Text fontSize="xl" fontWeight="700" color={textColor}>
                {averageBurnRate}
                <Text as="span" fontSize="sm" color={subTextColor} ml={1}>cal/min</Text>
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
};

export default DailySummaryCard;
