import { Box, Card, CardBody, Flex, Grid, Heading, Skeleton, Text } from '@chakra-ui/react';
import { ScoreRing } from '../Dashboard/components/CheckInForm';
import { LEVEL_LABEL } from '../Dashboard/components/verdict';

function Figure({ flow, label, value, unit }) {
  return (
    <Box>
      <Text fontSize="xs" fontWeight="700" color={`${flow}.fg`}>{label}</Text>
      <Text textStyle="figure" fontSize="3xl" mt={0.5}>{value}</Text>
      <Text fontSize="xs" color="fg.muted">{unit}</Text>
    </Box>
  );
}

/**
 * The numbers the coach answers from, so its advice never feels like a black box:
 * today's verdict and readiness, plus fuel and training against the user's goals.
 */
export default function CoachContextCard({ readiness, today, goals, hasCheckIn, isLoading }) {
  return (
    <Card>
      <CardBody>
        <Heading as="h2" size="sm">What your coach sees</Heading>
        {isLoading ? (
          <Skeleton h="150px" mt={4} borderRadius="panel" />
        ) : (
          <>
            <Flex align="center" gap={4} mt={4}>
              <ScoreRing score={readiness.score} level={readiness.level} size={72} />
              <Box minW={0}>
                <Text fontFamily="heading" fontWeight="800" fontSize="3xl" lineHeight="1">
                  {LEVEL_LABEL[readiness.level] || 'Steady day'}.
                </Text>
                <Text fontSize="sm" color="fg.muted" mt={1}>
                  Readiness {readiness.score} of 100{hasCheckIn ? '' : ', without a check-in today'}.
                </Text>
              </Box>
            </Flex>
            {readiness.shortRecommendation && (
              <Text fontSize="sm" mt={3}>{readiness.shortRecommendation}</Text>
            )}
            <Grid templateColumns="repeat(3, 1fr)" gap={3} mt={4} pt={4} borderTopWidth="1px" borderColor="border">
              <Figure flow="fuel" label="Calories" value={today.calories.toLocaleString()} unit={`of ${goals.dailyCalories.toLocaleString()} kcal`} />
              <Figure flow="fuel" label="Protein" value={today.protein} unit={`of ${goals.dailyProtein} g`} />
              <Figure flow="train" label="Sessions" value={today.weeklyWorkouts} unit={`of ${goals.weeklyWorkouts} this week`} />
            </Grid>
          </>
        )}
      </CardBody>
    </Card>
  );
}
