import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Icon,
} from '@chakra-ui/react';
import { FaYoutube, FaCheckCircle, FaFire, FaHeartbeat, FaDumbbell } from 'react-icons/fa';
import { getExerciseMeta } from '../../../utils/workoutUtils';

const ExerciseDetailsModal = ({ isOpen, onClose, workout }) => {
  const headingColor = 'fg';
  const textColor = 'fg.muted';

  if (!workout) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{workout?.title || 'Workout Details'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={4}>
            <HStack spacing={2}>
              <Badge>{workout.duration} min</Badge>
              <Badge>
                {workout.intensity}
              </Badge>
              <Badge variant="subtle">{workout.difficulty}</Badge>
            </HStack>
            
            <Text>{workout.description}</Text>
            
            {workout.focusAreas?.length > 0 && (
              <HStack wrap="wrap" spacing={1}>
                {workout.focusAreas.map((area, i) => (
                  <Badge key={i} variant="subtle">{area}</Badge>
                ))}
              </HStack>
            )}

            {workout.exercises?.length > 0 && (
              <VStack align="start" spacing={4} width="100%">
                <Text fontSize="lg" fontWeight="semibold" color={headingColor}>Exercises</Text>
                <Accordion allowMultiple width="100%">
                  {workout.exercises.map((ex, i) => (
                    <AccordionItem key={i}>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="lg">{ex.name}</Text>
                            <HStack spacing={3} fontSize="sm" color={textColor}>
                              <Badge variant="subtle">
                                {ex.sets || '3'} sets
                              </Badge>
                              <Badge variant="subtle">
                                {ex.reps || '10'} reps
                              </Badge>
                              {ex.interval && (
                                <Badge variant="subtle">
                                  {ex.interval}s
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <ExerciseDetails exercise={ex} workout={workout} />
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </VStack>
            )}

            {workout.videoId && (
              <Button
                as="a"
                href={`https://www.youtube.com/watch?v=${workout.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<FaYoutube />}
                variant="outline"
              >
                Watch on YouTube
              </Button>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ExerciseDetails = ({ exercise, workout }) => {
  const meta = getExerciseMeta(exercise, workout);
  
  return (
    <VStack align="stretch" spacing={4}>
      {/* Exercise Overview */}
      <DetailSection
        title="Overview"
        colorScheme="blue"
        content={[
          { label: 'Target Muscles', value: exercise.targetMuscles || 'Primary muscle groups' },
          { label: 'Equipment', value: exercise.equipment || 'Bodyweight' },
          { label: 'Difficulty', value: exercise.difficulty || 'Intermediate' }
        ]}
      />

      {/* Tempo & Rest */}
      <DetailSection
        title="Tempo & Rest Guidelines"
        colorScheme="green"
        content={[
          { 
            label: 'Tempo',
            value: exercise.tempo || '3-1-3-1',
            subtext: 'Eccentric-Pause-Concentric-Pause'
          },
          { 
            label: 'Rest Between Sets',
            value: exercise.restBetweenSets || '90-120 seconds'
          },
          { 
            label: 'RPE Target',
            value: exercise.rpe || '7-8/10',
            subtext: 'Rate of Perceived Exertion'
          }
        ]}
      />

      {/* Form & Technique */}
      <DetailSection
        title="Form & Technique"
        colorScheme="purple"
        isList
        content={[
          {
            label: 'Setup Position',
            items: meta.setup.length ? meta.setup : ['Neutral spine', 'Light brace', 'Comfortable stance']
          },
          {
            label: 'Movement Phases',
            phases: [
              { label: 'Eccentric', value: meta.eccentric || 'Lower with control (2-3s)', color: 'red' },
              { label: 'Pause', value: meta.pause || '0-1s', color: 'yellow' },
              { label: 'Concentric', value: meta.concentric || '1s up', color: 'green' }
            ]
          }
        ]}
      />

      {/* Progression & Variations */}
      <DetailSection
        title="Progression & Variations"
        colorScheme="orange"
        variations
        content={[
          {
            label: 'Easier Variations',
            items: meta.easier.length ? meta.easier : ['Assisted version', 'Reduced range of motion'],
            color: 'green'
          },
          {
            label: 'Harder Variations',
            items: meta.harder.length ? meta.harder : ['Weighted version', 'Single-leg variation'],
            color: 'red'
          }
        ]}
      />

      {/* Common Mistakes */}
      <DetailSection
        title="Common Mistakes to Avoid"
        colorScheme="red"
        isList
        content={[{
          items: meta.mistakes.length ? meta.mistakes : [
            'Rushing reps',
            'Losing bracing',
            'Cutting range of motion'
          ]
        }]}
      />

      {/* Science Notes */}
      <DetailSection
        title="Science-Based Benefits"
        colorScheme="teal"
        benefits
        content={[
          { icon: FaFire, text: 'Metabolic stress for muscle growth', color: 'orange' },
          { icon: FaHeartbeat, text: 'Improved cardiovascular fitness', color: 'red' },
          { icon: FaDumbbell, text: 'Enhanced neuromuscular coordination', color: 'blue' }
        ]}
      />
    </VStack>
  );
};

const DetailSection = ({ title, content, isList, variations, benefits }) => {
  const bgColor = 'bg.surface';
  const borderColor = 'border';
  const titleColor = 'fg';
  const textColor = 'fg.muted';
  const chipBg = 'bg.muted';

  return (
    <Box p={4} bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor}>
      <VStack align="start" spacing={3}>
        <Text fontSize="md" fontWeight="semibold" color={titleColor}>{title}</Text>
        
        {!isList && !variations && !benefits && (
          <HStack spacing={6} wrap="wrap">
            {content.map((item, i) => (
              <VStack key={i} align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="medium">{item.label}</Text>
                <Text fontSize="sm" fontFamily={item.label === 'Tempo' ? 'mono' : 'body'}>
                  {item.value}
                </Text>
                {item.subtext && (
                  <Text fontSize="xs" color={textColor}>{item.subtext}</Text>
                )}
              </VStack>
            ))}
          </HStack>
        )}

        {isList && (
          <VStack align="start" spacing={3} width="100%">
            {content.map((section, i) => (
              <Box key={i} width="100%">
                {section.label && (
                  <Text fontSize="sm" fontWeight="medium" mb={2}>{section.label}</Text>
                )}
                {section.items && (
                  <List spacing={1}>
                    {section.items.map((item, j) => (
                      <ListItem key={j}>
                        <ListIcon as={FaCheckCircle} color="fg.muted" />
                        <Text fontSize="sm">{item}</Text>
                      </ListItem>
                    ))}
                  </List>
                )}
                {section.phases && (
                  <VStack spacing={2} align="stretch">
                    {section.phases.map((phase, j) => (
                      <HStack key={j} spacing={3} p={2} bg={chipBg} borderRadius="md">
                        <Badge variant="subtle">{phase.label}</Badge>
                        <Text fontSize="sm">{phase.value}</Text>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
            ))}
          </VStack>
        )}

        {variations && (
          <VStack align="start" spacing={2} width="100%">
            {content.map((variation, i) => (
              <Box key={i}>
                <Text fontSize="sm" fontWeight="medium" mb={1}>{variation.label}</Text>
                <HStack spacing={2} wrap="wrap">
                  {variation.items.map((item, j) => (
                    <Badge key={j} variant="subtle" size="sm">
                      {item}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            ))}
          </VStack>
        )}

        {benefits && (
          <VStack align="start" spacing={2} width="100%">
            {content.map((benefit, i) => (
              <HStack key={i} spacing={3} p={2} bg={chipBg} borderRadius="md">
                <Icon as={benefit.icon} color={`${benefit.color}.500`} />
                <Text fontSize="sm">{benefit.text}</Text>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default ExerciseDetailsModal;
