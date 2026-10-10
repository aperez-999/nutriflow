import {
  Box,
  Button,
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
  Select,
  IconButton,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { ConfirmDeleteButton } from '../Dashboard/components/EntryRow';
import PlanCard from './PlanCard';
import MealPlanCard from './MealPlanCard';
import WorkoutCard from './WorkoutCard';

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
  mealPlansOnly = false,
  workoutPlansOnly = false,
}) {
  const borderColor = 'border';
  const headingColor = 'fg';
  const textColor = 'fg.muted';
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
      <VStack align="stretch" spacing={6}>
        {/* Workout Plans card — hidden when mealPlansOnly */}
        {!mealPlansOnly && (
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={6}>
            <Stack direction={{ base: 'column', md: compact ? 'column' : 'row' }} justify="space-between" gap={3}>
              <VStack align="start" spacing={2}>
                <Heading as="h2" size="sm" color={headingColor}>
                  Training plans
                </Heading>
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
                    <ConfirmDeleteButton
                      label={savedPlans[activePlanIndex]?.title || 'this plan'}
                      onConfirm={() => activePlanId && onDeletePlan?.(activePlanId)}
                    />
                  </HStack>
                </Stack>
              ) : null}
            </Stack>

            {recommendationsLoading && (
              <VStack spacing={4} py={8} w="100%">
                <Spinner size="md" color="fg.muted" />
                <Text color={textColor} fontSize="sm">Building your week from your log</Text>
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
                  <Text color={textColor} fontSize="sm">{aiWorkouts.length} sessions</Text>
                </HStack>
                <Box w="100%">
                  <PlanCard
                    title="This week"
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
              <Box>
                <Text color={textColor} fontSize="sm">
                  None yet. In Coach, tap &ldquo;Plan my training week&rdquo; and the plan lands here, ready to log.
                </Text>
                <Button as={RouterLink} to="/fitness-hub" size="sm" variant="outline" mt={3}>Open Coach</Button>
              </Box>
            )}
            </VStack>
          </CardBody>
        </Card>
        )}

        {/* Meal Plans card — hidden when workoutPlansOnly */}
        {!workoutPlansOnly && (
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={5}>
              <Stack direction={{ base: 'column', md: compact ? 'column' : 'row' }} justify="space-between" gap={3}>
                <VStack align="start" spacing={2}>
                  <Heading as="h2" size="sm" color={headingColor}>
                    Meal plans
                  </Heading>
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
                      <ConfirmDeleteButton
                        label={activeMealPlan?.title || 'this meal plan'}
                        onConfirm={() => activeMealPlanId && onDeleteMealPlan?.(activeMealPlanId)}
                      />
                    </HStack>
                  </Stack>
                ) : null}
              </Stack>

              {mealPlansLoading ? (
                <VStack spacing={4} py={8} w="100%">
                  <Spinner size="md" color="fg.muted" />
                  <Text color={textColor} fontSize="sm">Building your meal plan</Text>
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
                <Box>
                  <Text color={textColor} fontSize="sm">
                    None yet. In Coach, tap &ldquo;Make a meal plan&rdquo;, then log each meal here in one tap.
                  </Text>
                  <Button as={RouterLink} to="/fitness-hub" size="sm" variant="outline" mt={3}>Open Coach</Button>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
        )}
      </VStack>
    </Box>
  );
}
