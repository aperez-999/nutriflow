import React, { useState, useCallback } from 'react';
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
  ModalCloseButton,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FaDumbbell, FaRunning, FaHeartbeat, FaFireAlt, FaPlay, FaCheckCircle, FaYoutube, FaStopwatch, FaFire } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const workoutCategories = [
  {
    title: "Strength Training",
    icon: FaDumbbell,
    description: "Build muscle and increase strength",
    workouts: [
      {
        name: "Full Body Workout",
        difficulty: "Beginner",
        duration: "45-60 min",
        calories: "300-400",
        image: "/images/full-body.jpg",
        videoUrl: "https://www.youtube.com/watch?v=eTxO5ZMxcsc",
        exercises: [
          {
            name: "Barbell Squats",
            sets: "3",
            reps: "12",
            tips: ["Keep your back straight", "Feet shoulder-width apart", "Push through your heels"]
          },
          {
            name: "Bench Press",
            sets: "3",
            reps: "10",
            tips: ["Retract shoulder blades", "Keep wrists straight", "Touch mid-chest"]
          },
          {
            name: "Bent-Over Rows",
            sets: "3",
            reps: "12",
            tips: ["Keep back parallel to ground", "Pull to belly button", "Squeeze shoulder blades"]
          },
          {
            name: "Overhead Press",
            sets: "3",
            reps: "10",
            tips: ["Core tight", "Full lockout", "Keep natural back arch"]
          }
        ]
      },
      {
        name: "Core & Abs Focus",
        difficulty: "Intermediate",
        duration: "30 min",
        calories: "200-250",
        image: "/images/core-workout.jpg",
        videoUrl: "https://www.youtube.com/watch?v=9p7-YC91Q74",
        exercises: [
          {
            name: "Planks",
            sets: "3",
            duration: "45 seconds",
            videoUrl: "https://youtube.com/watch?v=placeholder2",
            tips: ["Keep body straight", "Engage core", "Breathe steadily"]
          },
          {
            name: "Cable Crunches",
            sets: "3",
            reps: "15",
            tips: ["Keep hips stationary", "Curl spine", "Focus on contraction"]
          },
          {
            name: "Hanging Leg Raises",
            sets: "3",
            reps: "12",
            tips: ["Control the movement", "Keep legs straight", "Avoid swinging"]
          }
        ]
      }
    ]
  },
  {
    title: "Cardio",
    icon: FaRunning,
    description: "Improve endurance and burn calories",
    workouts: [
      {
        name: "HIIT Training",
        difficulty: "Intermediate",
        duration: "30 min",
        calories: "400-500",
        image: "/images/hiit.jpg",
        videoUrl: "https://www.youtube.com/watch?v=edIK5SZYMZo",
        exercises: [
          {
            name: "Circuit 1",
            sets: "4 rounds",
            tips: ["Maximum effort", "Proper form over speed", "Stay hydrated"],
            reps: "Perform each exercise for 45 seconds, rest 15 seconds between exercises",
            routine: [
              { name: "Burpees", duration: "45 sec", rest: "15 sec", tips: ["Explosive jump", "Full push-up", "Quick transitions"] },
              { name: "Mountain Climbers", duration: "45 sec", rest: "15 sec", tips: ["Keep hips low", "Alternate legs quickly", "Maintain plank"] },
              { name: "Jump Squats", duration: "45 sec", rest: "15 sec", tips: ["Land softly", "Full depth", "Explosive jump"] }
            ]
          },
          {
            name: "Circuit 2",
            sets: "4 rounds",
            tips: ["Focus on form", "Maintain intensity", "Control breathing"],
            reps: "Perform each exercise for 30 seconds, rest 15 seconds between exercises",
            routine: [
              { name: "High Knees", duration: "30 sec", rest: "15 sec", tips: ["Drive knees up", "Quick pace", "Stay on toes"] },
              { name: "Jumping Lunges", duration: "30 sec", rest: "15 sec", tips: ["Alternate legs", "Land softly", "Keep torso upright"] },
              { name: "Push-up to Plank", duration: "30 sec", rest: "15 sec", tips: ["Full push-up", "Plank position", "Control movement"] }
            ]
          }
        ]
      },
      {
        name: "Endurance Running",
        difficulty: "Beginner to Advanced",
        duration: "45 min",
        calories: "350-450",
        image: "/images/running.jpg",
        videoUrl: "https://www.youtube.com/watch?v=zCLQYDGo6E8",
        exercises: [
          {
            name: "5K Training",
            program: [
              { phase: "Warm-up", duration: "5 min", pace: "Light jog" },
              { phase: "Main Run", duration: "30 min", pace: "Steady state" },
              { phase: "Cool-down", duration: "10 min", pace: "Walk/light jog" }
            ],
            tips: ["Start slow", "Focus on breathing", "Maintain good posture"]
          }
        ]
      }
    ]
  },
  {
    title: "Famous Bodybuilding Splits",
    icon: FaHeartbeat,
    description: "Popular workout splits for muscle growth",
    workouts: [
      {
        name: "Push/Pull/Legs (PPL)",
        difficulty: "Advanced",
        duration: "60-75 min per day",
        calories: "400-600",
        image: "/images/ppl.webp",
        videoUrl: "https://www.youtube.com/watch?v=qVek72z3F1U",
        description: "3-day split targeting all major muscle groups",
        exercises: [
          {
            name: "Push Day (Chest, Shoulders, Triceps)",
            tips: ["Start with compound movements", "Progressive overload", "Focus on mind-muscle connection"],
            routine: [
              { 
                name: "Flat Bench Press",
                sets: "4",
                reps: "8-12",
                tips: ["Retract shoulder blades", "Feet planted firmly", "Control descent"]
              },
              {
                name: "Incline Dumbbell Press",
                sets: "3",
                reps: "10-12",
                tips: ["45-degree angle", "Keep elbows tucked", "Full range of motion"]
              },
              {
                name: "Overhead Press",
                sets: "3",
                reps: "8-12",
                tips: ["Core tight", "Full lockout", "Keep natural arch"]
              }
            ]
          },
          {
            name: "Pull Day (Back, Biceps)",
            tips: ["Focus on back first", "Control the negative", "Use straps if needed"],
            routine: [
              {
                name: "Barbell Rows",
                sets: "4",
                reps: "8-12",
                tips: ["45-degree bend", "Pull to belly", "Squeeze back"]
              },
              {
                name: "Pull-ups/Lat Pulldowns",
                sets: "3",
                reps: "10-12",
                tips: ["Wide grip", "Pull to chest", "Control negative"]
              },
              {
                name: "Face Pulls",
                sets: "3",
                reps: "12-15",
                tips: ["Pull to forehead", "Lead with elbows", "Squeeze rear delts"]
              }
            ]
          },
          {
            name: "Legs Day",
            tips: ["Warm up properly", "Focus on form", "Progressive overload"],
            routine: [
              {
                name: "Barbell Squats",
                sets: "4",
                reps: "8-12",
                tips: ["Keep chest up", "Break at hips", "Drive through heels"]
              },
              {
                name: "Romanian Deadlifts",
                sets: "3",
                reps: "10-12",
                tips: ["Slight knee bend", "Hip hinge", "Feel hamstrings stretch"]
              },
              {
                name: "Leg Press",
                sets: "3",
                reps: "12-15",
                tips: ["Feet shoulder width", "Full range", "Control weight"]
              }
            ]
          }
        ]
      },
      {
        name: "Arnold Split",
        difficulty: "Advanced",
        duration: "75-90 min per day",
        calories: "500-700",
        image: "/images/arnold.jpg",
        videoUrl: "https://www.youtube.com/watch?v=Sv-GcTHSQZw&t=1s",
        description: "6-day split focusing on double stimulation of muscle groups",
        exercises: [
          {
            name: "Chest & Back Day",
            tips: ["Alternate between chest and back", "Focus on contractions", "Full range of motion"],
            routine: [
              {
                name: "Superset 1",
                sets: "4",
                exercises: [
                  { name: "Incline Bench Press", reps: "10-12", tips: ["45-degree angle", "Control descent", "Full press"] },
                  { name: "Wide-Grip Pull-ups", reps: "8-12", tips: ["Wide grip", "Pull to chest", "Full stretch"] }
                ]
              },
              {
                name: "Superset 2",
                sets: "3",
                exercises: [
                  { name: "Flat Dumbbell Press", reps: "10-12", tips: ["Keep elbows tucked", "Press together", "Control descent"] },
                  { name: "Barbell Rows", reps: "10-12", tips: ["45-degree bend", "Pull to belly", "Squeeze back"] }
                ]
              }
            ]
          },
          {
            name: "Shoulders & Arms Day",
            tips: ["Focus on isolation", "Control the weights", "Mind-muscle connection"],
            routine: [
              {
                name: "Shoulder Focus",
                sets: "4",
                exercises: [
                  { name: "Military Press", reps: "8-12", tips: ["Full range", "Core tight", "Control weight"] },
                  { name: "Lateral Raises", reps: "12-15", tips: ["Slight bend in elbows", "Control motion", "Pause at top"] }
                ]
              },
              {
                name: "Arms Superset",
                sets: "3",
                exercises: [
                  { name: "Dumbbell Curls", reps: "12", tips: ["Keep elbows still", "Full range", "Control negative"] },
                  { name: "Skull Crushers", reps: "12", tips: ["Keep elbows in", "Full extension", "Control descent"] }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

function FitnessHub() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('teal.500', 'teal.300');

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleWorkoutClick = useCallback((workout) => {
    setSelectedWorkout(workout);
    onOpen();
  }, [onOpen]);

  const handleWatchTutorial = useCallback((url, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

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

          {/* Categories Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {workoutCategories.map((category, index) => (
              <MotionBox
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  bg={cardBg}
                  borderRadius="xl"
                  boxShadow="lg"
                  border="1px"
                  borderColor={borderColor}
                  cursor="pointer"
                  onClick={() => handleCategoryClick(category)}
                  _hover={{ transform: 'translateY(-5px)', transition: '0.2s' }}
                >
                  <CardBody>
                    <VStack spacing={4} align="center">
                      <Icon
                        as={category.icon}
                        boxSize={10}
                        color={accentColor}
                      />
                      <Heading size="md" color={headingColor}>
                        {category.title}
                      </Heading>
                      <Text color={textColor} textAlign="center">
                        {category.description}
                      </Text>
                      <Button
                        rightIcon={<FaPlay />}
                        colorScheme="teal"
                        variant="outline"
                      >
                        Explore Workouts
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </MotionBox>
            ))}
          </SimpleGrid>

          {/* Workout Details Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent bg={cardBg}>
              <ModalHeader color={headingColor}>
                {selectedWorkout?.name}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                {selectedWorkout && (
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={4}>
                      <Badge colorScheme="teal">{selectedWorkout.difficulty}</Badge>
                      <HStack>
                        <Icon as={FaStopwatch} />
                        <Text>{selectedWorkout.duration}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaFire} />
                        <Text>{selectedWorkout.calories} cal</Text>
                      </HStack>
                    </HStack>
                    
                    <Accordion allowMultiple>
                      {selectedWorkout.exercises && selectedWorkout.exercises.map((exercise, index) => (
                        <AccordionItem key={index}>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              <Text fontWeight="bold">{exercise.name}</Text>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel pb={4}>
                            <VStack align="stretch" spacing={3}>
                              {exercise.sets && exercise.reps && (
                                <HStack>
                                  <Text fontWeight="medium">Sets/Reps:</Text>
                                  <Text>{exercise.sets} × {exercise.reps}</Text>
                                </HStack>
                              )}
                              
                              {exercise.routine && (
                                <Box>
                                  <Text fontWeight="medium" mb={2}>Exercises:</Text>
                                  <List spacing={2}>
                                    {exercise.routine.map((item, i) => (
                                      <ListItem key={i}>
                                        <VStack align="stretch" spacing={1}>
                                          <Text fontWeight="medium">{item.name}</Text>
                                          {item.sets && (
                                            <Text fontSize="sm">Sets: {item.sets}</Text>
                                          )}
                                          {item.exercises && (
                                            <List spacing={1} pl={4}>
                                              {item.exercises.map((subExercise, j) => (
                                                <ListItem key={j}>
                                                  <Text fontSize="sm" fontWeight="medium">
                                                    {subExercise.name} - {subExercise.reps} reps
                                                  </Text>
                                                  {subExercise.tips && (
                                                    <List fontSize="sm" pl={4}>
                                                      {subExercise.tips.map((tip, k) => (
                                                        <ListItem key={k}>
                                                          <ListIcon as={FaCheckCircle} color="green.500" />
                                                          {tip}
                                                        </ListItem>
                                                      ))}
                                                    </List>
                                                  )}
                                                </ListItem>
                                              ))}
                                            </List>
                                          )}
                                        </VStack>
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}

                              {exercise.tips && !exercise.routine && (
                                <Box>
                                  <Text fontWeight="medium" mb={2}>Form Tips:</Text>
                                  <List spacing={2}>
                                    {exercise.tips.map((tip, i) => (
                                      <ListItem key={i}>
                                        <ListIcon as={FaCheckCircle} color="green.500" />
                                        {tip}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </VStack>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Featured Workouts */}
          {selectedCategory && (
            <Box mt={8}>
              <Heading size="xl" mb={6} color={headingColor}>
                {selectedCategory.title} Workouts
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                {selectedCategory.workouts.map((workout, index) => (
                  <MotionBox
                    key={workout.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      bg={cardBg}
                      borderRadius="xl"
                      boxShadow="lg"
                      border="1px"
                      borderColor={borderColor}
                      overflow="hidden"
                    >
                      {workout.image && (
                        <Box position="relative" height="250px">
                          <Image
                            src={workout.image}
                            alt={workout.name}
                            objectFit="cover"
                            objectPosition="center 20%"
                            width="100%"
                            height="100%"
                          />
                        </Box>
                      )}
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <Heading size="md" color={headingColor}>
                              {workout.name}
                            </Heading>
                            <Badge colorScheme="teal">
                              {workout.difficulty}
                            </Badge>
                          </HStack>
                          <HStack spacing={4}>
                            <HStack>
                              <Icon as={FaStopwatch} />
                              <Text>{workout.duration}</Text>
                            </HStack>
                            <HStack>
                              <Icon as={FaFire} />
                              <Text>{workout.calories} cal</Text>
                            </HStack>
                          </HStack>
                          <VStack spacing={2} width="100%">
                            <Button
                              colorScheme="teal"
                              rightIcon={<FaPlay />}
                              width="100%"
                              onClick={() => handleWorkoutClick(workout)}
                            >
                              View Workout
                            </Button>
                            {workout.videoUrl && (
                              <Button
                                leftIcon={<FaYoutube />}
                                colorScheme="red"
                                variant="outline"
                                size="md"
                                width="100%"
                                onClick={(e) => handleWatchTutorial(workout.videoUrl, e)}
                              >
                                Watch Overview Video
                              </Button>
                            )}
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default FitnessHub; 