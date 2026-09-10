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
import { FiBarChart2, FiActivity, FiTrendingUp, FiTarget, FiCoffee } from 'react-icons/fi';
import DateNavigation from './DateNavigation';
import { getDailyTotals, getNavigationDates } from '../utils/dietUtils';

const statCards = [
  { key: 'calories', label: 'Calories', icon: FiBarChart2, color: 'teal.400', suffix: '' },
  { key: 'protein', label: 'Protein', icon: FiActivity, color: 'blue.400', suffix: 'g' },
  { key: 'carbs', label: 'Carbs', icon: FiTrendingUp, color: 'orange.400', suffix: 'g' },
  { key: 'fats', label: 'Fats', icon: FiTarget, color: 'red.400', suffix: 'g' },
];

const DailySummaryCard = ({ diets, selectedDate, setSelectedDate }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const panelBg = useColorModeValue('teal.50', 'whiteAlpha.50');

  const dailyTotals = getDailyTotals(diets, selectedDate);
  const { getPreviousDay, getNextDay, getToday } = getNavigationDates(selectedDate);

  return (
    <Box
      p={{ base: 5, md: 6 }}
      bg={cardBg}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="lg"
      minH={{ base: 'auto', xl: '328px' }}
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" insetX={0} top={0} h="4px" bgGradient="linear(to-r, teal.400, cyan.400)" />
      <VStack spacing={5} align="stretch">
        <HStack justify="space-between" align={{ base: 'start', md: 'center' }} flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="md" color={textColor} display="flex" alignItems="center" gap={3}>
              <Box as={FiBarChart2} color={accentColor} />
              Daily Nutrition Summary
            </Heading>
            <Text fontSize="sm" color={subTextColor} mt={1}>
              Your daily intake, macro balance, and meal count at a glance.
            </Text>
          </Box>
          <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
            {dailyTotals.count} meal{dailyTotals.count === 1 ? '' : 's'}
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
                {Math.round(dailyTotals.calories)}
              </Text>
              <Text fontSize="sm" color={subTextColor}>calories logged</Text>
            </Box>
            <Box
              p={3}
              borderRadius="2xl"
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              color={accentColor}
            >
              <Box as={FiCoffee} boxSize={5} />
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 2, xl: 4 }} spacing={3}>
            {statCards.map((stat) => (
              <Box key={stat.key} p={3.5} borderRadius="xl" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <HStack spacing={2} mb={2} color={stat.color}>
                  <Box as={stat.icon} boxSize={4} />
                  <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                    {stat.label}
                  </Text>
                </HStack>
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  {Math.round(dailyTotals[stat.key] || 0)}
                  <Text as="span" fontSize="sm" color={subTextColor} ml={1}>
                    {stat.suffix}
                  </Text>
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
};

export default DailySummaryCard;
