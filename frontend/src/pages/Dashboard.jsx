import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  SimpleGrid,
  Badge,
  Heading,
  HStack,
  Text,
  useToast,
  useDisclosure,
  Spinner,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiAward, FiActivity, FiPackage, FiCoffee } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { getDiets, addDiet, getWorkouts, addWorkout, deleteDiet, deleteWorkout, updateDiet, updateWorkout } from '../services/api';
// Diet sub-components
import { DailySummaryCard as DietDailySummaryCard, DietForm, DietCard } from '../components/Dashboard/DietSection/components';
// Workout sub-components
import { DailySummaryCard as WorkoutDailySummaryCard, WorkoutForm, WorkoutCard } from '../components/Dashboard/WorkoutSection/components';
import {
  GoalsSection,
  GoalsModal,
  QuickStatsStrip,
  TodayAISummary,
  DailyReadinessCard,
  DailyActionsCard,
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
  calculateDailyReadiness,
  handleApiError,
  handleApiSuccess,
  transformDietData,
  transformWorkoutData,
  getDailyActionPlan,
} from '../components/Dashboard/utils/dashboardUtils';
import { getTodayDayKey, toDayKey } from '../utils/dateUtils';

const MotionBox = motion(Box);

const initialDietForm = {
  date: getTodayDayKey(),
  mealType: '',
  foodName: '',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  notes: ''
};

const initialWorkoutForm = {
  date: getTodayDayKey(),
  type: '',
  workoutName: '',
  duration: '',
  caloriesBurned: '',
  intensity: '',
  equipment: '',
  notes: ''
};

function Dashboard() {
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

  // Diet form state (lifted for grid alignment)
  const [dietFormData, setDietFormData] = useState(initialDietForm);
  const [isDietEditing, setIsDietEditing] = useState(false);
  const [dietEditingId, setDietEditingId] = useState(null);
  const [dietSelectedDate, setDietSelectedDate] = useState(getTodayDayKey());

  // Workout form state (lifted for grid alignment)
  const [workoutFormData, setWorkoutFormData] = useState(initialWorkoutForm);
  const [isWorkoutEditing, setIsWorkoutEditing] = useState(false);
  const [workoutEditingId, setWorkoutEditingId] = useState(null);
  const [workoutSelectedDate, setWorkoutSelectedDate] = useState(getTodayDayKey());

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

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
  }, [toast]);

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

  const handleSaveGoals = useCallback(() => {
    setGoals(editingGoals);
    onClose();
    handleApiSuccess(toast, 'Goals updated successfully');
  }, [editingGoals, onClose, toast]);

  const dailyCalories = useMemo(() => calculateDailyCalories(diets), [diets]);
  const weeklyWorkoutCount = useMemo(() => calculateWeeklyWorkouts(workouts), [workouts]);
  const calorieProgress = useMemo(
    () => calculateProgress(dailyCalories, goals.dailyCalories),
    [dailyCalories, goals.dailyCalories]
  );
  const workoutProgress = useMemo(
    () => calculateProgress(weeklyWorkoutCount, goals.weeklyWorkouts),
    [goals.weeklyWorkouts, weeklyWorkoutCount]
  );
  const avgCaloriesThisWeek = useMemo(() => getWeeklyCaloriesAverage(diets), [diets]);
  const weeklyCaloriesByDay = useMemo(() => getWeeklyCaloriesByDay(diets), [diets]);
  const recentActivity = useMemo(() => getRecentActivity(diets, workouts, 6), [diets, workouts]);
  const loggingStreak = useMemo(() => getLoggingStreak(diets, workouts), [diets, workouts]);
  const readiness = useMemo(() => calculateDailyReadiness(workouts, diets), [diets, workouts]);
  const dailyActions = useMemo(
    () => getDailyActionPlan(readiness, dailyCalories, goals.dailyCalories),
    [dailyCalories, goals.dailyCalories, readiness]
  );

  const scrollToDiet = useCallback(
    () => document.getElementById('diet-section')?.scrollIntoView({ behavior: 'smooth' }),
    []
  );
  const scrollToWorkout = useCallback(
    () => document.getElementById('workout-section')?.scrollIntoView({ behavior: 'smooth' }),
    []
  );

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
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          <TodayAISummary
            dailyCalories={dailyCalories}
            dailyCalorieGoal={goals.dailyCalories}
            weeklyWorkouts={weeklyWorkoutCount}
            weeklyWorkoutGoal={goals.weeklyWorkouts}
          />
          <DailyReadinessCard readiness={readiness} />
          <DailyActionsCard actions={dailyActions} />
        </SimpleGrid>

        {/* At-a-glance stats */}
        <QuickStatsStrip
          dailyCalories={dailyCalories}
          dailyCalorieGoal={goals.dailyCalories}
          weeklyWorkouts={weeklyWorkoutCount}
          weeklyWorkoutGoal={goals.weeklyWorkouts}
        />

        <WeeklyCaloriesChart data={weeklyCaloriesByDay} />

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

        {/* ─── Diet + Workout: 3-row CSS Grid for perfect alignment ─── */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
          gridTemplateRows={{ md: 'auto auto 1fr' }}
          gap={8}
        >
          {/* ── Row 1: Daily Summary Cards ── */}
          <MotionBox
            id="diet-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DietDailySummaryCard
              diets={diets}
              selectedDate={dietSelectedDate}
              setSelectedDate={setDietSelectedDate}
            />
          </MotionBox>
          <MotionBox
            id="workout-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <WorkoutDailySummaryCard
              workouts={workouts}
              selectedDate={workoutSelectedDate}
              setSelectedDate={setWorkoutSelectedDate}
            />
          </MotionBox>

          {/* ── Row 2: Add Record Forms ── */}
          <Box>
            <DietForm
              isEditing={isDietEditing}
              onSubmit={async (data) => {
                try {
                  if (isDietEditing) {
                    await handleUpdateDiet(dietEditingId, data);
                    setIsDietEditing(false);
                    setDietEditingId(null);
                  } else {
                    await handleAddDiet(data);
                  }
                  setDietFormData(initialDietForm);
                } catch (e) { console.error(e); }
              }}
              onCancel={() => { setIsDietEditing(false); setDietEditingId(null); setDietFormData(initialDietForm); }}
              initialData={dietFormData}
            />
          </Box>
          <Box>
            <WorkoutForm
              isEditing={isWorkoutEditing}
              onSubmit={async (data) => {
                try {
                  if (isWorkoutEditing) {
                    await handleUpdateWorkout(workoutEditingId, data);
                    setIsWorkoutEditing(false);
                    setWorkoutEditingId(null);
                  } else {
                    await handleAddWorkout(data);
                  }
                  setWorkoutFormData(initialWorkoutForm);
                } catch (e) { console.error(e); }
              }}
              onCancel={() => { setIsWorkoutEditing(false); setWorkoutEditingId(null); setWorkoutFormData(initialWorkoutForm); }}
              initialData={workoutFormData}
            />
          </Box>

          {/* ── Row 3: Log Sections (always aligned) ── */}
          <Box
            p={{ base: 5, md: 6 }}
            bg={bgColor}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="lg"
            display="flex"
            flexDirection="column"
          >
            <VStack spacing={4} align="stretch" h="100%">
              <HStack justify="space-between" align={{ base: 'start', md: 'center' }} flexWrap="wrap" gap={3}>
                <Box>
                  <Heading size="md" color={textColor} display="flex" alignItems="center" gap={2}>
                    <Box as={FiPackage} />
                    Nutrition Log
                  </Heading>
                  <Text fontSize="sm" color={subTextColor} mt={1}>
                    Recent meal entries with clearer macro detail and easier scanning.
                  </Text>
                </Box>
                <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                  {diets.length} total record{diets.length === 1 ? '' : 's'}
                </Badge>
              </HStack>
              {(() => {
                const recentDiets = [...(Array.isArray(diets) ? diets : [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
                return recentDiets.length === 0 ? (
                  <VStack spacing={4} py={8} px={2} align="center" justify="center" flex="1">
                    <Box as={FiCoffee} boxSize="48px" color={subTextColor} />
                    <Text fontSize="lg" color={textColor} textAlign="center" fontWeight="medium">No diet records yet</Text>
                    <Text fontSize="sm" color={subTextColor} textAlign="center" maxW="320px">Start your nutrition journey. Log your first meal to begin tracking progress.</Text>
                  </VStack>
                ) : (
                  <>
                    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} alignItems="stretch">
                      {recentDiets.map((diet) => (
                        <DietCard
                          key={diet._id}
                          diet={diet}
                          onEdit={(d) => { setIsDietEditing(true); setDietEditingId(d._id); setDietFormData({ date: toDayKey(d.date), mealType: d.mealType || '', foodName: d.foodName || '', calories: d.calories?.toString() || '', protein: d.protein?.toString() || '', carbs: d.carbs?.toString() || '', fats: d.fats?.toString() || '', notes: d.notes || '' }); }}
                          onDelete={handleDeleteDiet}
                        />
                      ))}
                    </SimpleGrid>
                    {diets.length > 6 && <Text fontSize="sm" color={subTextColor} textAlign="center" mt={4}>Showing the 6 most recent nutrition records.</Text>}
                  </>
                );
              })()}
            </VStack>
          </Box>

          <Box
            p={{ base: 5, md: 6 }}
            bg={bgColor}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="lg"
            display="flex"
            flexDirection="column"
          >
            <VStack spacing={4} align="stretch" h="100%">
              <HStack justify="space-between" align={{ base: 'start', md: 'center' }} flexWrap="wrap" gap={3}>
                <Box>
                  <Heading size="md" color={textColor} display="flex" alignItems="center" gap={2}>
                    <Box as={FiAward} />
                    Training Log
                  </Heading>
                  <Text fontSize="sm" color={subTextColor} mt={1}>
                    Recent sessions with clearer performance and burn details.
                  </Text>
                </Box>
                <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                  {workouts.length} total record{workouts.length === 1 ? '' : 's'}
                </Badge>
              </HStack>
              {(() => {
                const recentWorkouts = [...(Array.isArray(workouts) ? workouts : [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
                return recentWorkouts.length === 0 ? (
                  <VStack spacing={4} py={8} px={2} align="center" justify="center" flex="1">
                    <Box as={FiActivity} boxSize="48px" color={subTextColor} />
                    <Text fontSize="lg" color={textColor} textAlign="center" fontWeight="medium">No workout records yet</Text>
                    <Text fontSize="sm" color={subTextColor} textAlign="center" maxW="320px">Add your first workout to start building your fitness streak.</Text>
                  </VStack>
                ) : (
                  <>
                    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} alignItems="stretch">
                      {recentWorkouts.map((workout) => (
                        <WorkoutCard
                          key={workout._id}
                          workout={workout}
                          onEdit={(w) => { setIsWorkoutEditing(true); setWorkoutEditingId(w._id); setWorkoutFormData({ date: toDayKey(w.date), type: w.type || '', workoutName: w.workoutName || w.type || '', duration: w.duration?.toString() || '', caloriesBurned: w.caloriesBurned?.toString() || '', intensity: w.intensity || '', equipment: w.equipment || '', notes: w.notes || '' }); }}
                          onDelete={handleDeleteWorkout}
                        />
                      ))}
                    </SimpleGrid>
                    {workouts.length > 6 && <Text fontSize="sm" color={subTextColor} textAlign="center" mt={4}>Showing the 6 most recent workout records.</Text>}
                  </>
                );
              })()}
            </VStack>
          </Box>
        </Box>

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
