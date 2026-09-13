import { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import {
  Badge,
  Box,
  Card,
  CardBody,
  Container,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiActivity, FiCoffee } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import {
  getDiets,
  addDiet,
  getWorkouts,
  addWorkout,
  deleteDiet,
  deleteWorkout,
  updateDiet,
  updateWorkout,
  updateGoals,
  getCheckIns,
  saveCheckIn,
} from '../services/api';
import { AuthContext } from '../context/AuthContext';
// Diet sub-components
import { DailySummaryCard as DietDailySummaryCard, DietForm, DietCard } from '../components/Dashboard/DietSection/components';
// Workout sub-components
import { DailySummaryCard as WorkoutDailySummaryCard, WorkoutForm, WorkoutCard } from '../components/Dashboard/WorkoutSection/components';
import {
  GoalsModal,
  ReadinessCheckInCard,
  RhythmCard,
  TodayFlowsCard,
  WeeklyCaloriesChart,
} from '../components/Dashboard/components';
import {
  calculateDailyCalories,
  calculateDailyProtein,
  calculateWeeklyWorkouts,
  getWeeklyCaloriesByDay,
  getRhythm,
  calculateDailyReadiness,
  handleApiError,
  handleApiSuccess,
  transformDietData,
  transformWorkoutData,
  getDailyActionPlan,
} from '../components/Dashboard/utils/dashboardUtils';
import { formatDayKey, getTodayDayKey, toDayKey } from '../utils/dateUtils';

const DEFAULT_GOALS = { dailyCalories: 2000, dailyProtein: 150, weeklyWorkouts: 5 };
const RECENT_LOG_LIMIT = 6;
// The mobile tab bar deep-links into the log tabs with these hashes.
const LOG_TABS = ['#log-fuel', '#log-train'];

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

const greetingFor = (date) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const newestFirst = (records) =>
  [...records].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, RECENT_LOG_LIMIT);

const scrollToForm = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** Recent entries for one flow, with an empty state that tells the user what to do next. */
function RecentLog({ title, flow, icon, records, total, emptyText, renderItem }) {
  return (
    <Card variant="flat">
      <CardBody display="flex" flexDirection="column" gap={4}>
        <Flex justify="space-between" align="center" gap={3}>
          <Heading as="h3" size="sm">{title}</Heading>
          <Badge bg={`${flow}.bg`} color={`${flow}.fg`} borderRadius="full" px={3} py={1} textTransform="none">
            {total} total
          </Badge>
        </Flex>
        {records.length === 0 ? (
          <VStack spacing={3} py={8} px={2}>
            <Icon as={icon} boxSize="40px" color={`${flow}.fg`} />
            <Text fontSize="sm" color="text.muted" textAlign="center" maxW="320px">{emptyText}</Text>
          </VStack>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4} alignItems="stretch">
              {records.map(renderItem)}
            </SimpleGrid>
            {total > RECENT_LOG_LIMIT && (
              <Text fontSize="sm" color="text.muted" textAlign="center">
                Showing the {RECENT_LOG_LIMIT} most recent entries.
              </Text>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <Container maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
      <Skeleton h="48px" w="280px" borderRadius="lg" mb={8} />
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Skeleton h="340px" borderRadius="2xl" />
        <Skeleton h="340px" borderRadius="2xl" />
        <Skeleton h="260px" borderRadius="2xl" />
        <Skeleton h="260px" borderRadius="2xl" />
      </SimpleGrid>
    </Container>
  );
}

function Dashboard() {
  const toast = useToast();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, updateUser } = useContext(AuthContext);
  const goals = useMemo(() => ({ ...DEFAULT_GOALS, ...user?.user?.goals }), [user]);
  const [editingGoals, setEditingGoals] = useState(goals);

  const [diets, setDiets] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCheckIn, setIsSavingCheckIn] = useState(false);
  const [logTab, setLogTab] = useState(Math.max(LOG_TABS.indexOf(location.hash), 0));

  // Diet form state
  const [dietFormData, setDietFormData] = useState(initialDietForm);
  const [isDietEditing, setIsDietEditing] = useState(false);
  const [dietEditingId, setDietEditingId] = useState(null);
  const [dietSelectedDate, setDietSelectedDate] = useState(getTodayDayKey());

  // Workout form state
  const [workoutFormData, setWorkoutFormData] = useState(initialWorkoutForm);
  const [isWorkoutEditing, setIsWorkoutEditing] = useState(false);
  const [workoutEditingId, setWorkoutEditingId] = useState(null);
  const [workoutSelectedDate, setWorkoutSelectedDate] = useState(getTodayDayKey());

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dietData, workoutData, checkInData] = await Promise.all([
          getDiets(),
          getWorkouts(),
          // Check-ins are additive; never let them block the core dashboard.
          getCheckIns().catch(() => []),
        ]);
        setDiets(Array.isArray(dietData) ? dietData : []);
        setWorkouts(Array.isArray(workoutData) ? workoutData : []);
        setCheckIns(Array.isArray(checkInData) ? checkInData : []);
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

  // Follow deep links like /dashboard#log-train from the tab bar.
  useEffect(() => {
    const index = LOG_TABS.indexOf(location.hash);
    if (index === -1 || isLoading) return;
    setLogTab(index);
    document.getElementById('log')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash, location.key, isLoading]);

  const handleAddDiet = useCallback(async (dietData) => {
    try {
      const transformedData = transformDietData(dietData);
      const newDiet = await addDiet(transformedData);
      setDiets((prev) => [...prev, newDiet]);
      handleApiSuccess(toast, 'Meal logged');
    } catch (error) {
      handleApiError(error, toast, 'adding diet');
    }
  }, [toast]);

  const handleUpdateDiet = useCallback(async (id, dietData) => {
    try {
      const transformedData = transformDietData(dietData);
      const updatedDiet = await updateDiet(id, transformedData);
      setDiets((prev) => prev.map((diet) => (diet._id === id ? updatedDiet : diet)));
      handleApiSuccess(toast, 'Meal updated');
    } catch (error) {
      handleApiError(error, toast, 'updating diet');
    }
  }, [toast]);

  const handleDeleteDiet = useCallback(async (id) => {
    try {
      await deleteDiet(id);
      setDiets((prev) => prev.filter((diet) => diet._id !== id));
      handleApiSuccess(toast, 'Meal deleted');
    } catch (error) {
      handleApiError(error, toast, 'deleting diet record');
    }
  }, [toast]);

  const handleAddWorkout = useCallback(async (workoutData) => {
    try {
      const transformedData = transformWorkoutData(workoutData);
      const newWorkout = await addWorkout(transformedData);
      setWorkouts((prev) => [...prev, newWorkout]);
      handleApiSuccess(toast, 'Workout logged');
    } catch (error) {
      handleApiError(error, toast, 'adding workout');
    }
  }, [toast]);

  const handleUpdateWorkout = useCallback(async (id, workoutData) => {
    try {
      const transformedData = transformWorkoutData(workoutData);
      const updatedWorkout = await updateWorkout(id, transformedData);
      setWorkouts((prev) => prev.map((w) => (w._id === id ? updatedWorkout : w)));
      handleApiSuccess(toast, 'Workout updated');
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

  const openGoalsEditor = useCallback(() => {
    setEditingGoals(goals);
    onOpen();
  }, [goals, onOpen]);

  const handleSaveGoals = useCallback(async () => {
    try {
      const response = await updateGoals(editingGoals);
      updateUser({ ...user, user: response.user });
      onClose();
      handleApiSuccess(toast, 'Goals updated successfully');
    } catch (error) {
      handleApiError(error, toast, 'updating goals');
    }
  }, [editingGoals, onClose, toast, updateUser, user]);

  const todayKey = getTodayDayKey();
  const todayCheckIn = useMemo(() => checkIns.find((c) => c.dayKey === todayKey) || null, [checkIns, todayKey]);

  const handleSaveCheckIn = useCallback(async (values) => {
    setIsSavingCheckIn(true);
    try {
      const saved = await saveCheckIn(todayKey, values);
      setCheckIns((prev) => [saved, ...prev.filter((c) => c.dayKey !== saved.dayKey)]);
      handleApiSuccess(toast, 'Check-in saved');
      return true;
    } catch (error) {
      handleApiError(error, toast, 'saving check-in');
      return false;
    } finally {
      setIsSavingCheckIn(false);
    }
  }, [toast, todayKey]);

  const today = useMemo(() => ({
    calories: calculateDailyCalories(diets),
    protein: calculateDailyProtein(diets),
    weeklyWorkouts: calculateWeeklyWorkouts(workouts),
  }), [diets, workouts]);
  const weeklyCaloriesByDay = useMemo(() => getWeeklyCaloriesByDay(diets), [diets]);
  const rhythm = useMemo(() => getRhythm(diets, workouts, checkIns), [diets, workouts, checkIns]);
  const readiness = useMemo(
    () => calculateDailyReadiness(workouts, diets, todayCheckIn),
    [diets, workouts, todayCheckIn]
  );
  const dailyActions = useMemo(
    () => getDailyActionPlan(readiness, today.calories, goals.dailyCalories),
    [goals.dailyCalories, readiness, today.calories]
  );
  const recentDiets = useMemo(() => newestFirst(diets), [diets]);
  const recentWorkouts = useMemo(() => newestFirst(workouts), [workouts]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const firstName = (user?.user?.username || '').split(/[\s._]/)[0];

  return (
    <Container maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
      <VStack spacing={{ base: 6, md: 8 }} align="stretch">
        <Box>
          <Text fontSize="sm" color="text.muted" fontWeight="500">
            {formatDayKey(todayKey, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Heading as="h1" size="xl" mt={1}>
            {greetingFor(new Date())}{firstName ? `, ${firstName}` : ''}.
          </Heading>
        </Box>

        <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: '5fr 7fr' }} gap={6}>
          <ReadinessCheckInCard
            key={todayCheckIn?.updatedAt || 'no-check-in'}
            readiness={readiness}
            checkIn={todayCheckIn}
            onSaveCheckIn={handleSaveCheckIn}
            isSaving={isSavingCheckIn}
          />
          <TodayFlowsCard
            goals={goals}
            today={today}
            actions={dailyActions}
            hasCheckIn={Boolean(todayCheckIn)}
            onEditGoals={openGoalsEditor}
          />
        </Box>

        <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: '7fr 5fr' }} gap={6}>
          <RhythmCard rhythm={rhythm} />
          <WeeklyCaloriesChart data={weeklyCaloriesByDay} goal={goals.dailyCalories} />
        </Box>

        <Box id="log" scrollMarginTop="88px">
          <Heading as="h2" size="lg" mb={4}>Log</Heading>
          <Tabs index={logTab} onChange={setLogTab} variant="soft-rounded">
            <TabList gap={2} mb={5}>
              <Tab _selected={{ bg: 'fuel.bg', color: 'fuel.fg' }} color="text.muted" gap={2}>
                <Icon as={FiCoffee} /> Fuel
              </Tab>
              <Tab _selected={{ bg: 'train.bg', color: 'train.fg' }} color="text.muted" gap={2}>
                <Icon as={FiActivity} /> Train
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Box display="grid" gridTemplateColumns={{ base: '1fr', xl: '5fr 7fr' }} gap={6} alignItems="start">
                  <VStack spacing={6} align="stretch">
                    <DietDailySummaryCard
                      diets={diets}
                      selectedDate={dietSelectedDate}
                      setSelectedDate={setDietSelectedDate}
                    />
                    <Box id="diet-form" scrollMarginTop="88px">
                      <DietForm
                        isEditing={isDietEditing}
                        onSubmit={async (data) => {
                          if (isDietEditing) {
                            await handleUpdateDiet(dietEditingId, data);
                            setIsDietEditing(false);
                            setDietEditingId(null);
                          } else {
                            await handleAddDiet(data);
                          }
                          setDietFormData(initialDietForm);
                        }}
                        onCancel={() => { setIsDietEditing(false); setDietEditingId(null); setDietFormData(initialDietForm); }}
                        initialData={dietFormData}
                      />
                    </Box>
                  </VStack>
                  <RecentLog
                    title="Recent meals"
                    flow="fuel"
                    icon={FiCoffee}
                    records={recentDiets}
                    total={diets.length}
                    emptyText="Log your first meal and your Fuel flow starts filling in."
                    renderItem={(diet) => (
                      <DietCard
                        key={diet._id}
                        diet={diet}
                        onEdit={(d) => {
                          setIsDietEditing(true);
                          setDietEditingId(d._id);
                          setDietFormData({ date: toDayKey(d.date), mealType: d.mealType || '', foodName: d.foodName || '', calories: d.calories?.toString() || '', protein: d.protein?.toString() || '', carbs: d.carbs?.toString() || '', fats: d.fats?.toString() || '', notes: d.notes || '' });
                          scrollToForm('diet-form');
                        }}
                        onDelete={handleDeleteDiet}
                      />
                    )}
                  />
                </Box>
              </TabPanel>
              <TabPanel p={0}>
                <Box display="grid" gridTemplateColumns={{ base: '1fr', xl: '5fr 7fr' }} gap={6} alignItems="start">
                  <VStack spacing={6} align="stretch">
                    <WorkoutDailySummaryCard
                      workouts={workouts}
                      selectedDate={workoutSelectedDate}
                      setSelectedDate={setWorkoutSelectedDate}
                    />
                    <Box id="workout-form" scrollMarginTop="88px">
                      <WorkoutForm
                        isEditing={isWorkoutEditing}
                        onSubmit={async (data) => {
                          if (isWorkoutEditing) {
                            await handleUpdateWorkout(workoutEditingId, data);
                            setIsWorkoutEditing(false);
                            setWorkoutEditingId(null);
                          } else {
                            await handleAddWorkout(data);
                          }
                          setWorkoutFormData(initialWorkoutForm);
                        }}
                        onCancel={() => { setIsWorkoutEditing(false); setWorkoutEditingId(null); setWorkoutFormData(initialWorkoutForm); }}
                        initialData={workoutFormData}
                      />
                    </Box>
                  </VStack>
                  <RecentLog
                    title="Recent sessions"
                    flow="train"
                    icon={FiActivity}
                    records={recentWorkouts}
                    total={workouts.length}
                    emptyText="Add your first workout and your Train flow starts filling in."
                    renderItem={(workout) => (
                      <WorkoutCard
                        key={workout._id}
                        workout={workout}
                        onEdit={(w) => {
                          setIsWorkoutEditing(true);
                          setWorkoutEditingId(w._id);
                          setWorkoutFormData({ date: toDayKey(w.date), type: w.type || '', workoutName: w.workoutName || w.type || '', duration: w.duration?.toString() || '', caloriesBurned: w.caloriesBurned?.toString() || '', intensity: w.intensity || '', equipment: w.equipment || '', notes: w.notes || '' });
                          scrollToForm('workout-form');
                        }}
                        onDelete={handleDeleteWorkout}
                      />
                    )}
                  />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
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
