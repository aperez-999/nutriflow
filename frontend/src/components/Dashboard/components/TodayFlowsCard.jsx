import { memo } from 'react';
import { Box, Button, Card, CardBody, Flex, Heading, Text, VStack } from '@chakra-ui/react';

function Meter({ label, value, goal, unit, flow }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <Box>
      <Flex justify="space-between" fontSize="xs" mb={1}>
        <Text color="fg.muted">{label}</Text>
        <Text fontWeight="600">
          {Math.round(value).toLocaleString()} <Text as="span" color="fg.muted" fontWeight="400">/ {goal.toLocaleString()} {unit}</Text>
        </Text>
      </Flex>
      <Box
        h="6px"
        bg="bg.muted"
        borderRadius="full"
        overflow="hidden"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Math.round(value)}
      >
        <Box h="100%" w={`${pct}%`} bg={`${flow}.solid`} borderRadius="full" transition="width 0.5s cubic-bezier(0.22, 1, 0.36, 1)" />
      </Box>
    </Box>
  );
}

function FlowRow({ flow, title, status, children, advice }) {
  return (
    <Box display="grid" gridTemplateColumns={{ base: '1fr', md: '170px 1fr' }} gap={{ base: 3, md: 5 }} py={4}>
      <Flex align="center" gap={3} alignSelf="start">
        <Box boxSize="10px" borderRadius="2px" bg={`${flow}.solid`} flexShrink={0} aria-hidden="true" />
        <Box>
          <Text fontWeight="700" fontSize="md" lineHeight="1.2">{title}</Text>
          <Text fontSize="xs" color="fg.muted" fontWeight="500">{status}</Text>
        </Box>
      </Flex>
      <VStack align="stretch" spacing={3}>
        {children}
        <Text fontSize="sm" color="fg.muted" maxW="65ch">{advice}</Text>
      </VStack>
    </Box>
  );
}

function TodayFlowsCard({ goals, today, actions, hasCheckIn, onEditGoals }) {
  const fuelStatus = today.calories === 0
    ? 'Not started'
    : today.calories >= goals.dailyCalories * 0.9 ? 'On target' : 'In progress';
  const trainStatus = today.weeklyWorkouts >= goals.weeklyWorkouts
    ? 'Week goal hit'
    : `${Math.max(goals.weeklyWorkouts - today.weeklyWorkouts, 0)} to go this week`;

  return (
    <Card h="100%">
      <CardBody>
        <Flex justify="space-between" align="center" mb={1}>
          <Heading as="h2" size="md">Today&apos;s flows</Heading>
          <Button size="sm" variant="outline" onClick={onEditGoals}>
            Edit goals
          </Button>
        </Flex>
        <Box sx={{ '& > * + *': { borderTopWidth: '1px', borderColor: 'border' } }}>
          <FlowRow flow="fuel" title="Fuel" status={fuelStatus} advice={actions.nutritionSuggestion}>
            <Meter label="Calories" value={today.calories} goal={goals.dailyCalories} unit="kcal" flow="fuel" />
            <Meter label="Protein" value={today.protein} goal={goals.dailyProtein} unit="g" flow="fuel" />
          </FlowRow>
          <FlowRow
            flow="train"
            title="Train"
            status={trainStatus}
            advice={`${actions.workoutIntensity} intensity today. ${actions.workoutDetail}`}
          >
            <Meter label="Workouts in the last 7 days" value={today.weeklyWorkouts} goal={goals.weeklyWorkouts} unit="sessions" flow="train" />
          </FlowRow>
          <FlowRow
            flow="recover"
            title="Recover"
            status={hasCheckIn ? 'Checked in' : 'Check-in pending'}
            advice={actions.recoverySuggestion}
          />
        </Box>
      </CardBody>
    </Card>
  );
}

export default memo(TodayFlowsCard);
