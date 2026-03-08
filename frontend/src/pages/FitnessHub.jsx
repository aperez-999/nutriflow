import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Card,
  CardBody,
  Button,
  useColorModeValue,
  Icon,
  HStack,
  Spinner,
  Skeleton,
  useDisclosure,
  Select,
  Stack,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FaDumbbell, FaRunning, FaHeartbeat, FaFireAlt, FaCheckCircle } from 'react-icons/fa';
import { FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import AIFitnessChat from '../components/FitnessHub/AIFitnessChat/index.jsx';
import AIInsightsSection from '../components/FitnessHub/AIInsightsSection';
import PlanCard from '../components/FitnessHub/PlanCard';
import WorkoutCard from '../components/FitnessHub/WorkoutCard';
import ExerciseDetailsModal from '../components/FitnessHub/ExerciseDetailsModal';
import { getWorkouts, getDiets } from '../services/api';

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
  // Details modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
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
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('teal.500', 'teal.300');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [workouts, diets] = await Promise.all([
          getWorkouts().catch(() => []),
          getDiets().catch(() => []),
        ]);
        if (isMounted) {
          setUserWorkouts(Array.isArray(workouts) ? workouts : []);
          setUserDiets(Array.isArray(diets) ? diets : []);
        }
      } catch (e) {
        // No-op; UI still works without context
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
  }, []);

  const handleCloseDetails = useCallback(() => {
    onClose();
    setActiveWorkout(null);
  }, [onClose]);

  const filteredExercises = DISCOVERY_EXERCISES.filter((ex) => {
    if (discoveryMuscle && ex.muscleGroup !== discoveryMuscle) return false;
    if (discoveryEquipment && ex.equipment !== discoveryEquipment) return false;
    if (discoveryDifficulty && ex.difficulty !== discoveryDifficulty) return false;
    return true;
  });

  const cardHoverStyles = {
    _hover: { transform: 'translateY(-2px)', boxShadow: 'lg' },
    transition: 'all 0.2s ease',
  };
  const exerciseCardHoverBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={0} align="stretch">
          {/* Hero Section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
            mt={0}
          >
            <Heading
              size="2xl"
              mb={4}
              bgGradient="linear(to-r, teal.400, blue.500)"
              bgClip="text"
            >
              Fitness Hub
            </Heading>
            <Text fontSize="xl" color={textColor} maxW="2xl" mx="auto">
              Discover workouts, learn proper form, and achieve your fitness goals
              with our comprehensive exercise library.
            </Text>
          </MotionBox>

          {/* AI Coach — constrained width for readability on large screens */}
          <Box mt={8} w="100%">
            <VStack align="stretch" spacing={3} w="100%" maxW={{ base: '100%', lg: '720px' }} mx="auto">
              <Text fontSize="sm" fontWeight="600" color={headingColor} letterSpacing="wider">
                AI COACH
              </Text>
              <AIFitnessChat userWorkouts={userWorkouts} userDiets={userDiets} />
            </VStack>
          </Box>

          {/* AI Insights — below chat */}
          <AIInsightsSection insights={[]} />

          {/* Your AI Generated Plans */}
          <Box ref={recSectionRef} id="ai-recommendations-section" mt={8} pt={8} borderTopWidth="1px" borderColor={borderColor}>
            <Text fontSize="sm" fontWeight="600" color={headingColor} letterSpacing="wider" mb={3}>
              YOUR AI GENERATED PLANS
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
                  <HStack justify="space-between" flexWrap="wrap" gap={2}>
                    <Heading size="sm" fontWeight="600" color={headingColor}>
                      Your AI Generated Plans
                    </Heading>
                    <Button
                      colorScheme="teal"
                      onClick={() => window.dispatchEvent(new CustomEvent('nf-ai-recommendations'))}
                      isDisabled={recommendationsLoading}
                      _hover={{ opacity: 0.9 }}
                      transition="opacity 0.2s"
                    >
                      Get AI Recommendations
                    </Button>
                  </HStack>
                  <Text color={textColor} fontSize="sm">
                    Plans and workouts generated by the AI coach based on your activity.
                  </Text>

                  {recommendationsLoading && (
                    <VStack spacing={4} py={8} w="100%">
                      <Spinner size="lg" colorScheme="teal" thickness="3px" />
                      <Text color={textColor} fontSize="sm">AI Coach is generating your plan...</Text>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="100%">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} height="200px" borderRadius="lg" />
                        ))}
                      </SimpleGrid>
                    </VStack>
                  )}

                  {!recommendationsLoading && aiWorkouts.length > 0 && (
                    <VStack align="stretch" spacing={4}>
                      <Text color={textColor} fontSize="sm">
                        Generated {aiGeneratedAt ? aiGeneratedAt.toLocaleString() : ''}
                      </Text>
                      <Box w="100%" maxW="400px">
                        <PlanCard
                          title="Workout Plan"
                          items={aiWorkouts.map((w) => w.workoutName || w.type || 'Session')}
                        />
                      </Box>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="100%">
                        {aiWorkouts.map((workout, index) => (
                          <WorkoutCard
                            key={`ai-card-${index}`}
                            workout={workout}
                            index={index}
                            onViewDetails={(w) => {
                              setActiveWorkout(w);
                              onOpen();
                            }}
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
                        <br />
                        Ask the AI coach to create a workout or meal plan.
                      </Text>
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Details Modal */}
          <ExerciseDetailsModal
            isOpen={isOpen}
            onClose={handleCloseDetails}
            workout={activeWorkout}
          />

          {/* AI-Powered Workout Discovery */}
          <Box mt={8} w="100%">
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" boxShadow="sm" {...cardHoverStyles}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <VStack spacing={3} align="center">
                  <Icon as={FaDumbbell} boxSize={12} color={accentColor} />
                  <Heading size="lg" color={headingColor}>AI-Powered Workout Discovery</Heading>
                  <Text color={textColor} textAlign="center" maxW="600px">
                    Get personalized workout recommendations based on your fitness level, goals, and recent activity.
                    Our AI analyzes your progress and creates custom plans just for you.
                  </Text>
                </VStack>

                <Stack direction={{ base: 'column', md: 'row' }} spacing={4} flexWrap="wrap" align={{ md: 'flex-end' }}>
                  <FormControl maxW="180px">
                    <FormLabel fontSize="sm" color={headingColor}>Muscle Group</FormLabel>
                    <Select
                      placeholder="All"
                      size="sm"
                      value={discoveryMuscle}
                      onChange={(e) => setDiscoveryMuscle(e.target.value)}
                      borderColor={borderColor}
                    >
                      <option value="Chest">Chest</option>
                      <option value="Back">Back</option>
                      <option value="Legs">Legs</option>
                      <option value="Core">Core</option>
                    </Select>
                  </FormControl>
                  <FormControl maxW="180px">
                    <FormLabel fontSize="sm" color={headingColor}>Equipment</FormLabel>
                    <Select
                      placeholder="All"
                      size="sm"
                      value={discoveryEquipment}
                      onChange={(e) => setDiscoveryEquipment(e.target.value)}
                      borderColor={borderColor}
                    >
                      <option value="Bodyweight">Bodyweight</option>
                      <option value="Dumbbells">Dumbbells</option>
                      <option value="Machines">Machines</option>
                    </Select>
                  </FormControl>
                  <FormControl maxW="180px">
                    <FormLabel fontSize="sm" color={headingColor}>Difficulty</FormLabel>
                    <Select
                      placeholder="All"
                      size="sm"
                      value={discoveryDifficulty}
                      onChange={(e) => setDiscoveryDifficulty(e.target.value)}
                      borderColor={borderColor}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </Select>
                  </FormControl>
                </Stack>

                {filteredExercises.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                    {filteredExercises.map((ex, i) => (
                      <Box
                        key={i}
                        p={3}
                        borderRadius="lg"
                        borderWidth="1px"
                        borderColor={borderColor}
                        _hover={{ bg: exerciseCardHoverBg }}
                        transition="all 0.2s ease"
                      >
                        <Text fontWeight="600" color={headingColor} fontSize="sm">{ex.name}</Text>
                        <HStack mt={1} spacing={2} flexWrap="wrap">
                          <Text fontSize="xs" color={textColor}>{ex.muscleGroup}</Text>
                          <Text fontSize="xs" color={textColor}>·</Text>
                          <Text fontSize="xs" color={textColor}>{ex.equipment}</Text>
                          <Text fontSize="xs" color={textColor}>·</Text>
                          <Text fontSize="xs" color={textColor}>{ex.difficulty}</Text>
                        </HStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text fontSize="sm" color={textColor}>
                    No exercises match the selected filters. Try changing muscle group, equipment, or difficulty.
                  </Text>
                )}

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <VStack spacing={4} align="start">
                    <HStack spacing={3}>
                      <Icon as={FaHeartbeat} boxSize={6} color="red.500" />
                      <Text fontWeight="semibold" color={headingColor}>Personalized Plans</Text>
                    </HStack>
                    <Text color={textColor} fontSize="sm">
                      AI-generated workouts tailored to your fitness level, available equipment, and specific goals.
                    </Text>
                  </VStack>
                  
                  <VStack spacing={4} align="start">
                    <HStack spacing={3}>
                      <Icon as={FaRunning} boxSize={6} color="green.500" />
                      <Text fontWeight="semibold" color={headingColor}>Progress Tracking</Text>
                    </HStack>
                    <Text color={textColor} fontSize="sm">
                      Monitor your improvements and get recommendations that adapt to your evolving fitness journey.
                    </Text>
                  </VStack>
                  
                  <VStack spacing={4} align="start">
                    <HStack spacing={3}>
                      <Icon as={FaFireAlt} boxSize={6} color="orange.500" />
                      <Text fontWeight="semibold" color={headingColor}>Variety & Challenge</Text>
                    </HStack>
                    <Text color={textColor} fontSize="sm">
                      Discover new exercises and workout styles to keep your routine fresh and engaging.
                    </Text>
                  </VStack>
                  
                  <VStack spacing={4} align="start">
                    <HStack spacing={3}>
                      <Icon as={FaCheckCircle} boxSize={6} color="teal.500" />
                      <Text fontWeight="semibold" color={headingColor}>Form & Safety</Text>
                    </HStack>
                    <Text color={textColor} fontSize="sm">
                      Get tips on proper technique and form to maximize results while preventing injuries.
                    </Text>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default FitnessHub; 