import { memo } from 'react';
import { Box, Button, Card, CardBody, Flex, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import { FiActivity, FiCoffee, FiEdit2, FiMoon } from 'react-icons/fi';

function Meter({ label, value, goal, unit, flow }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <Box>
      <Flex justify="space-between" fontSize="xs" mb={1}>
        <Text color="text.muted">{label}</Text>
        <Text fontWeight="600">
          {Math.round(value).toLocaleString()} <Text as="span" color="text.muted" fontWeight="400">/ {goal.toLocaleString()} {unit}</Text>
        </Text>
      </Flex>
      <Box
        h="6px"
        bg="data.empty"
        borderRadius="full"
        overflow="hidden"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Math.round(value)}
      >
        <Box h="100%" w={`${pct}%`} bg={`data.${flow}`} borderRadius="full" transition="width 0.5s cubic-bezier(0.22, 1, 0.36, 1)" />
      </Box>
    </Box>
  );
}

function FlowRow({ flow, icon, title, status, children, advice }) {
  return (
    <Box display="grid" gridTemplateColumns={{ base: '1fr', md: '170px 1fr' }} gap={{ base: 3, md: 5 }} py={4}>
      <Flex align="center" gap={3} alignSelf="start">
        <Flex boxSize="36px" borderRadius="lg" bg={`${flow}.bg`} color={`${flow}.fg`} align="center" justify="center" flexShrink={0}>
          <Icon as={icon} boxSize={4} />
        </Flex>
        <Box>
          <Text fontFamily="heading" fontWeight="700" fontSize="md" lineHeight="1.2">{title}</Text>
          <Text fontSize="xs" color={`${flow}.fg`} fontWeight="600">{status}</Text>
        </Box>
      </Flex>
      <VStack align="stretch" spacing={3}>
        {children}
        <Text fontSize="sm" color="text.muted" maxW="65ch">{advice}</Text>
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
    <Card variant="flat" h="100%">
      <CardBody>
        <Flex justify="space-between" align="center" mb={1}>
          <Heading as="h2" size="md">Today&apos;s flows</Heading>
          <Button size="sm" variant="ghost" leftIcon={<FiEdit2 />} onClick={onEditGoals}>
            Edit goals
          </Button>
        </Flex>
        <Box sx={{ '& > * + *': { borderTopWidth: '1px', borderColor: 'border.subtle' } }}>
          <FlowRow flow="fuel" icon={FiCoffee} title="Fuel" status={fuelStatus} advice={actions.nutritionSuggestion}>
            <Meter label="Calories" value={today.calories} goal={goals.dailyCalories} unit="kcal" flow="fuel" />
            <Meter label="Protein" value={today.protein} goal={goals.dailyProtein} unit="g" flow="fuel" />
          </FlowRow>
          <FlowRow
            flow="train"
            icon={FiActivity}
            title="Train"
            status={trainStatus}
            advice={`${actions.workoutIntensity} intensity today. ${actions.workoutDetail}`}
          >
            <Meter label="Workouts in the last 7 days" value={today.weeklyWorkouts} goal={goals.weeklyWorkouts} unit="sessions" flow="train" />
          </FlowRow>
          <FlowRow
            flow="recover"
            icon={FiMoon}
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
