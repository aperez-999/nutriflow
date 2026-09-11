import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Stack,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Skeleton,
  Icon,
  Select,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiActivity, FiChevronLeft, FiChevronRight, FiCoffee, FiTrash2 } from 'react-icons/fi';
import PlanCard from './PlanCard';
import MealPlanCard from './MealPlanCard';
import WorkoutCard from './WorkoutCard';

const cardHoverStyles = {
  _hover: { transform: 'translateY(-2px)', boxShadow: 'lg' },
  transition: 'all 0.2s ease',
};

/**
 * Fitness Hub — Your AI Generated Plans card (loading, list, empty state).
 */
export default function FitnessHubPlansSection({
  sectionRef,
  recommendationsLoading,
  aiWorkouts,
  aiGeneratedAt,
  onViewDetails,
  savedPlans = [],
  activePlanId = null,
  onSelectPlan,
  onDeletePlan,
  onCompleteWorkout,
  savedMealPlans = [],
  activeMealPlanId = null,
  onSelectMealPlan,
  onDeleteMealPlan,
  onCompleteMeal,
  mealPlansLoading = false,
  getWorkoutState,
  getMealState,
  compact = false,
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const badgeBg = useColorModeValue('teal.50', 'teal.900');
  const badgeColor = useColorModeValue('teal.700', 'teal.200');
  const overviewItems = aiWorkouts.map((workout, index) => {
    if (typeof workout.title === 'string' && workout.title.trim()) return workout.title.trim();
    if (Array.isArray(workout.focusAreas) && workout.focusAreas.length > 0) {
      return workout.focusAreas.join(' / ');
    }
    if (typeof workout.description === 'string' && workout.description.trim()) {
      return workout.description.trim();
    }
    return `Workout ${index + 1}`;
  });
  const activePlanIndex = savedPlans.findIndex((plan) => plan.id === activePlanId);
  const activeMealPlanIndex = savedMealPlans.findIndex((plan) => plan.id === activeMealPlanId);
  const activeMealPlan = savedMealPlans.find((plan) => plan.id === activeMealPlanId) || savedMealPlans[0] || null;

  return (
    <Box ref={sectionRef} id="ai-recommendations-section">
      <Text fontSize="sm" fontWeight="600" color={headingColor} letterSpacing="wider" mb={3}>
        AI GENERATED PLANS
      </Text>
      <VStack align="stretch" spacing={6}>
        <Card
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
          borderRadius="xl"
          boxShadow="sm"
          {...cardHoverStyles}
        >
          <CardBody>
            <VStack align="stretch" spacing={6}>
            <Stack direction={{ base: 'column', md: compact ? 'column' : 'row' }} justify="space-between" gap={3}>
              <VStack align="start" spacing={2}>
                <Heading size="sm" fontWeight="600" color={headingColor}>
                  Your AI Generated Plans
                </Heading>
                <Text color={textColor} fontSize="sm">
                  Weekly plans generated from chat are stored here so you can revisit them without losing the thread.
                </Text>
              </VStack>
              {savedPlans.length > 0 ? (
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={2} align={{ base: 'stretch', sm: 'center' }}>
                  <Select
                    size="sm"
                    value={activePlanId || ''}
                    onChange={(e) => onSelectPlan?.(e.target.value)}
                    minW={{ base: '100%', sm: '220px' }}
                    borderColor={borderColor}
                  >
                    {savedPlans.map((plan, index) => (
                      <option key={plan.id} value={plan.id}>
                        {index + 1}. {plan.title}
                      </option>
                    ))}
                  </Select>
                  <HStack spacing={1}>
                    <IconButton
                      aria-label="Previous plan"
                      size="sm"
                      icon={<FiChevronLeft />}
                      variant="ghost"
                      isDisabled={activePlanIndex >= savedPlans.length - 1 || activePlanIndex === -1}
                      onClick={() => onSelectPlan?.(savedPlans[activePlanIndex + 1].id)}
                    />
                    <IconButton
                      aria-label="Next plan"
                      size="sm"
                      icon={<FiChevronRight />}
                      variant="ghost"
                      isDisabled={activePlanIndex <= 0}
                      onClick={() => onSelectPlan?.(savedPlans[activePlanIndex - 1].id)}
                    />
                    <IconButton
                      aria-label="Delete plan"
                      size="sm"
                      icon={<FiTrash2 />}
                      variant="ghost"
                      onClick={() => activePlanId && onDeletePlan?.(activePlanId)}
                    />
                  </HStack>
                </Stack>
              ) : null}
            </Stack>

            {recommendationsLoading && (
              <VStack spacing={4} py={8} w="100%">
                <Spinner size="lg" colorScheme="teal" thickness="3px" />
                <Text color={textColor} fontSize="sm">AI Coach is generating your weekly plan...</Text>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="100%">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height="200px" borderRadius="lg" />
                  ))}
                </SimpleGrid>
              </VStack>
            )}

            {!recommendationsLoading && aiWorkouts.length > 0 && (
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between" flexWrap="wrap" gap={2}>
                  <Text color={textColor} fontSize="sm">
                    Generated {aiGeneratedAt ? aiGeneratedAt.toLocaleString() : ''}
                  </Text>
                  <Box px={3} py={1} bg={badgeBg} color={badgeColor} borderRadius="full" fontSize="xs" fontWeight="600">
                    {aiWorkouts.length} plans ready
                  </Box>
                </HStack>
                <Box w="100%">
                  <PlanCard
                    title="Plan Overview"
                    items={overviewItems}
                  />
                </Box>
                <SimpleGrid columns={{ base: 1, md: compact ? 1 : 2, lg: compact ? 1 : 2 }} spacing={4} w="100%">
                  {aiWorkouts.map((workout, index) => (
                    <WorkoutCard
                      key={`ai-card-${index}`}
                      workout={workout}
                      index={index}
                      onViewDetails={onViewDetails}
                      onComplete={() => onCompleteWorkout?.(workout, index)}
                      isCompleted={Boolean(getWorkoutState?.(index)?.completed)}
                      isCompleting={Boolean(getWorkoutState?.(index)?.loading)}
                    />
                  ))}
                </SimpleGrid>
              </VStack>
            )}

            {!recommendationsLoading && aiWorkouts.length === 0 && (
              <VStack py={10} spacing={4} w="100%">
                <Icon as={FiActivity} boxSize={12} color={textColor} opacity={0.6} />
                <Text color={textColor} fontSize="sm" textAlign="center" maxW="320px">
                  No plans generated yet.
                  {' '}
                  Ask the AI coach to generate a weekly plan or meal plan.
                </Text>
              </VStack>
            )}
            </VStack>
          </CardBody>
        </Card>

        <Card
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
          borderRadius="xl"
          boxShadow="sm"
          {...cardHoverStyles}
        >
          <CardBody>
            <VStack align="stretch" spacing={5}>
              <Stack direction={{ base: 'column', md: compact ? 'column' : 'row' }} justify="space-between" gap={3}>
                <VStack align="start" spacing={2}>
                  <HStack spacing={2}>
                    <Icon as={FiCoffee} color={badgeColor} />
                    <Heading size="sm" fontWeight="600" color={headingColor}>
                      Your AI Meal Plans
                    </Heading>
                  </HStack>
                  <Text color={textColor} fontSize="sm">
                    Meal plans generated in chat stay here so each meal can be logged in one click.
                  </Text>
                </VStack>
                {savedMealPlans.length > 0 ? (
                  <Stack direction={{ base: 'column', sm: 'row' }} spacing={2} align={{ base: 'stretch', sm: 'center' }}>
                    <Select
                      size="sm"
                      value={activeMealPlanId || ''}
                      onChange={(e) => onSelectMealPlan?.(e.target.value)}
                      minW={{ base: '100%', sm: '220px' }}
                      borderColor={borderColor}
                    >
                      {savedMealPlans.map((plan, index) => (
                        <option key={plan.id} value={plan.id}>
                          {index + 1}. {plan.title}
                        </option>
                      ))}
                    </Select>
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Previous meal plan"
                        size="sm"
                        icon={<FiChevronLeft />}
                        variant="ghost"
                        isDisabled={activeMealPlanIndex >= savedMealPlans.length - 1 || activeMealPlanIndex === -1}
                        onClick={() => onSelectMealPlan?.(savedMealPlans[activeMealPlanIndex + 1].id)}
                      />
                      <IconButton
                        aria-label="Next meal plan"
                        size="sm"
                        icon={<FiChevronRight />}
                        variant="ghost"
                        isDisabled={activeMealPlanIndex <= 0}
                        onClick={() => onSelectMealPlan?.(savedMealPlans[activeMealPlanIndex - 1].id)}
                      />
                      <IconButton
                        aria-label="Delete meal plan"
                        size="sm"
                        icon={<FiTrash2 />}
                        variant="ghost"
                        onClick={() => activeMealPlanId && onDeleteMealPlan?.(activeMealPlanId)}
                      />
                    </HStack>
                  </Stack>
                ) : null}
              </Stack>

              {mealPlansLoading ? (
                <VStack spacing={4} py={8} w="100%">
                  <Spinner size="lg" colorScheme="orange" thickness="3px" />
                  <Text color={textColor} fontSize="sm">
                    AI Coach is building your meal plan...
                  </Text>
                </VStack>
              ) : activeMealPlan ? (
                <MealPlanCard
                  title={activeMealPlan.title}
                  calories={activeMealPlan.calories}
                  meals={activeMealPlan.meals}
                  onCompleteMeal={onCompleteMeal}
                  getMealState={getMealState}
                />
              ) : (
                <VStack py={10} spacing={4} w="100%">
                  <Icon as={FiCoffee} boxSize={12} color={textColor} opacity={0.6} />
                  <Text color={textColor} fontSize="sm" textAlign="center" maxW="320px">
                    No meal plans generated yet. Ask the AI coach for a meal plan to log meals faster.
                  </Text>
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
