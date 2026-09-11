import React from 'react';
import {
  Badge,
  Box,
  Card,
  CardBody,
  HStack,
  Progress,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

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

const LEVEL_META = {
  high: {
    label: 'High',
    colorScheme: 'green',
  },
  moderate: {
    label: 'Moderate',
    colorScheme: 'yellow',
  },
  low: {
    label: 'Low',
    colorScheme: 'red',
  },
};

function DailyReadinessCard({ readiness = {} }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const progressTrack = useColorModeValue('gray.100', 'whiteAlpha.200');
  const meta = LEVEL_META[readiness?.level] || LEVEL_META.moderate;

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} {...cardStyles}>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" align="flex-start">
            <Box>
              <Text fontSize="sm" fontWeight="600" color={subColor} letterSpacing="wider">
                DAILY READINESS SCORE
              </Text>
              <Text fontSize="2xl" fontWeight="700" color={textColor} mt={1}>
                {readiness.score}
                <Text as="span" fontSize="sm" fontWeight="500" color={subColor} ml={1}>
                  / 100
                </Text>
              </Text>
            </Box>
            <Badge colorScheme={meta.colorScheme} borderRadius="full" px={3} py={1} textTransform="uppercase">
              {meta.label}
            </Badge>
          </HStack>

          <Progress
            value={readiness.score}
            colorScheme={meta.colorScheme}
            bg={progressTrack}
            borderRadius="full"
            size="sm"
          />

          <Text fontSize="sm" color={textColor}>
            {readiness.shortRecommendation}
          </Text>

          <Text fontSize="xs" color={subColor}>
            Based on {readiness.factors.workoutsLast7Days} workouts in the last 7 days, {readiness.factors.todayMeals} meals logged today, and a {readiness.factors.loggingStreak}-day logging streak.
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
}

export default React.memo(DailyReadinessCard);
