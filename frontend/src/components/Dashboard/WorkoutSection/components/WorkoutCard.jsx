import React from 'react';
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  useColorModeValue,
  Tooltip,
  Box,
  SimpleGrid,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { FiHeart, FiActivity, FiTarget, FiTrendingUp, FiFileText, FiClock, FiZap } from 'react-icons/fi';
import { getWorkoutTypeColor, calculateCaloriesPerMinute } from '../utils/workoutUtils';

const metricMeta = [
  { key: 'duration', label: 'Duration', icon: FiClock, color: 'blue.400', suffix: 'min' },
  { key: 'caloriesBurned', label: 'Calories', icon: FiZap, color: 'red.400', suffix: 'cal' },
];

const WorkoutCard = ({ workout, onEdit, onDelete }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBorderColor = useColorModeValue('blue.200', 'blue.500');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const surfaceBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const getTypeIcon = (type) => {
    if (type === 'Cardio') return FiHeart;
    if (type === 'Strength') return FiActivity;
    if (type === 'Flexibility') return FiTarget;
    if (type === 'Sports') return FiTrendingUp;
    return FiActivity;
  };

  const TypeIcon = getTypeIcon(workout.type);

  return (
    <Card
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      boxShadow="sm"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl', borderColor: hoverBorderColor }}
      transition="all 0.2s ease"
      minH="260px"
    >
      <CardBody p={5}>
        <VStack spacing={4} align="stretch" h="100%">
          <HStack justify="space-between" align="start" spacing={3}>
            <Box minW={0}>
              <HStack spacing={2} wrap="wrap" mb={2}>
                <Badge colorScheme={getWorkoutTypeColor(workout.type)} borderRadius="full" px={3} py={1}>
                  <HStack spacing={1.5}>
                    <Box as={TypeIcon} boxSize={3.5} />
                    <Text>{workout.type}</Text>
                  </HStack>
                </Badge>
                {workout.intensity && (
                  <Badge variant="subtle" borderRadius="full" px={3} py={1}>
                    {workout.intensity}
                  </Badge>
                )}
              </HStack>
              <Tooltip label={workout.workoutName || workout.type} hasArrow>
                <Text fontSize="lg" fontWeight="700" color={textColor} noOfLines={2}>
                  {workout.workoutName || workout.type || 'Unknown Workout'}
                </Text>
              </Tooltip>
              <Text fontSize="sm" color={subTextColor} mt={1}>
                {new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </Box>
            <HStack spacing={1}>
              <IconButton
                icon={<EditIcon />}
                size="sm"
                colorScheme="blue"
                variant="ghost"
                onClick={() => onEdit(workout)}
                aria-label="Edit workout"
              />
              <IconButton
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => onDelete(workout._id)}
                aria-label="Delete workout"
              />
            </HStack>
          </HStack>

          <SimpleGrid columns={{ base: 2, md: 2 }} spacing={3}>
            {metricMeta.map((metric) => (
              <Box key={metric.key} p={3.5} borderRadius="xl" bg={surfaceBg} borderWidth="1px" borderColor={borderColor}>
                <HStack spacing={2} mb={2} color={metric.color} align="center" minW={0}>
                  <Box as={metric.icon} boxSize={4} />
                  <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">
                    {metric.label}
                  </Text>
                </HStack>
                <HStack spacing={1.5} align="baseline" wrap="nowrap">
                  <Text fontSize="lg" fontWeight="700" color={textColor} whiteSpace="nowrap">
                    {Math.round(workout[metric.key] || 0)}
                  </Text>
                  <Text fontSize="sm" color={subTextColor} whiteSpace="nowrap">
                    {metric.suffix}
                  </Text>
                </HStack>
              </Box>
            ))}
            <Box p={3.5} borderRadius="xl" bg={surfaceBg} borderWidth="1px" borderColor={borderColor}>
              <HStack spacing={2} mb={2} color="purple.400" minW={0}>
                <Box as={FiTrendingUp} boxSize={4} />
                <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">
                  Burn Rate
                </Text>
              </HStack>
              <HStack spacing={1.5} align="baseline" wrap="nowrap">
                <Text fontSize="lg" fontWeight="700" color={textColor} whiteSpace="nowrap">
                  {calculateCaloriesPerMinute(workout.caloriesBurned, workout.duration)}
                </Text>
                <Text fontSize="sm" color={subTextColor} whiteSpace="nowrap">
                  cal/min
                </Text>
              </HStack>
            </Box>
            <Box p={3.5} borderRadius="xl" bg={surfaceBg} borderWidth="1px" borderColor={borderColor}>
              <HStack spacing={2} mb={2} color="teal.400" minW={0}>
                <Box as={TypeIcon} boxSize={4} />
                <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">
                  Equipment
                </Text>
              </HStack>
              <Text fontSize="md" fontWeight="700" color={textColor} noOfLines={1}>
                {workout.equipment || 'None'}
              </Text>
            </Box>
          </SimpleGrid>

          {workout.notes ? (
            <HStack spacing={2} align="start" color={subTextColor}>
              <Box as={FiFileText} boxSize={4} mt={1} flexShrink={0} />
              <Text fontSize="sm" noOfLines={3}>
                {workout.notes}
              </Text>
            </HStack>
          ) : (
            <Text fontSize="sm" color={subTextColor}>
              No extra workout notes added.
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default React.memo(WorkoutCard);
