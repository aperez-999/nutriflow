import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import FitnessHubChatSection from '../components/FitnessHub/FitnessHubChatSection';
import FitnessHubInsightsSection from '../components/FitnessHub/FitnessHubInsightsSection';
import FitnessHubPlansSection from '../components/FitnessHub/FitnessHubPlansSection';
import FitnessHubDiscoverySection from '../components/FitnessHub/FitnessHubDiscoverySection';
import ExerciseDetailsModal from '../components/FitnessHub/ExerciseDetailsModal';
import { getWorkouts, getDiets } from '../services/api';
import { handleApiError } from '../utils/apiErrorHandler';

const MotionBox = motion(Box);

const DISCOVERY_EXERCISES = [
  { name: 'Push-ups', muscleGroup: 'Chest', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Machines', difficulty: 'Intermediate' },
  { name: 'Pull-ups', muscleGroup: 'Back', equipment: 'Bodyweight', difficulty: 'Advanced' },
  { name: 'Rows', muscleGroup: 'Back', equipment: 'Dumbbells', difficulty: 'Intermediate' },
  { name: 'Squats', muscleGroup: 'Legs', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { name: 'Deadlift', muscleGroup: 'Legs', equipment: 'Dumbbells', difficulty: 'Advanced' },
  { name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { name: 'Crunches', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'Beginner' },
];

function FitnessHub() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [userDiets, setUserDiets] = useState([]);
  const [aiWorkouts, setAiWorkouts] = useState([]);
  const [aiGeneratedAt, setAiGeneratedAt] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const recSectionRef = useRef(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [discoveryMuscle, setDiscoveryMuscle] = useState('');
  const [discoveryEquipment, setDiscoveryEquipment] = useState('');
  const [discoveryDifficulty, setDiscoveryDifficulty] = useState('');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const surfaceBg = useColorModeValue('white', 'gray.800');
  const heroBg = useColorModeValue('linear(to-br, white, teal.50, blue.50)', 'linear(to-br, gray.800, gray.800, blue.900)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const heroTextColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const mutedColor = useColorModeValue('gray.500', 'gray.500');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [workouts, diets] = await Promise.all([
          getWorkouts().catch((err) => {
            handleApiError(err, 'loading workouts', toast);
            return [];
          }),
          getDiets().catch((err) => {
            handleApiError(err, 'loading diets', toast);
            return [];
          }),
        ]);
        if (isMounted) {
          setUserWorkouts(Array.isArray(workouts) ? workouts : []);
          setUserDiets(Array.isArray(diets) ? diets : []);
        }
      } catch (e) {
        handleApiError(e, 'loading Fitness Hub data', toast);
      }
    })();

    const onUpdated = (e) => {
      const workouts = Array.isArray(e.detail) ? e.detail : [];
      setAiWorkouts(workouts);
      setAiGeneratedAt(workouts.length > 0 ? new Date() : null);
      setRecommendationsLoading(false);
      if (recSectionRef.current && workouts.length > 0) {
        recSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    const onLoading = () => setRecommendationsLoading(true);

    window.addEventListener('ai-recommendations-updated', onUpdated);
    window.addEventListener('ai-recommendations-loading', onLoading);

    return () => {
      isMounted = false;
      window.removeEventListener('ai-recommendations-updated', onUpdated);
      window.removeEventListener('ai-recommendations-loading', onLoading);
    };
  }, [toast]);

  const handleCloseDetails = useCallback(() => {
    onClose();
    setActiveWorkout(null);
  }, [onClose]);

  const handleViewDetails = useCallback(
    (workout) => {
      setActiveWorkout(workout);
      onOpen();
    },
    [onOpen]
  );

  const handleGetRecommendations = useCallback(() => {
    window.dispatchEvent(new CustomEvent('nf-ai-recommendations'));
  }, []);

  const filteredExercises = useMemo(
    () =>
      DISCOVERY_EXERCISES.filter((ex) => {
        if (discoveryMuscle && ex.muscleGroup !== discoveryMuscle) return false;
        if (discoveryEquipment && ex.equipment !== discoveryEquipment) return false;
        if (discoveryDifficulty && ex.difficulty !== discoveryDifficulty) return false;
        return true;
      }),
    [discoveryDifficulty, discoveryEquipment, discoveryMuscle]
  );

  const hubStats = useMemo(
    () => [
      { label: 'Logged Workouts', value: userWorkouts.length, hint: 'Used to personalize AI plans' },
      { label: 'Meals Logged', value: userDiets.length, hint: 'Nutrition context for coaching' },
      { label: 'AI Plans Ready', value: aiWorkouts.length, hint: aiWorkouts.length ? 'Fresh recommendations available' : 'Generate your first plan' },
    ],
    [aiWorkouts.length, userDiets.length, userWorkouts.length]
  );

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={8} align="stretch">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            mt={0}
          >
            <Card
              bgGradient={heroBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="2xl"
              boxShadow="xl"
              overflow="hidden"
            >
              <CardBody p={{ base: 6, md: 8 }}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, lg: 10 }} alignItems="center">
                  <VStack align="start" spacing={4}>
                    <Badge colorScheme="teal" variant="subtle" px={3} py={1} borderRadius="full">
                      AI-Powered Fitness Workspace
                    </Badge>
                    <Heading size="2xl" color={heroTextColor} lineHeight="1.05">
                      Fitness Hub
                    </Heading>
                    <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor} maxW="2xl">
                      Manage your coaching conversations, review AI plans, and discover new workouts from one cleaner
                      workspace built to feel more like a polished SaaS dashboard.
                    </Text>
                    <HStack spacing={3} flexWrap="wrap">
                      <Badge colorScheme="blue" variant="outline" px={3} py={1} borderRadius="full">
                        Personalized plans
                      </Badge>
                      <Badge colorScheme="teal" variant="outline" px={3} py={1} borderRadius="full">
                        Chat-driven coaching
                      </Badge>
                      <Badge colorScheme="orange" variant="outline" px={3} py={1} borderRadius="full">
                        Exercise discovery
                      </Badge>
                    </HStack>
                  </VStack>

                  <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                    {hubStats.map((stat) => (
                      <Card
                        key={stat.label}
                        bg={surfaceBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="xl"
                        boxShadow="sm"
                      >
                        <CardBody>
                          <Text fontSize="sm" color={mutedColor} mb={2}>
                            {stat.label}
                          </Text>
                          <Heading size="lg" color={heroTextColor} mb={2}>
                            {stat.value}
                          </Heading>
                          <Text fontSize="sm" color={textColor}>
                            {stat.hint}
                          </Text>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </SimpleGrid>
              </CardBody>
            </Card>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, xl: 12 }} spacing={8}>
            <Box gridColumn={{ base: 'auto', xl: 'span 7' }}>
              <FitnessHubChatSection
                userWorkouts={userWorkouts}
                userDiets={userDiets}
                toast={toast}
                onGetRecommendations={handleGetRecommendations}
                recommendationsLoading={recommendationsLoading}
              />
            </Box>
            <Box gridColumn={{ base: 'auto', xl: 'span 5' }}>
              <FitnessHubPlansSection
                sectionRef={recSectionRef}
                recommendationsLoading={recommendationsLoading}
                aiWorkouts={aiWorkouts}
                aiGeneratedAt={aiGeneratedAt}
                onViewDetails={handleViewDetails}
                onGetRecommendations={handleGetRecommendations}
                compact
              />
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, xl: 12 }} spacing={8}>
            <Box gridColumn={{ base: 'auto', xl: 'span 4' }}>
              <FitnessHubInsightsSection insights={[]} />
            </Box>
            <Box gridColumn={{ base: 'auto', xl: 'span 8' }}>
              <FitnessHubDiscoverySection
                muscle={discoveryMuscle}
                equipment={discoveryEquipment}
                difficulty={discoveryDifficulty}
                onMuscleChange={setDiscoveryMuscle}
                onEquipmentChange={setDiscoveryEquipment}
                onDifficultyChange={setDiscoveryDifficulty}
                filteredExercises={filteredExercises}
              />
            </Box>
          </SimpleGrid>

          <ExerciseDetailsModal
            isOpen={isOpen}
            onClose={handleCloseDetails}
            workout={activeWorkout}
          />
        </VStack>
      </Container>
    </Box>
  );
}

export default FitnessHub;
