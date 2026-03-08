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
} from '@chakra-ui/react';
import { FaDumbbell, FaRunning, FaHeartbeat, FaFireAlt, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AIFitnessChat from '../components/FitnessHub/AIFitnessChat/index.jsx';
import WorkoutCard from '../components/FitnessHub/WorkoutCard';
import ExerciseDetailsModal from '../components/FitnessHub/ExerciseDetailsModal';
import { getWorkouts, getDiets } from '../services/api';

const MotionBox = motion(Box);

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

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Hero Section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
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

          {/* AI Fitness Chat */}
          <AIFitnessChat userWorkouts={userWorkouts} userDiets={userDiets} />

          {/* AI Recommendations — clear separation from chat */}
          <Box ref={recSectionRef} id="ai-recommendations-section" pt={4} borderTopWidth="1px" borderColor={borderColor}>
            <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" boxShadow="lg">
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  <HStack justify="space-between" flexWrap="wrap" gap={2}>
                    <Heading size="lg" color={headingColor}>AI Recommendations</Heading>
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
                    Personalized plans and workouts based on your recent activity.
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
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
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
                    <Text color={textColor} fontSize="sm" fontStyle="italic">
                      Click &quot;Get AI Recommendations&quot; or ask the coach for a workout plan to see suggestions here.
                    </Text>
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
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" boxShadow="lg">
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




        </VStack>
      </Container>
    </Box>
  );
}

export default FitnessHub; 