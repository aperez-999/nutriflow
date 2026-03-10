import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Container, Heading, Text, VStack, useColorModeValue, useDisclosure, useToast } from '@chakra-ui/react';
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
  const textColor = useColorModeValue('gray.600', 'gray.400');

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

  const filteredExercises = DISCOVERY_EXERCISES.filter((ex) => {
    if (discoveryMuscle && ex.muscleGroup !== discoveryMuscle) return false;
    if (discoveryEquipment && ex.equipment !== discoveryEquipment) return false;
    if (discoveryDifficulty && ex.difficulty !== discoveryDifficulty) return false;
    return true;
  });

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={0} align="stretch">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
            mt={0}
          >
            <Heading size="2xl" mb={4} bgGradient="linear(to-r, teal.400, blue.500)" bgClip="text">
              Fitness Hub
            </Heading>
            <Text fontSize="xl" color={textColor} maxW="2xl" mx="auto">
              Discover workouts, learn proper form, and achieve your fitness goals with our comprehensive exercise
              library.
            </Text>
          </MotionBox>

          <FitnessHubChatSection userWorkouts={userWorkouts} userDiets={userDiets} toast={toast} />
          <FitnessHubInsightsSection insights={[]} />
          <FitnessHubPlansSection
            sectionRef={recSectionRef}
            recommendationsLoading={recommendationsLoading}
            aiWorkouts={aiWorkouts}
            aiGeneratedAt={aiGeneratedAt}
            onViewDetails={handleViewDetails}
            onGetRecommendations={handleGetRecommendations}
          />

          <ExerciseDetailsModal
            isOpen={isOpen}
            onClose={handleCloseDetails}
            workout={activeWorkout}
          />

          <FitnessHubDiscoverySection
            muscle={discoveryMuscle}
            equipment={discoveryEquipment}
            difficulty={discoveryDifficulty}
            onMuscleChange={setDiscoveryMuscle}
            onEquipmentChange={setDiscoveryEquipment}
            onDifficultyChange={setDiscoveryDifficulty}
            filteredExercises={filteredExercises}
          />
        </VStack>
      </Container>
    </Box>
  );
}

export default FitnessHub;
