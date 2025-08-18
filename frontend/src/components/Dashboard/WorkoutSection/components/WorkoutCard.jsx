import React from 'react';
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  IconButton,
  useColorModeValue,
  Tooltip,
  Box,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { FiHeart, FiActivity, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { getWorkoutTypeColor, calculateCaloriesPerMinute } from '../utils/workoutUtils';

const WorkoutCard = ({ workout, onEdit, onDelete }) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Cardio': return FiHeart;
      case 'Strength': return FiActivity;
      case 'Flexibility': return FiTarget;
      case 'Sports': return FiTrendingUp;
      default: return FiActivity;
    }
  };

  const TypeIcon = getTypeIcon(workout.type);

  return (
    <Card 
      size="sm"
      variant="outline"
      _hover={{ 
        transform: 'translateY(-2px)', 
        boxShadow: 'lg',
        borderColor: useColorModeValue('blue.200', 'blue.500')
      }}
      transition="all 0.2s"
      cursor="pointer"
      height="220px"
    >
      <CardBody p={4}>
        <VStack spacing={3} align="stretch" height="100%">
          {/* Header Section */}
          <HStack justify="space-between" align="center">
            <Badge 
              colorScheme={getWorkoutTypeColor(workout.type)}
              variant="subtle"
              fontSize="xs"
              px={2}
              py={1}
            >
              <HStack spacing={1}>
                <Box as={TypeIcon} size={3} />
                <Text>{workout.type}</Text>
              </HStack>
            </Badge>
            <Text fontSize="xs" color={subTextColor}>
              {new Date(workout.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              })}
            </Text>
          </HStack>
          
          {/* Workout Name Section */}
          <Tooltip label={workout.workoutName || workout.type} hasArrow>
            <Text 
              fontSize="sm" 
              fontWeight="semibold" 
              color={textColor}
              noOfLines={1}
            >
              {workout.workoutName || workout.type || 'Unknown Workout'}
            </Text>
          </Tooltip>
          
          {/* Metrics Section */}
          <SimpleGrid columns={4} spacing={2} width="100%">
            <VStack spacing={1}>
              <Text fontSize="md" fontWeight="bold" color="blue.500">
                {Math.round(workout.duration || 0)}
              </Text>
              <Text fontSize="xs" color={subTextColor}>Min</Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="md" fontWeight="bold" color="red.400">
                {Math.round(workout.caloriesBurned || 0)}
              </Text>
              <Text fontSize="xs" color={subTextColor}>Cal</Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="md" fontWeight="bold" color="green.400">
                {workout.type === 'Cardio' ? '❤️' : workout.type === 'Strength' ? '💪' : workout.type === 'Flexibility' ? '🧘' : '⚽'}
              </Text>
              <Text fontSize="xs" color={subTextColor}>Type</Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="md" fontWeight="bold" color="purple.400">
                {calculateCaloriesPerMinute(workout.caloriesBurned, workout.duration)}
              </Text>
              <Text fontSize="xs" color={subTextColor}>Cal/Min</Text>
            </VStack>
          </SimpleGrid>
          
          {/* Notes Section */}
          {workout.notes && (
            <Text fontSize="xs" color={subTextColor} noOfLines={2}>
              📝 {workout.notes}
            </Text>
          )}
          
          {/* Actions Section */}
          <HStack spacing={2} justify="center" pt={2}>
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
        </VStack>
      </CardBody>
    </Card>
  );
};

export default WorkoutCard;
