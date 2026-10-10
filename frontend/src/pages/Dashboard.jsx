import { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TabIndicator,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DURATION, EASE_OUT } from '../components/Motion/tokens';
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
  CheckInForm,
  GettingStarted,
  GoalsModal,
  QuickPanel,
  RhythmCard,
  TodayFlowsCard,
  TodayScoreboard,
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
  hasAskedCoach,
  transformDietData,
  transformWorkoutData,
  getDailyActionPlan,
} from '../components/Dashboard/utils/dashboardUtils';
import { formatDayKey, getTodayDayKey, toDayKey } from '../utils/dateUtils';

const DEFAULT_GOALS = { dailyCalories: 2000, dailyProtein: 150, weeklyWorkouts: 5 };
const RECENT_LOG_LIMIT = 6;
const MotionBox = motion(Box);

// Dashboard sections rise in once, in reading order.
const enter = (index) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.slow, ease: EASE_OUT, delay: index * 0.07 },
});
// The mobile tab bar deep-links into the log tabs with these hashes.
const LOG_TABS = ['#log-fuel', '#log-train'];

const PANELS = {
  checkin: { title: 'Daily check-in', description: 'Twenty seconds. It sharpens today’s readiness score.' },
  meal: { title: 'Log a meal', description: 'Search a food and the numbers fill in for you.' },
  workout: { title: 'Log a workout', description: 'Pick an exercise or type your own.' },
};

const initialDietForm = () => ({
  date: getTodayDayKey(),
  mealType: '',
  foodName: '',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  notes: ''
});

const initialWorkoutForm = () => ({
  date: getTodayDayKey(),
  type: '',
  workoutName: '',
  duration: '',
  caloriesBurned: '',
  intensity: '',
  equipment: '',
  notes: ''
});

const greetingFor = (date) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const newestFirst = (records) =>
  [...records].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, RECENT_LOG_LIMIT);

/** Recent entries for one flow, with an add button and an empty state that says what to do. */
function RecentLog({ title, records, total, emptyText, renderItem, addLabel, onAdd }) {
  return (
    <Card>
      <CardBody py={4}>
        <Flex justify="space-between" align="center" gap={3} pb={1}>
          <Box>
            <Heading as="h3" size="sm">{title}</Heading>
            <Text fontSize="xs" color="fg.muted">{total} logged</Text>
          </Box>
          <Button size="sm" variant="outline" onClick={onAdd}>{addLabel}</Button>
        </Flex>
        {records.length === 0 ? (
          <Text fontSize="sm" color="fg.muted" py={6}>{emptyText}</Text>
        ) : (
          <>
            <Box>
              {/* New entries slide in and deleted ones collapse, so the change is visible. */}
              <AnimatePresence initial={false}>
                {records.map((record) => (
                  <MotionBox
                    key={record._id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: DURATION.base, ease: EASE_OUT }}
                    overflow="hidden"
                  >
                    {renderItem(record)}
                  </MotionBox>
                ))}
              </AnimatePresence>
            </Box>
            {total > RECENT_LOG_LIMIT && (
              <Text fontSize="sm" color="fg.muted" pt={2}>
                Showing the {RECENT_LOG_LIMIT} most recent.
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
      <Skeleton h="72px" w="320px" borderRadius="lg" mb={6} />
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
        <Skeleton h="160px" borderRadius="panel" />
        <Skeleton h="160px" borderRadius="panel" />
        <Skeleton h="160px" borderRadius="panel" />
      </SimpleGrid>
      <Skeleton h="220px" borderRadius="panel" mt={8} />
    </Container>
  );
}

function Dashboard() {
  const toast = useToast();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, updateUser } = useContext(AuthContext);
  const userId = user?.user?._id || 'anonymous';
  const goals = useMemo(() => ({ ...DEFAULT_GOALS, ...user?.user?.goals }), [user]);
  const [editingGoals, setEditingGoals] = useState(goals);

  const [diets, setDiets] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCheckIn, setIsSavingCheckIn] = useState(false);
  const [logTab, setLogTab] = useState(Math.max(LOG_TABS.indexOf(location.hash), 0));
  // Which quick panel is open: 'checkin' | 'meal' | 'workout' | null.
  const [panel, setPanel] = useState(null);

  // Diet form state
  const [dietFormData, setDietFormData] = useState(initialDietForm);
  const [dietEditingId, setDietEditingId] = useState(null);
  const [dietSelectedDate, setDietSelectedDate] = useState(getTodayDayKey());

  // Workout form state
  const [workoutFormData, setWorkoutFormData] = useState(initialWorkoutForm);
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
    document.getElementById('log')?.scrollIntoView({ block: 'start' });
  }, [location.hash, location.key, isLoading]);

  const openPanel = useCallback((key) => {
    if (key === 'meal') {
      setDietEditingId(null);
      setDietFormData(initialDietForm());
    }
    if (key === 'workout') {
      setWorkoutEditingId(null);
      setWorkoutFormData(initialWorkoutForm());
    }
    setPanel(key);
  }, []);

  const closePanel = useCallback(() => {
    setPanel(null);
    setDietEditingId(null);
    setWorkoutEditingId(null);
  }, []);

  const handleAddDiet = useCallback(async (dietData) => {
    try {
      const transformedData = transformDietData(dietData);
      const newDiet = await addDiet(transformedData);
      setDiets((prev) => [...prev, newDiet]);
      handleApiSuccess(toast, 'Meal logged');
      return true;
    } catch (error) {
      handleApiError(error, toast, 'adding diet');
      return false;
    }
  }, [toast]);

  const handleUpdateDiet = useCallback(async (id, dietData) => {
    try {
      const transformedData = transformDietData(dietData);
      const updatedDiet = await updateDiet(id, transformedData);
      setDiets((prev) => prev.map((diet) => (diet._id === id ? updatedDiet : diet)));
      handleApiSuccess(toast, 'Meal updated');
      return true;
    } catch (error) {
      handleApiError(error, toast, 'updating diet');
      return false;
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
      return true;
    } catch (error) {
      handleApiError(error, toast, 'adding workout');
      return false;
    }
  }, [toast]);

  const handleUpdateWorkout = useCallback(async (id, workoutData) => {
    try {
      const transformedData = transformWorkoutData(workoutData);
      const updatedWorkout = await updateWorkout(id, transformedData);
      setWorkouts((prev) => prev.map((w) => (w._id === id ? updatedWorkout : w)));
      handleApiSuccess(toast, 'Workout updated');
      return true;
    } catch (error) {
      handleApiError(error, toast, 'updating workout');
      return false;
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
      setPanel(null);
    } catch (error) {
      handleApiError(error, toast, 'saving check-in');
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
  const onboardingSteps = useMemo(() => [
    { key: 'checkin', label: 'Do your first check-in', flow: 'recover', done: checkIns.length > 0 },
    { key: 'meal', label: 'Log a meal', flow: 'fuel', done: diets.length > 0 },
    { key: 'workout', label: 'Log a workout', flow: 'train', done: workouts.length > 0 },
    { key: 'coach', label: 'Ask your coach', flow: 'recover', done: hasAskedCoach(userId), to: '/fitness-hub' },
  ], [checkIns.length, diets.length, workouts.length, userId]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const firstName = (user?.user?.username || '').split(/[\s._]/)[0];

  const submitDiet = async (data) => {
    const ok = dietEditingId ? await handleUpdateDiet(dietEditingId, data) : await handleAddDiet(data);
    if (ok) closePanel();
  };
  const submitWorkout = async (data) => {
    const ok = workoutEditingId ? await handleUpdateWorkout(workoutEditingId, data) : await handleAddWorkout(data);
    if (ok) closePanel();
  };

  return (
    <Container maxW="container.xl" py={{ base: 6, md: 10 }} px={{ base: 4, md: 6 }}>
      <VStack spacing={{ base: 8, md: 10 }} align="stretch">
        <TodayScoreboard
          greeting={`${greetingFor(new Date())}${firstName ? `, ${firstName}` : ''}.`}
          dateLabel={formatDayKey(todayKey, { weekday: 'long', month: 'long', day: 'numeric' })}
          readiness={readiness}
          today={today}
          goals={goals}
          checkIn={todayCheckIn}
          onAction={openPanel}
        />

        <GettingStarted userId={userId} steps={onboardingSteps} onAction={openPanel} />

        <MotionBox {...enter(1)}>
          <TodayFlowsCard
            goals={goals}
            today={today}
            actions={dailyActions}
            hasCheckIn={Boolean(todayCheckIn)}
            onEditGoals={openGoalsEditor}
          />
        </MotionBox>

        <MotionBox {...enter(2)} display="grid" gridTemplateColumns={{ base: '1fr', lg: '7fr 5fr' }} gap={6}>
          <RhythmCard rhythm={rhythm} />
          <WeeklyCaloriesChart data={weeklyCaloriesByDay} goal={goals.dailyCalories} />
        </MotionBox>

        <MotionBox {...enter(3)} id="log" scrollMarginTop="88px">
          <Heading as="h2" size="lg" mb={4}>Log</Heading>
          <Tabs index={logTab} onChange={setLogTab} variant="unstyled" position="relative">
            <TabList mb={5} borderBottomWidth="1px" borderColor="border">
              {['Meals', 'Workouts'].map((label) => (
                <Tab key={label} px={4} py={2.5} fontWeight={600} color="fg.muted" _selected={{ color: 'fg' }} _hover={{ color: 'fg' }}>
                  {label}
                </Tab>
              ))}
            </TabList>
            {/* Sliding underline between the two tabs. */}
            <TabIndicator mt="-22px" height="2px" bg="border.strong" borderRadius="1px" />
            <TabPanels>
              <TabPanel p={0}>
                <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: '5fr 7fr' }} gap={6} alignItems="start">
                  <DietDailySummaryCard
                    diets={diets}
                    selectedDate={dietSelectedDate}
                    setSelectedDate={setDietSelectedDate}
                  />
                  <RecentLog
                    title="Recent meals"
                    records={recentDiets}
                    total={diets.length}
                    addLabel="Log meal"
                    onAdd={() => openPanel('meal')}
                    emptyText="No meals yet. Log your first one and your fuel starts filling in."
                    renderItem={(diet) => (
                      <DietCard
                        diet={diet}
                        onEdit={(d) => {
                          setDietEditingId(d._id);
                          setDietFormData({ date: toDayKey(d.date), mealType: d.mealType || '', foodName: d.foodName || '', calories: d.calories?.toString() || '', protein: d.protein?.toString() || '', carbs: d.carbs?.toString() || '', fats: d.fats?.toString() || '', notes: d.notes || '' });
                          setPanel('meal');
                        }}
                        onDelete={handleDeleteDiet}
                      />
                    )}
                  />
                </Box>
              </TabPanel>
              <TabPanel p={0}>
                <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: '5fr 7fr' }} gap={6} alignItems="start">
                  <WorkoutDailySummaryCard
                    workouts={workouts}
                    selectedDate={workoutSelectedDate}
                    setSelectedDate={setWorkoutSelectedDate}
                  />
                  <RecentLog
                    title="Recent workouts"
                    records={recentWorkouts}
                    total={workouts.length}
                    addLabel="Log workout"
                    onAdd={() => openPanel('workout')}
                    emptyText="No workouts yet. Log your first one and your training starts filling in."
                    renderItem={(workout) => (
                      <WorkoutCard
                        workout={workout}
                        onEdit={(w) => {
                          setWorkoutEditingId(w._id);
                          setWorkoutFormData({ date: toDayKey(w.date), type: w.type || '', workoutName: w.workoutName || w.type || '', duration: w.duration?.toString() || '', caloriesBurned: w.caloriesBurned?.toString() || '', intensity: w.intensity || '', equipment: w.equipment || '', notes: w.notes || '' });
                          setPanel('workout');
                        }}
                        onDelete={handleDeleteWorkout}
                      />
                    )}
                  />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </MotionBox>
      </VStack>

      <QuickPanel
        isOpen={panel !== null}
        onClose={closePanel}
        title={
          panel === 'meal' && dietEditingId ? 'Edit meal'
            : panel === 'workout' && workoutEditingId ? 'Edit workout'
              : PANELS[panel]?.title
        }
        description={PANELS[panel]?.description}
      >
        {panel === 'checkin' && (
          <CheckInForm checkIn={todayCheckIn} onSave={handleSaveCheckIn} isSaving={isSavingCheckIn} />
        )}
        {panel === 'meal' && (
          <DietForm
            isEditing={Boolean(dietEditingId)}
            onSubmit={submitDiet}
            onCancel={closePanel}
            initialData={dietFormData}
          />
        )}
        {panel === 'workout' && (
          <WorkoutForm
            isEditing={Boolean(workoutEditingId)}
            onSubmit={submitWorkout}
            onCancel={closePanel}
            initialData={workoutFormData}
          />
        )}
      </QuickPanel>

      <GoalsModal
        isOpen={isOpen}
        onClose={onClose}
        editingGoals={editingGoals}
        onEditingGoalsChange={setEditingGoals}
        onSave={handleSaveGoals}
      />
    </Container>
  );
}

export default Dashboard;
