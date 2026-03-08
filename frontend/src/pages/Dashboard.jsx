import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  SimpleGrid,
  useToast,
  useDisclosure,
  Spinner,
  Center,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { getDiets, addDiet, getWorkouts, addWorkout, deleteDiet, deleteWorkout, updateDiet, updateWorkout } from '../services/api';
import DietSection from '../components/Dashboard/DietSection/index';
import WorkoutSection from '../components/Dashboard/WorkoutSection/index';
import {
  GoalsSection,
  GoalsModal,
  QuickStatsStrip,
  TodayAISummary,
  WeeklyCaloriesChart,
  WeeklySummaryCard,
  RecentActivityCard,
  QuickActionsCard,
  RecommendedActionsCard,
} from '../components/Dashboard/components';
import {
  calculateDailyCalories,
  calculateWeeklyWorkouts,
  calculateProgress,
  getWeeklyCaloriesAverage,
  getWeeklyCaloriesByDay,
  getRecentActivity,
  getLoggingStreak,
  handleApiError,
  handleApiSuccess,
  transformDietData,
  transformWorkoutData,
} from '../components/Dashboard/utils/dashboardUtils';

const MotionBox = motion.div;

function Dashboard() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const headingColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');

  const [diets, setDiets] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState({
    dailyCalories: 2000,
    dailyProtein: 150,
    weeklyWorkouts: 5
  });
  const [editingGoals, setEditingGoals] = useState({ ...goals });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dietData, workoutData] = await Promise.all([
          getDiets(),
          getWorkouts()
        ]);
        setDiets(Array.isArray(dietData) ? dietData : []);
        setWorkouts(Array.isArray(workoutData) ? workoutData : []);
      } catch (error) {
        handleApiError(error, toast, 'fetching data');
        setDiets([]);
        setWorkouts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddDiet = useCallback(async (dietData) => {
    try {
      const transformedData = transformDietData(dietData);
      const newDiet = await addDiet(transformedData);
      setDiets((prev) => [...prev, newDiet]);
      handleApiSuccess(toast, 'Diet added successfully');
    } catch (error) {
      handleApiError(error, toast, 'adding diet');
    }
  }, [toast]);

  const handleUpdateDiet = useCallback(async (id, dietData) => {
    try {
      const transformedData = transformDietData(dietData);
      const updatedDiet = await updateDiet(id, transformedData);
      setDiets((prev) => prev.map((diet) => (diet._id === id ? updatedDiet : diet)));
      handleApiSuccess(toast, 'Diet updated successfully');
    } catch (error) {
      handleApiError(error, toast, 'updating diet');
    }
  }, [toast]);

  const handleDeleteDiet = useCallback(async (id) => {
    try {
      await deleteDiet(id);
      setDiets((prev) => prev.filter((diet) => diet._id !== id));
      handleApiSuccess(toast, 'Diet record deleted');
    } catch (error) {
      handleApiError(error, toast, 'deleting diet record');
    }
  }, [toast]);

  const handleAddWorkout = useCallback(async (workoutData) => {
    try {
      const transformedData = transformWorkoutData(workoutData);
      const newWorkout = await addWorkout(transformedData);
      setWorkouts((prev) => [...prev, newWorkout]);
      handleApiSuccess(toast, 'Workout added successfully');
    } catch (error) {
      handleApiError(error, toast, 'adding workout');
    }
  }, [toast]);

  const handleUpdateWorkout = useCallback(async (id, workoutData) => {
    try {
      const transformedData = transformWorkoutData(workoutData);
      const updatedWorkout = await updateWorkout(id, transformedData);
      setWorkouts((prev) => prev.map((w) => (w._id === id ? updatedWorkout : w)));
      handleApiSuccess(toast, 'Workout updated successfully');
    } catch (error) {
      handleApiError(error, toast, 'updating workout');
    }
  }, [toast]);

  const handleDeleteWorkout = useCallback(async (id) => {
    try {
      await deleteWorkout(id);
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
      handleApiSuccess(toast, 'Workout deleted');
    } catch (error) {
      handleApiError(error, toast, 'deleting workout');
    }
  }, [toast]);

  // Goals handling
  const handleSaveGoals = () => {
    setGoals(editingGoals);
    onClose();
    handleApiSuccess(toast, 'Goals updated successfully');
  };

  // Progress calculations
  const dailyCalories = calculateDailyCalories(diets);
  const weeklyWorkoutCount = calculateWeeklyWorkouts(workouts);
  const calorieProgress = calculateProgress(dailyCalories, goals.dailyCalories);
  const workoutProgress = calculateProgress(weeklyWorkoutCount, goals.weeklyWorkouts);
  const avgCaloriesThisWeek = getWeeklyCaloriesAverage(diets);
  const recentActivity = getRecentActivity(diets, workouts, 6);
  const loggingStreak = getLoggingStreak(diets, workouts);

  const scrollToDiet = () => document.getElementById('diet-section')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToWorkout = () => document.getElementById('workout-section')?.scrollIntoView({ behavior: 'smooth' });

  if (isLoading) {
    return (
      <Center minH="40vh">
        <Spinner size="xl" colorScheme="teal" thickness="3px" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
      <VStack spacing={8} align="stretch">
        {/* Page header */}
        <VStack spacing={1} align="stretch" w="100%">
          <Heading as="h1" size="lg" fontWeight="700" color={headingColor}>
            Dashboard
          </Heading>
          <Text fontSize="sm" color={subColor}>
            Track your nutrition and workouts, and hit your goals.
          </Text>
        </VStack>

        {/* Today's AI Summary */}
        <TodayAISummary
          dailyCalories={dailyCalories}
          dailyCalorieGoal={goals.dailyCalories}
          weeklyWorkouts={weeklyWorkoutCount}
          weeklyWorkoutGoal={goals.weeklyWorkouts}
        />

        {/* At-a-glance stats */}
        <QuickStatsStrip
          dailyCalories={dailyCalories}
          dailyCalorieGoal={goals.dailyCalories}
          weeklyWorkouts={weeklyWorkoutCount}
          weeklyWorkoutGoal={goals.weeklyWorkouts}
        />

        <WeeklyCaloriesChart data={getWeeklyCaloriesByDay(diets)} />

        <GoalsSection
          goals={goals}
          calorieProgress={calorieProgress}
          workoutProgress={workoutProgress}
          dailyCalories={dailyCalories}
          weeklyWorkouts={weeklyWorkoutCount}
          onEditGoals={onOpen}
        />

        {/* Widget row: equal-height cards, stretch on desktop */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6} alignItems="stretch">
          <Box height="100%" minW={0}>
            <WeeklySummaryCard
              weeklyWorkouts={weeklyWorkoutCount}
              weeklyWorkoutGoal={goals.weeklyWorkouts}
              avgCaloriesThisWeek={avgCaloriesThisWeek}
              loggingStreak={loggingStreak}
            />
          </Box>
          <Box height="100%" minW={0}>
            <RecommendedActionsCard onScrollToDiet={scrollToDiet} onScrollToWorkout={scrollToWorkout} />
          </Box>
          <Box height="100%" minW={0}>
            <QuickActionsCard onScrollToDiet={scrollToDiet} onScrollToWorkout={scrollToWorkout} />
          </Box>
          <Box height="100%" minW={0}>
            <RecentActivityCard items={recentActivity} />
          </Box>
        </SimpleGrid>

        {/* Diet and Workout sections */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <MotionBox
            id="diet-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DietSection
              diets={diets}
              onAddDiet={handleAddDiet}
              onUpdateDiet={handleUpdateDiet}
              onDeleteDiet={handleDeleteDiet}
            />
          </MotionBox>
          <MotionBox
            id="workout-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <WorkoutSection
              workouts={workouts}
              onAddWorkout={handleAddWorkout}
              onUpdateWorkout={handleUpdateWorkout}
              onDeleteWorkout={handleDeleteWorkout}
            />
          </MotionBox>
        </SimpleGrid>

        <GoalsModal
          isOpen={isOpen}
          onClose={onClose}
          editingGoals={editingGoals}
          onEditingGoalsChange={setEditingGoals}
          onSave={handleSaveGoals}
        />
      </VStack>
    </Container>
  );
}

export default Dashboard;