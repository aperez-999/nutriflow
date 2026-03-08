import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Progress,
  Button,
  Flex,
  HStack,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiZap, FiActivity } from 'react-icons/fi';

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
  const teal = useColorModeValue('teal.500', 'teal.300');
  const blue = useColorModeValue('blue.500', 'blue.300');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <Box
          p={6}
          bg={bgColor}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
          transition="all 0.2s ease"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <HStack spacing={2}>
              <Icon as={FiZap} boxSize={4} color={teal} />
              <Heading size="md" color={textColor}>Daily Calorie Goal</Heading>
            </HStack>
            <Button size="sm" colorScheme="teal" onClick={onEditGoals} _hover={{ opacity: 0.9 }} transition="opacity 0.2s">
              Edit Goals
            </Button>
          </Flex>
          <Progress
            value={Math.min(calorieProgress, 100)}
            colorScheme={calorieProgress > 100 ? "red" : "teal"}
            mb={2}
            borderRadius="full"
            size="sm"
            sx={{ '& > div': { transition: 'width 0.4s ease' } }}
          />
          <Text color={subTextColor} fontSize="sm">
            {dailyCalories} / {goals.dailyCalories} calories
          </Text>
        </Box>
        <Box
          p={6}
          bg={bgColor}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
          transition="all 0.2s ease"
        >
          <HStack spacing={2} mb={4}>
            <Icon as={FiActivity} boxSize={4} color={blue} />
            <Heading size="md" color={textColor}>Weekly Workout Goal</Heading>
          </HStack>
          <Progress
            value={workoutProgress}
            colorScheme="blue"
            mb={2}
            borderRadius="full"
            size="sm"
            sx={{ '& > div': { transition: 'width 0.4s ease' } }}
          />
          <Text color={subTextColor} fontSize="sm">
            {weeklyWorkouts} / {goals.weeklyWorkouts} workouts
          </Text>
        </Box>
      </Grid>
    </MotionBox>
  );
};

export default GoalsSection;
