import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Progress,
  Button,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const GoalsSection = ({ 
  goals, 
  calorieProgress, 
  workoutProgress, 
  dailyCalories, 
  weeklyWorkouts,
  onEditGoals 
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color={textColor}>Daily Calorie Goal</Heading>
            <Button size="sm" colorScheme="teal" onClick={onEditGoals}>
              Edit Goals
            </Button>
          </Flex>
          <Progress 
            value={calorieProgress} 
            colorScheme={calorieProgress > 100 ? "red" : "teal"} 
            mb={2} 
            borderRadius="full" 
          />
          <Text color={subTextColor}>
            {dailyCalories} / {goals.dailyCalories} calories
          </Text>
        </Box>
        <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <Heading size="md" mb={4} color={textColor}>Weekly Workout Goal</Heading>
          <Progress 
            value={workoutProgress} 
            colorScheme="blue" 
            mb={2} 
            borderRadius="full" 
          />
          <Text color={subTextColor}>
            {weeklyWorkouts} / {goals.weeklyWorkouts} workouts
          </Text>
        </Box>
      </Grid>
    </MotionBox>
  );
};

export default GoalsSection;
