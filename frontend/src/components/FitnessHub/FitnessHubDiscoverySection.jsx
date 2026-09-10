import React, { useMemo, useState } from 'react';
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
  Collapse,
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
  totalExercises = filteredExercises.length,
  onClearFilters,
}) {
  const [showAll, setShowAll] = useState(false);
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const exerciseCardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const panelBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const hasActiveFilters = Boolean(muscle || equipment || difficulty);
  const previewCount = 6;
  const visibleExercises = useMemo(
    () => (showAll ? filteredExercises : filteredExercises.slice(0, previewCount)),
    [filteredExercises, showAll]
  );
  const hasMoreResults = filteredExercises.length > previewCount;

  return (
    <Box w="100%" h="100%">
      <Text fontSize="sm" fontWeight="600" color={headingColor} letterSpacing="wider" mb={3}>
        MINI WORKOUT LIBRARY
      </Text>
      <Card bg={cardBg} borderColor={borderColor} {...cardHoverStyles} h="100%">
        <CardBody h="100%">
          <VStack align="stretch" spacing={{ base: 5, md: 6 }} h="100%">
            <Stack direction={{ base: 'column', lg: 'row' }} justify="space-between" spacing={{ base: 5, lg: 6 }}>
              <VStack spacing={3} align="start" maxW="640px" flex="1">
                <Icon as={FaDumbbell} boxSize={10} color={accentColor} />
                <Text as="h2" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="700" color={headingColor}>
                  Browse your exercise library without losing the page
                </Text>
                <Text color={textColor} maxW="600px" fontSize="sm">
                  Filter by muscle group, equipment, and difficulty, then jump into demo links and quick cues while
                  you build your next plan.
                </Text>
              </VStack>
              <Box
                bg={panelBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                px={4}
                py={3}
                minW={{ base: '100%', sm: '220px' }}
              >
                <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wider" mb={1}>
                  Library view
                </Text>
                <Text fontSize="2xl" fontWeight="700" color={headingColor}>
                  {visibleExercises.length}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  of {totalExercises} exercises visible
                </Text>
              </Box>
            </Stack>

            <Divider borderColor={borderColor} />

            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={4}
              flexWrap="wrap"
              align={{ md: 'flex-end' }}
              bg={panelBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="2xl"
              p={{ base: 4, md: 5 }}
            >
              <Text fontSize="sm" color={textColor} minW={{ md: '220px' }} flex="1" maxW="320px">
                Refine the library to match the training focus of your current plan.
              </Text>
              <FormControl maxW={{ base: '100%', md: '180px' }}>
                <FormLabel fontSize="sm" color={headingColor}>Muscle Group</FormLabel>
                <Select placeholder="All" size="sm" value={muscle} onChange={(e) => onMuscleChange(e.target.value)} borderColor={borderColor}>
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Legs">Legs</option>
                  <option value="Core">Core</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Arms">Arms</option>
                  <option value="Glutes">Glutes</option>
                  <option value="Full Body">Full Body</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Mobility">Mobility</option>
                </Select>
              </FormControl>
              <FormControl maxW={{ base: '100%', md: '180px' }}>
                <FormLabel fontSize="sm" color={headingColor}>Equipment</FormLabel>
                <Select placeholder="All" size="sm" value={equipment} onChange={(e) => onEquipmentChange(e.target.value)} borderColor={borderColor}>
                  <option value="Bodyweight">Bodyweight</option>
                  <option value="Dumbbells">Dumbbells</option>
                  <option value="Barbell">Barbell</option>
                  <option value="Cable">Cable</option>
                  <option value="Machine">Machine</option>
                  <option value="Kettlebell">Kettlebell</option>
                  <option value="Bands">Bands</option>
                </Select>
              </FormControl>
              <FormControl maxW={{ base: '100%', md: '180px' }}>
                <FormLabel fontSize="sm" color={headingColor}>Difficulty</FormLabel>
                <Select placeholder="All" size="sm" value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)} borderColor={borderColor}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Select>
              </FormControl>
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="teal"
                  onClick={onClearFilters}
                  borderRadius="full"
                >
                  Clear filters
                </Button>
              )}
            </Stack>

            {filteredExercises.length > 0 ? (
              <VStack align="stretch" spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                  {visibleExercises.map((ex) => (
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
                            {ex.notes || 'Demo-ready movement with a placeholder YouTube walkthrough for quick form review.'}
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
                {hasMoreResults && (
                  <VStack spacing={2} align="center" pt={1}>
                    <Button
                      size="sm"
                      colorScheme="teal"
                      variant={showAll ? 'outline' : 'solid'}
                      borderRadius="full"
                      onClick={() => setShowAll((prev) => !prev)}
                    >
                      {showAll
                        ? `Show less`
                        : `Show ${filteredExercises.length - visibleExercises.length} more exercises`}
                    </Button>
                    <Text fontSize="xs" color={textColor}>
                      {showAll
                        ? 'Showing the full filtered library.'
                        : 'Start with the top matches, then expand when you want deeper browsing.'}
                    </Text>
                  </VStack>
                )}
              </VStack>
            ) : (
              <Box borderWidth="1px" borderColor={borderColor} borderRadius="2xl" p={5} bg={panelBg}>
                <Text fontSize="sm" color={textColor}>
                  No exercises match the selected filters. Try changing muscle group, equipment, or difficulty.
                </Text>
              </Box>
            )}

            <Collapse in={true} animateOpacity>
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
            </Collapse>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
