import { useMemo, useState } from 'react';
import { Box, Button, Card, CardBody, Flex, Grid, Heading, HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { ConfirmDeleteButton } from '../Dashboard/components/EntryRow';
import { DURATION, EASE_OUT } from '../Motion/tokens';
import { SwapIn } from '../Motion';
import AnatomyFigure from './AnatomyFigure';
import { describeMuscles } from './anatomy';
import { exerciseName, planMuscles, planProgress } from './planUtils';

const MotionBox = motion(Box);
const KINDS = [
  { key: 'training', label: 'Training', flow: 'train' },
  { key: 'meals', label: 'Meals', flow: 'fuel' },
];
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const shortDate = (iso) => new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
const enter = (i = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.base, ease: EASE_OUT, delay: Math.min(i, 8) * 0.04 },
});

/** One segment per session or meal, filled as each is logged. */
function SegmentBar({ items, flow }) {
  return (
    <Flex gap="3px" h="8px" aria-hidden="true">
      {items.map((item, i) => (
        <Box key={i} flex="1" borderRadius="2px" bg="bg.muted" overflow="hidden">
          <MotionBox
            h="100%"
            bg={`${flow}.solid`}
            style={{ originX: 0 }}
            initial={false}
            animate={{ scaleX: item?.completedRecordId ? 1 : 0 }}
            transition={{ duration: DURATION.slow, ease: EASE_OUT }}
          />
        </Box>
      ))}
    </Flex>
  );
}

/** A saved plan on the shelf: pick it to show it below. */
function PlanTile({ title, generatedAt, items, flow, unit, isActive, onSelect }) {
  const { done, total } = planProgress(items);
  return (
    <Box
      as="button"
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      textAlign="left"
      w={{ base: '220px', md: '240px' }}
      flexShrink={0}
      p={4}
      bg="bg.surface"
      borderWidth="1px"
      borderColor={isActive ? 'fg' : 'border'}
      boxShadow={isActive ? '0 0 0 1px var(--chakra-colors-fg)' : 'none'}
      borderRadius="panel"
      transition="border-color 0.15s ease"
      _hover={{ borderColor: isActive ? 'fg' : 'border.strong' }}
      _focusVisible={{ outline: 'none', boxShadow: '0 0 0 2px var(--chakra-colors-focus-ring)' }}
    >
      <Text fontSize="xs" color="fg.muted">{shortDate(generatedAt)}</Text>
      <Text fontWeight="700" noOfLines={1} mt={0.5}>{title}</Text>
      <Text fontSize="sm" color="fg.muted" mb={3}>{done} of {plural(total, unit)} logged</Text>
      <SegmentBar items={items} flow={flow} />
    </Box>
  );
}

function SessionCard({ workout, index, state, onLog, onOpen }) {
  const exercises = workout.exercises || [];
  const meta = [workout.duration && `${workout.duration} min`, workout.intensity && String(workout.intensity).toLowerCase()]
    .filter(Boolean).join(', ');
  return (
    <Box
      bg={state.completed ? 'train.subtle' : 'bg.surface'}
      borderWidth="1px"
      borderColor={state.completed ? 'transparent' : 'border'}
      borderRadius="panel"
      p={4}
      h="100%"
      display="flex"
      flexDirection="column"
      gap={3}
      transition="background-color 0.25s ease"
    >
      <Flex justify="space-between" align="flex-start" gap={3}>
        <Box minW={0}>
          <Text fontSize="xs" fontWeight="700" color="train.fg">Session {index + 1}</Text>
          <Text fontWeight="700" noOfLines={2} mt={0.5}>{workout.title || `Session ${index + 1}`}</Text>
          {meta && <Text fontSize="sm" color="fg.muted">{meta}</Text>}
        </Box>
        {state.completed && (
          <Flex boxSize="28px" borderRadius="full" bg="train.solid" color="white" align="center" justify="center" flexShrink={0} aria-hidden="true">
            <FiCheck />
          </Flex>
        )}
      </Flex>
      {exercises.length > 0 && (
        <Box as="ul" listStyleType="none" fontSize="sm">
          {exercises.slice(0, 4).map((exercise, i) => (
            <Flex as="li" key={i} justify="space-between" gap={3} py={1} borderTopWidth={i ? '1px' : 0} borderColor="border">
              <Text noOfLines={1}>{exerciseName(exercise)}</Text>
              {exercise?.sets && exercise?.reps && (
                <Text color="fg.muted" flexShrink={0} sx={{ fontVariantNumeric: 'tabular-nums' }}>{exercise.sets} × {exercise.reps}</Text>
              )}
            </Flex>
          ))}
          {exercises.length > 4 && <Text as="li" color="fg.muted" pt={1}>and {exercises.length - 4} more</Text>}
        </Box>
      )}
      <HStack mt="auto" spacing={2}>
        <Button
          size="sm"
          variant={state.completed ? 'ghost' : 'solid'}
          isDisabled={state.completed}
          isLoading={state.loading}
          loadingText="Logging"
          onClick={() => onLog(workout, index)}
        >
          {state.completed ? 'Logged' : 'Log session'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onOpen(workout, index)}>Details</Button>
      </HStack>
    </Box>
  );
}

function MealCard({ meal, index, state, onLog }) {
  return (
    <Box
      bg={state.completed ? 'fuel.subtle' : 'bg.surface'}
      borderWidth="1px"
      borderColor={state.completed ? 'transparent' : 'border'}
      borderRadius="panel"
      p={4}
      display="flex"
      flexDirection="column"
      gap={3}
      h="100%"
      transition="background-color 0.25s ease"
    >
      <Flex justify="space-between" align="flex-start" gap={3}>
        <Box minW={0}>
          <Text fontSize="xs" fontWeight="700" color="fuel.fg">{meal.mealType || `Meal ${index + 1}`}</Text>
          <Text fontWeight="700" noOfLines={3} mt={0.5}>{meal.foodName}</Text>
        </Box>
        {state.completed && (
          <Flex boxSize="28px" borderRadius="full" bg="fuel.solid" color="white" align="center" justify="center" flexShrink={0} aria-hidden="true">
            <FiCheck />
          </Flex>
        )}
      </Flex>
      <Box mt="auto">
        <Button
          size="sm"
          variant={state.completed ? 'ghost' : 'outline'}
          isDisabled={state.completed}
          isLoading={state.loading}
          loadingText="Logging"
          onClick={() => onLog(meal, index)}
        >
          {state.completed ? 'Logged' : 'Log meal'}
        </Button>
      </Box>
    </Box>
  );
}

function EmptyPlans({ kind }) {
  const training = kind === 'training';
  return (
    <Card>
      <CardBody>
        <Heading as="h2" size="sm">{training ? 'No training plans yet' : 'No meal plans yet'}</Heading>
        <Text color="fg.muted" fontSize="sm" mt={1} maxW="52ch">
          {training
            ? 'In Coach, tap “Plan my training week”. The plan lands here, ready to log one session at a time.'
            : 'In Coach, tap “Make a meal plan”. Each meal lands here and logs in one tap.'}
        </Text>
        <Button as={RouterLink} to="/fitness-hub" size="sm" variant="outline" mt={4}>Open Coach</Button>
      </CardBody>
    </Card>
  );
}

function PlanHeader({ title, detail, items, flow, onDelete }) {
  const { done, total } = planProgress(items);
  return (
    <Box>
      <Flex justify="space-between" align="flex-start" gap={3}>
        <Box minW={0}>
          <Heading as="h2" fontSize={{ base: '3xl', md: '4xl' }} lineHeight="1" noOfLines={2}>{title}</Heading>
          <Text color="fg.muted" fontSize="sm" mt={2}>{detail}</Text>
        </Box>
        <ConfirmDeleteButton label={title} onConfirm={onDelete} />
      </Flex>
      <Flex align="center" gap={3} mt={4}>
        <Box flex="1"><SegmentBar items={items} flow={flow} /></Box>
        <Text fontSize="sm" fontWeight="700" flexShrink={0}>{done}/{total}</Text>
      </Flex>
    </Box>
  );
}

/**
 * The Plans tab: a shelf of saved plans per kind, and the chosen plan laid out as
 * a grid you can log from. Training plans also show the muscles the week works.
 */
export default function PlansView({ library, catalog, onOpenSession }) {
  const {
    savedPlans, activePlan, setActivePlanId, deletePlan, recommendationsLoading,
    savedMealPlans, activeMealPlan, setActiveMealPlanId, deleteMealPlan, mealPlansLoading,
    handleCompleteWorkout, handleCompleteMeal, getWorkoutState, getMealState,
  } = library;
  const [kind, setKind] = useState(savedPlans.length || !savedMealPlans.length ? 'training' : 'meals');
  const muscles = useMemo(() => planMuscles(activePlan?.workouts, catalog), [activePlan, catalog]);
  const counts = { training: savedPlans.length, meals: savedMealPlans.length };
  const isTraining = kind === 'training';
  const loading = isTraining ? recommendationsLoading : mealPlansLoading;
  const plans = isTraining ? savedPlans : savedMealPlans;
  const active = isTraining ? activePlan : activeMealPlan;

  return (
    <VStack align="stretch" spacing={6}>
      <HStack role="radiogroup" aria-label="Plan type" spacing={1} p={1} bg="bg.muted" borderRadius="full" alignSelf="flex-start">
        {KINDS.map((item) => {
          const selected = kind === item.key;
          return (
            <Box
              as="button"
              type="button"
              key={item.key}
              role="radio"
              aria-checked={selected}
              onClick={() => setKind(item.key)}
              position="relative"
              px={4}
              py={1.5}
              borderRadius="full"
              fontSize="sm"
              fontWeight="600"
              color={selected ? 'fg' : 'fg.muted'}
              _focusVisible={{ outline: 'none', boxShadow: '0 0 0 2px var(--chakra-colors-focus-ring)' }}
            >
              {selected && (
                <MotionBox layoutId="plan-kind" position="absolute" inset={0} bg="bg.surface" borderRadius="full" borderWidth="1px" borderColor="border" transition={{ duration: DURATION.base, ease: EASE_OUT }} />
              )}
              <HStack as="span" position="relative" zIndex={1} spacing={2}>
                <Box as="span" boxSize="8px" borderRadius="2px" bg={`${item.flow}.solid`} />
                <span>{item.label}</span>
                <Text as="span" color="fg.muted" fontWeight="500">{counts[item.key]}</Text>
              </HStack>
            </Box>
          );
        })}
      </HStack>

      {(plans.length > 0 || loading) && (
        <HStack spacing={3} overflowX="auto" pb={1} mx={{ base: -4, md: 0 }} px={{ base: 4, md: 0 }} sx={{ scrollbarWidth: 'thin' }} aria-label={isTraining ? 'Training plans' : 'Meal plans'}>
          {loading && <Skeleton w={{ base: '220px', md: '240px' }} h="112px" borderRadius="panel" flexShrink={0} />}
          {plans.map((plan) => (
            <PlanTile
              key={plan.id}
              title={plan.title}
              generatedAt={plan.generatedAt}
              items={isTraining ? plan.workouts : plan.meals}
              flow={isTraining ? 'train' : 'fuel'}
              unit={isTraining ? 'session' : 'meal'}
              isActive={plan.id === active?.id}
              onSelect={() => (isTraining ? setActivePlanId(plan.id) : setActiveMealPlanId(plan.id))}
            />
          ))}
        </HStack>
      )}

      {/* Switching kind or plan swaps the body in fresh; no exit, so old and new never overlap. */}
      <SwapIn key={`${kind}-${active?.id || 'none'}`}>
          {!active && !loading && <EmptyPlans kind={kind} />}

          {active && isTraining && (
            <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 300px' }} gap={6} alignItems="start">
              <VStack align="stretch" spacing={5}>
                <PlanHeader
                  title={active.title}
                  detail={`Saved ${shortDate(active.generatedAt)}, ${plural(active.workouts.length, 'session')}, ${active.workouts.reduce((sum, w) => sum + (Number(w.duration) || 0), 0)} min in total`}
                  items={active.workouts}
                  flow="train"
                  onDelete={() => deletePlan(active.id)}
                />
                <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }} gap={3}>
                  {active.workouts.map((workout, index) => (
                    <MotionBox key={index} {...enter(index)}>
                      <SessionCard
                        workout={workout}
                        index={index}
                        state={getWorkoutState(index)}
                        onLog={handleCompleteWorkout}
                        onOpen={onOpenSession}
                      />
                    </MotionBox>
                  ))}
                </Grid>
              </VStack>
              <Card position={{ lg: 'sticky' }} top={{ lg: '88px' }}>
                <CardBody>
                  <Heading as="h3" size="sm">What this plan trains</Heading>
                  {muscles.primary.length > 0 ? (
                    <>
                      <Box bg="bg.canvas" borderRadius="panel" py={4} mt={3}>
                        <AnatomyFigure primary={muscles.primary} secondary={muscles.secondary} height={200} showLegend />
                      </Box>
                      <Text fontSize="sm" mt={3}>{describeMuscles(muscles.primary, muscles.secondary)}</Text>
                    </>
                  ) : (
                    <Text fontSize="sm" color="fg.muted" mt={1}>None of this plan’s exercises are in the library yet, so there is no muscle map.</Text>
                  )}
                  {muscles.total > 0 && (
                    <Text fontSize="xs" color="fg.muted" mt={1}>From {muscles.matched} of {muscles.total} exercises found in the library.</Text>
                  )}
                </CardBody>
              </Card>
            </Grid>
          )}

          {active && !isTraining && (
            <VStack align="stretch" spacing={5}>
              <PlanHeader
                title={active.title}
                detail={`Saved ${shortDate(active.generatedAt)}, ${plural(active.meals.length, 'meal')}${active.calories ? `, about ${Number(active.calories).toLocaleString()} kcal` : ''}`}
                items={active.meals}
                flow="fuel"
                onDelete={() => deleteMealPlan(active.id)}
              />
              <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }} gap={3}>
                {active.meals.map((meal, index) => (
                  <MotionBox key={index} {...enter(index)}>
                    <MealCard meal={meal} index={index} state={getMealState(index)} onLog={handleCompleteMeal} />
                  </MotionBox>
                ))}
              </Grid>
              {active.meals.length === 0 && <Text fontSize="sm" color="fg.muted">This plan has no meals yet.</Text>}
            </VStack>
          )}
      </SwapIn>
    </VStack>
  );
}
