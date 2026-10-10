import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from '@chakra-ui/react';
import PageBand from '../components/Global/PageBand';
import FitnessHubPlansSection from '../components/FitnessHub/FitnessHubPlansSection';
import FitnessHubDiscoverySection from '../components/FitnessHub/FitnessHubDiscoverySection';
import ExerciseDetailsModal from '../components/FitnessHub/ExerciseDetailsModal';
import usePlanLibrary from '../components/Library/usePlanLibrary';
import { DISCOVERY_EXERCISES } from '../components/Library/exercises';

const noop = () => {};
const idleState = () => ({ loading: false, completed: false });

/** Everything you keep: plans the coach built for you, and the exercise library. */
function Library() {
  const library = usePlanLibrary();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [muscle, setMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const filteredExercises = useMemo(
    () => DISCOVERY_EXERCISES.filter((ex) => (
      (!muscle || ex.muscleGroup === muscle)
      && (!equipment || ex.equipment === equipment)
      && (!difficulty || ex.difficulty === difficulty)
    )),
    [difficulty, equipment, muscle]
  );

  const handleViewDetails = useCallback((workout) => {
    setActiveWorkout(workout);
    onOpen();
  }, [onOpen]);

  const handleCloseDetails = useCallback(() => {
    onClose();
    setActiveWorkout(null);
  }, [onClose]);

  const shared = {
    sectionRef: null,
    compact: true,
  };

  return (
    <Box>
      <PageBand
        flow="fuel"
        title="Library"
        description="Plans your coach built for you, ready to log in one tap, and exercises to browse."
      />
      <Container maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
        <Tabs variant="unstyled" position="relative" isLazy>
          <TabList mb={6} borderBottomWidth="1px" borderColor="border">
            {['Plans', 'Exercises'].map((label) => (
              <Tab key={label} px={4} py={2.5} fontWeight={600} color="fg.muted" _selected={{ color: 'fg' }} _hover={{ color: 'fg' }}>
                {label}
              </Tab>
            ))}
          </TabList>
          <TabIndicator mt="-26px" height="2px" bg="border.strong" borderRadius="1px" />
          <TabPanels>
            <TabPanel p={0}>
              <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} alignItems="start">
                <FitnessHubPlansSection
                  {...shared}
                  workoutPlansOnly
                  recommendationsLoading={library.recommendationsLoading}
                  aiWorkouts={library.activePlan?.workouts || []}
                  aiGeneratedAt={library.activePlan?.generatedAt ? new Date(library.activePlan.generatedAt) : null}
                  onViewDetails={handleViewDetails}
                  savedPlans={library.savedPlans}
                  activePlanId={library.activePlan?.id || null}
                  onSelectPlan={library.setActivePlanId}
                  onCompleteWorkout={library.handleCompleteWorkout}
                  onDeletePlan={library.deletePlan}
                  getWorkoutState={library.getWorkoutState}
                  savedMealPlans={[]}
                  onSelectMealPlan={noop}
                  onDeleteMealPlan={noop}
                  onCompleteMeal={noop}
                  getMealState={idleState}
                />
                <FitnessHubPlansSection
                  {...shared}
                  mealPlansOnly
                  recommendationsLoading={false}
                  aiWorkouts={[]}
                  aiGeneratedAt={null}
                  onViewDetails={noop}
                  savedPlans={[]}
                  onSelectPlan={noop}
                  onCompleteWorkout={noop}
                  onDeletePlan={noop}
                  getWorkoutState={idleState}
                  savedMealPlans={library.savedMealPlans}
                  activeMealPlanId={library.activeMealPlan?.id || null}
                  onSelectMealPlan={library.setActiveMealPlanId}
                  onDeleteMealPlan={library.deleteMealPlan}
                  onCompleteMeal={library.handleCompleteMeal}
                  mealPlansLoading={library.mealPlansLoading}
                  getMealState={library.getMealState}
                />
              </Box>
            </TabPanel>
            <TabPanel p={0}>
              <FitnessHubDiscoverySection
                muscle={muscle}
                equipment={equipment}
                difficulty={difficulty}
                onMuscleChange={setMuscle}
                onEquipmentChange={setEquipment}
                onDifficultyChange={setDifficulty}
                filteredExercises={filteredExercises}
                totalExercises={DISCOVERY_EXERCISES.length}
                onClearFilters={() => {
                  setMuscle('');
                  setEquipment('');
                  setDifficulty('');
                }}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
      <ExerciseDetailsModal isOpen={isOpen} onClose={handleCloseDetails} workout={activeWorkout} />
    </Box>
  );
}

export default Library;
