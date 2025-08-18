import React from 'react';
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaPlay, FaDumbbell, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const WorkoutCard = ({ workout, onViewDetails, index }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card 
        bg={cardBg} 
        border="1px" 
        borderColor={borderColor} 
        borderRadius="lg" 
        boxShadow="md" 
        h="100%"
      >
        <CardBody>
          <VStack spacing={3} align="start" h="100%">
            <Text 
              fontSize="lg" 
              fontWeight="bold" 
              color={textColor} 
              noOfLines={2}
            >
              {workout.title}
            </Text>
            
            <Text 
              fontSize="sm" 
              color={subTextColor} 
              noOfLines={2}
            >
              {workout.description}
            </Text>
            
            <HStack spacing={2} w="100%">
              <Badge colorScheme="blue" variant="subtle" size="sm">
                <HStack spacing={1}>
                  <Icon as={FaClock} size={3} />
                  <Text>{workout.duration} min</Text>
                </HStack>
              </Badge>
              <Badge 
                colorScheme={
                  workout.intensity === 'High' ? 'red' : 
                  workout.intensity === 'Medium' ? 'yellow' : 'green'
                } 
                variant="subtle" 
                size="sm"
              >
                {workout.intensity}
              </Badge>
              <Badge colorScheme="purple" variant="outline" size="sm">
                {workout.difficulty}
              </Badge>
            </HStack>

            {workout.focusAreas && workout.focusAreas.length > 0 && (
              <Box w="100%">
                <Text fontSize="xs" color={subTextColor} mb={1} fontWeight="medium">
                  Focus Areas:
                </Text>
                <HStack wrap="wrap" gap={1}>
                  {workout.focusAreas.map((area, idx) => (
                    <Badge 
                      key={idx} 
                      colorScheme="teal" 
                      variant="outline" 
                      size="xs"
                    >
                      {area}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

            {workout.exercises && workout.exercises.length > 0 && (
              <Box w="100%">
                <Text fontSize="xs" color={subTextColor} mb={1} fontWeight="medium">
                  Key Exercises:
                </Text>
                <VStack spacing={1} align="start">
                  {workout.exercises.slice(0, 3).map((exercise, idx) => (
                    <Text key={idx} fontSize="xs" color={textColor}>
                      • {exercise.name}
                      {exercise.sets && exercise.reps && ` (${exercise.sets}×${exercise.reps})`}
                      {exercise.interval && ` (${exercise.interval})`}
                    </Text>
                  ))}
                  {workout.exercises.length > 3 && (
                    <Text fontSize="xs" color={subTextColor}>
                      +{workout.exercises.length - 3} more exercises
                    </Text>
                  )}
                </VStack>
              </Box>
            )}

            <HStack spacing={2} w="100%" mt="auto">
              {workout.videoId && (
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  leftIcon={<FaPlay />}
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${workout.videoId}`, '_blank')}
                  flex={1}
                >
                  Watch Demo
                </Button>
              )}
              <Button
                size="sm"
                colorScheme="teal"
                variant="outline"
                leftIcon={<FaDumbbell />}
                onClick={() => onViewDetails(workout)}
                flex={1}
              >
                View Details
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </MotionBox>
  );
};

export default WorkoutCard;
