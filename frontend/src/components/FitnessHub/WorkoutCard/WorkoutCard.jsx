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
  Wrap,
  WrapItem,
  Stack,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaPlay, FaDumbbell, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const WorkoutCard = React.memo(function WorkoutCard({
  workout,
  onViewDetails,
  onComplete,
  isCompleted = false,
  isCompleting = false,
  index,
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBorderColor = useColorModeValue('teal.300', 'teal.500');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index || 0) * 0.1 }}
    >
      <Card
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        borderRadius="xl"
        boxShadow="sm"
        h="100%"
        _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg', borderColor: hoverBorderColor }}
        transition="all 0.2s ease"
        overflow="hidden"
      >
        <CardBody>
          <VStack spacing={4} align="start" h="100%">
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
            
            <Wrap spacing={2} w="100%">
              <WrapItem>
                <Badge colorScheme="blue" variant="subtle" size="sm">
                  <HStack spacing={1}>
                    <Icon as={FaClock} size={3} />
                    <Text>{workout.duration} min</Text>
                  </HStack>
                </Badge>
              </WrapItem>
              <WrapItem>
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
              </WrapItem>
              <WrapItem>
                <Badge colorScheme="purple" variant="outline" size="sm">
                  {workout.difficulty}
                </Badge>
              </WrapItem>
            </Wrap>

            {workout.focusAreas && workout.focusAreas.length > 0 && (
              <Box w="100%" minW={0}>
                <Text fontSize="xs" color={subTextColor} mb={1} fontWeight="medium">
                  Focus Areas:
                </Text>
                <Wrap spacing={1}>
                  {workout.focusAreas.map((area, idx) => (
                    <WrapItem key={idx}>
                      <Badge 
                        colorScheme="teal" 
                        variant="outline" 
                        size="xs"
                        maxW="100%"
                      >
                        {area}
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}

            {workout.exercises && workout.exercises.length > 0 && (
              <Box w="100%" minW={0}>
                <Text fontSize="xs" color={subTextColor} mb={1} fontWeight="medium">
                  Key Exercises:
                </Text>
                <VStack spacing={1} align="start">
                  {workout.exercises.slice(0, 3).map((exercise, idx) => (
                    <Text key={idx} fontSize="xs" color={textColor} noOfLines={2}>
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

            <Stack spacing={2} w="100%" mt="auto">
              <Button
                size="sm"
                colorScheme={isCompleted ? 'green' : 'teal'}
                variant={isCompleted ? 'solid' : 'outline'}
                leftIcon={<FaDumbbell />}
                isDisabled={isCompleted}
                isLoading={isCompleting}
                loadingText="Logging"
                onClick={() => onComplete?.(workout)}
                w="100%"
              >
                {isCompleted ? 'Completed' : 'Mark Complete'}
              </Button>
              {workout.videoId && (
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  leftIcon={<FaPlay />}
                  onClick={() => {
                    const v = String(workout.videoId);
                    const url = /^https?:\/\//i.test(v)
                      ? v
                      : `https://www.youtube.com/watch?v=${v}`;
                    window.open(url, '_blank');
                  }}
                  w="100%"
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
                w="100%"
              >
                View Details
              </Button>
            </Stack>
          </VStack>
        </CardBody>
      </Card>
    </MotionBox>
  );
});

export default WorkoutCard;
