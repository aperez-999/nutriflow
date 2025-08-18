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
  CardHeader,
  Image,
  Badge,
  Button,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  HStack,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FaDumbbell, FaRunning, FaHeartbeat, FaFireAlt, FaPlay, FaCheckCircle, FaYoutube, FaStopwatch, FaFire } from 'react-icons/fa';
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

    // Listen for AI recommendations updates from chat
    const handler = (e) => {
      const workouts = Array.isArray(e.detail) ? e.detail : [];
      setAiWorkouts(workouts);
      setAiGeneratedAt(new Date());
      // Smooth scroll to recommendations section
      if (recSectionRef.current) {
        recSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('ai-recommendations-updated', handler);

    return () => {
      isMounted = false;
      window.removeEventListener('ai-recommendations-updated', handler);
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

          {/* AI Recommendations */}
          <Card id="ai-recommendations-section" ref={recSectionRef} bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" boxShadow="lg">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="lg" color={headingColor}>AI Recommendations</Heading>
                  <Button colorScheme="teal" onClick={() => window.dispatchEvent(new CustomEvent('nf-ai-recommendations'))}>
                    Get AI Recommendations
                  </Button>
                </HStack>
                <Text color={textColor}>Personalized plans and workouts based on your recent activity.</Text>
                {aiWorkouts.length > 0 && (
                  <VStack align="stretch" spacing={4} mt={2}>
                    <Text color={textColor} fontSize="sm">
                      Generated {aiGeneratedAt ? aiGeneratedAt.toLocaleString() : ''}
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      {aiWorkouts.map((workout, index) => (
                        <WorkoutCard
                          key={`ai-card-${index}`}
                          workout={workout}
                          index={index}
                          onViewDetails={(workout) => {
                            setActiveWorkout(workout);
                            onOpen();
                          }}
                        />
                      ))}
                    </SimpleGrid>
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>

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