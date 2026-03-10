import React from 'react';
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Stack,
  FormControl,
  FormLabel,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaDumbbell, FaRunning, FaHeartbeat, FaFireAlt, FaCheckCircle } from 'react-icons/fa';
import { Icon } from '@chakra-ui/react';

const cardHoverStyles = {
  _hover: { transform: 'translateY(-2px)', boxShadow: 'lg' },
  transition: 'all 0.2s ease',
};

/**
 * Fitness Hub — AI-Powered Workout Discovery card (filters + exercise list + feature grid).
 */
export default function FitnessHubDiscoverySection({
  muscle,
  equipment,
  difficulty,
  onMuscleChange,
  onEquipmentChange,
  onDifficultyChange,
  filteredExercises,
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const exerciseCardHoverBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box mt={8} w="100%">
      <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" boxShadow="sm" {...cardHoverStyles}>
        <CardBody>
          <VStack align="stretch" spacing={6}>
            <VStack spacing={3} align="center">
              <Icon as={FaDumbbell} boxSize={12} color={accentColor} />
              <Text as="h2" fontSize="lg" fontWeight="600" color={headingColor}>
                AI-Powered Workout Discovery
              </Text>
              <Text color={textColor} textAlign="center" maxW="600px" fontSize="sm">
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
                  value={muscle}
                  onChange={(e) => onMuscleChange(e.target.value)}
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
                  value={equipment}
                  onChange={(e) => onEquipmentChange(e.target.value)}
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
                  value={difficulty}
                  onChange={(e) => onDifficultyChange(e.target.value)}
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
  );
}
