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
  Divider,
  FormControl,
  FormLabel,
  Select,
  Button,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaDumbbell, FaRunning, FaHeartbeat, FaFireAlt, FaCheckCircle, FaYoutube } from 'react-icons/fa';
import { Icon } from '@chakra-ui/react';

const cardHoverStyles = {
  borderRadius: 'xl',
  boxShadow: 'sm',
  borderWidth: '1px',
  _hover: { transform: 'translateY(-2px)', boxShadow: 'lg' },
  transition: 'all 0.2s ease',
};

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
  const panelBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  return (
    <Box w="100%">
      <Text fontSize="sm" fontWeight="600" color={headingColor} letterSpacing="wider" mb={3}>
        EXERCISE DISCOVERY
      </Text>
      <Card bg={cardBg} borderColor={borderColor} {...cardHoverStyles}>
        <CardBody>
          <VStack align="stretch" spacing={6}>
            <Stack direction={{ base: 'column', lg: 'row' }} justify="space-between" spacing={6}>
              <VStack spacing={3} align="start" maxW="640px">
                <Icon as={FaDumbbell} boxSize={10} color={accentColor} />
                <Text as="h2" fontSize="lg" fontWeight="600" color={headingColor}>
                  Explore exercises with guided demo links
                </Text>
                <Text color={textColor} maxW="600px" fontSize="sm">
                  Filter the exercise library by muscle group, equipment, and difficulty, then jump into placeholder
                  demo videos while you build your next plan.
                </Text>
              </VStack>
              <Box bg={panelBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" px={4} py={3}>
                <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wider" mb={1}>
                  Current result set
                </Text>
                <Text fontSize="2xl" fontWeight="700" color={headingColor}>
                  {filteredExercises.length}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  exercises match your filters
                </Text>
              </Box>
            </Stack>

            <Divider borderColor={borderColor} />

            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} flexWrap="wrap" align={{ md: 'flex-end' }}>
              <Text fontSize="sm" color={textColor} minW={{ md: '180px' }}>
                Refine the library to match the training focus of your current plan.
              </Text>
              <FormControl maxW="180px">
                <FormLabel fontSize="sm" color={headingColor}>Muscle Group</FormLabel>
                <Select placeholder="All" size="sm" value={muscle} onChange={(e) => onMuscleChange(e.target.value)} borderColor={borderColor}>
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Legs">Legs</option>
                  <option value="Core">Core</option>
                </Select>
              </FormControl>
              <FormControl maxW="180px">
                <FormLabel fontSize="sm" color={headingColor}>Equipment</FormLabel>
                <Select placeholder="All" size="sm" value={equipment} onChange={(e) => onEquipmentChange(e.target.value)} borderColor={borderColor}>
                  <option value="Bodyweight">Bodyweight</option>
                  <option value="Dumbbells">Dumbbells</option>
                  <option value="Machines">Machines</option>
                </Select>
              </FormControl>
              <FormControl maxW="180px">
                <FormLabel fontSize="sm" color={headingColor}>Difficulty</FormLabel>
                <Select placeholder="All" size="sm" value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)} borderColor={borderColor}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Select>
              </FormControl>
            </Stack>

            {filteredExercises.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                {filteredExercises.map((ex) => (
                  <Card
                    key={`${ex.name}-${ex.equipment}-${ex.difficulty}`}
                    bg={cardBg}
                    borderColor={borderColor}
                    borderRadius="xl"
                    borderWidth="1px"
                    boxShadow="sm"
                    _hover={{ bg: exerciseCardHoverBg, boxShadow: 'md', transform: 'translateY(-2px)' }}
                    transition="all 0.2s ease"
                    h="100%"
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={4} h="100%">
                        <VStack align="start" spacing={2}>
                          <Text fontWeight="600" color={headingColor} fontSize="md">
                            {ex.name}
                          </Text>
                          <HStack spacing={2} flexWrap="wrap">
                            <Badge colorScheme="blue" variant="subtle">{ex.muscleGroup}</Badge>
                            <Badge colorScheme="purple" variant="subtle">{ex.equipment}</Badge>
                            <Badge colorScheme="teal" variant="outline">{ex.difficulty}</Badge>
                          </HStack>
                        </VStack>
                        <Text fontSize="sm" color={textColor}>
                          Demo-ready movement with a placeholder YouTube walkthrough for quick form review.
                        </Text>
                        <Button
                          as="a"
                          href={ex.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          leftIcon={<FaYoutube />}
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          mt="auto"
                        >
                          Watch demo
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
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
                  Match your discovery flow to the plan your coach generated so exploration stays relevant.
                </Text>
              </VStack>
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Icon as={FaRunning} boxSize={6} color="green.500" />
                  <Text fontWeight="semibold" color={headingColor}>Progress Tracking</Text>
                </HStack>
                <Text color={textColor} fontSize="sm">
                  Use filters to quickly find variations that fit your equipment, recovery, and current level.
                </Text>
              </VStack>
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Icon as={FaFireAlt} boxSize={6} color="orange.500" />
                  <Text fontWeight="semibold" color={headingColor}>Variety & Challenge</Text>
                </HStack>
                <Text color={textColor} fontSize="sm">
                  Swap movements more confidently without leaving the Fitness Hub or breaking your training rhythm.
                </Text>
              </VStack>
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Icon as={FaCheckCircle} boxSize={6} color="teal.500" />
                  <Text fontWeight="semibold" color={headingColor}>Form & Safety</Text>
                </HStack>
                <Text color={textColor} fontSize="sm">
                  Placeholder demo links make it easier to review technique before adding new exercises to your routine.
                </Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
