import { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import PageBand, { PageBandFigures } from '../components/Global/PageBand';
import { SwapIn } from '../components/Motion';
import usePlanLibrary from '../components/Library/usePlanLibrary';
import useExerciseCatalog from '../components/Library/useExerciseCatalog';
import ExerciseLibrary from '../components/Library/ExerciseLibrary';
import PlansView from '../components/Library/PlansView';
import SessionDetail from '../components/Library/SessionDetail';
import { planProgress } from '../components/Library/planUtils';

/** Everything you keep: plans the coach built for you, and the exercise library. */
function Library() {
  const library = usePlanLibrary();
  const catalog = useExerciseCatalog();
  const [session, setSession] = useState(null);
  // Until the user picks a tab, open Plans whenever there are plans (they can arrive
  // from the account a moment after the page loads).
  const [chosenTab, setChosenTab] = useState(null);

  const totals = useMemo(() => {
    const items = [
      ...library.savedPlans.flatMap((plan) => plan.workouts),
      ...library.savedMealPlans.flatMap((plan) => plan.meals),
    ];
    return { plans: library.savedPlans.length + library.savedMealPlans.length, logged: planProgress(items).done };
  }, [library.savedMealPlans, library.savedPlans]);

  return (
    <Box>
      <PageBand
        flow="fuel"
        title="Library"
        description="Plans your coach built for you, ready to log in one tap, and exercises to browse."
      >
        <PageBandFigures
          items={[
            { value: totals.plans, label: totals.plans === 1 ? 'plan saved' : 'plans saved' },
            { value: totals.logged, label: 'logged from plans' },
            { value: catalog.exercises.length, label: 'exercises' },
          ]}
        />
      </PageBand>
      <Container maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
        <Tabs variant="unstyled" position="relative" isLazy index={chosenTab ?? (totals.plans ? 0 : 1)} onChange={setChosenTab}>
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
              <SwapIn>
                <PlansView
                  library={library}
                  catalog={catalog.exercises}
                  onOpenSession={(workout, index) => setSession({ workout, index })}
                />
              </SwapIn>
            </TabPanel>
            <TabPanel p={0}>
              <SwapIn>
                <ExerciseLibrary />
              </SwapIn>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
      <SessionDetail
        session={session}
        catalog={catalog.exercises}
        state={session ? library.getWorkoutState(session.index) : {}}
        onLog={library.handleCompleteWorkout}
        onClose={() => setSession(null)}
      />
    </Box>
  );
}

export default Library;
