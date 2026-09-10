import React from 'react';
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
import { FiActivity, FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import PlanCard from './PlanCard';
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

  return (
    <Box ref={sectionRef} id="ai-recommendations-section">
      <Text fontSize="sm" fontWeight="600" color={headingColor} letterSpacing="wider" mb={3}>
        AI GENERATED PLANS
      </Text>
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
    </Box>
  );
}
