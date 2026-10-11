import { Box, Button, Flex, Grid, HStack, Link, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import QuickPanel from '../Dashboard/components/QuickPanel';
import { getExerciseMeta } from '../../utils/workoutUtils';
import AnatomyFigure from './AnatomyFigure';
import { exerciseName, matchExercise } from './planUtils';

const demoUrl = (videoId) => {
  const v = String(videoId);
  return /^https?:\/\//i.test(v) ? v : `https://www.youtube.com/watch?v=${v}`;
};

function Stat({ label, value }) {
  const text = String(value);
  return (
    <Box>
      <Text fontSize="xs" fontWeight="700" color="train.fg">{label}</Text>
      <Text textStyle="figure" fontSize="2xl" mt={0.5}>{text.charAt(0).toUpperCase() + text.slice(1)}</Text>
    </Box>
  );
}

/** One exercise of the session: library map and cues when known, general setup cues otherwise. */
function ExerciseRow({ exercise, index, workout, catalog }) {
  const name = exerciseName(exercise);
  const item = matchExercise(name, catalog);
  const dose = [
    exercise?.sets && exercise?.reps && `${exercise.sets} × ${exercise.reps}`,
    exercise?.interval,
  ].filter(Boolean).join(', ');
  const cues = item ? item.cues : getExerciseMeta({ name }, workout).setup;
  return (
    <Flex as="li" gap={3} py={3} borderTopWidth={index ? '1px' : 0} borderColor="border">
      <Box w="72px" flexShrink={0} bg="bg.canvas" borderRadius="md" py={2} aria-hidden="true">
        {item ? (
          <AnatomyFigure primary={item.primary} secondary={item.secondary} height={64} />
        ) : (
          <Text textStyle="figure" fontSize="2xl" textAlign="center" color="fg.muted" lineHeight="64px">{index + 1}</Text>
        )}
      </Box>
      <Box minW={0} flex="1">
        <Flex justify="space-between" gap={3}>
          <Text fontWeight="700">{name}</Text>
          {dose && <Text fontSize="sm" color="fg.muted" flexShrink={0} sx={{ fontVariantNumeric: 'tabular-nums' }}>{dose}</Text>}
        </Flex>
        {cues.length > 0 && (
          <Text fontSize="sm" color="fg.muted" mt={0.5}>{cues.slice(0, 2).map((cue) => cue.replace(/\.$/, '')).join('. ')}.</Text>
        )}
      </Box>
    </Flex>
  );
}

/** Slide-in detail for one session of a saved training plan. */
export default function SessionDetail({ session, catalog, state, onLog, onClose }) {
  const navigate = useNavigate();
  const workout = session?.workout;
  const exercises = workout?.exercises || [];
  const stats = workout ? [
    ['Time', workout.duration ? `${workout.duration} min` : null],
    ['Intensity', workout.intensity],
    ['Level', workout.difficulty],
  ].filter(([, value]) => value) : [];

  return (
    <QuickPanel
      isOpen={Boolean(workout)}
      onClose={onClose}
      title={workout?.title || 'Session'}
      description={workout?.description}
    >
      {workout && (
        <VStack align="stretch" spacing={6}>
          {stats.length > 0 && (
            <Grid templateColumns={`repeat(${stats.length}, 1fr)`} gap={3} pb={5} borderBottomWidth="1px" borderColor="border">
              {stats.map(([label, value]) => <Stat key={label} label={label} value={value} />)}
            </Grid>
          )}
          {workout.focusAreas?.length > 0 && (
            <Text fontSize="sm"><Text as="span" fontWeight="700">Focus:</Text> {workout.focusAreas.join(', ')}</Text>
          )}
          {exercises.length > 0 && (
            <Box>
              <Text fontWeight="700">Exercises</Text>
              <Box as="ol" listStyleType="none" mt={1}>
                {exercises.map((exercise, index) => (
                  <ExerciseRow key={index} exercise={exercise} index={index} workout={workout} catalog={catalog} />
                ))}
              </Box>
            </Box>
          )}
          <HStack spacing={3} flexWrap="wrap">
            <Button
              variant={state.completed ? 'ghost' : 'solid'}
              isDisabled={state.completed}
              isLoading={state.loading}
              loadingText="Logging"
              onClick={() => onLog(workout, session.index)}
            >
              {state.completed ? 'Logged' : 'Log session'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/fitness-hub?ask=${encodeURIComponent(`Walk me through "${workout.title}". How should I warm up and what weights should I pick?`)}`)}
            >
              Ask Coach
            </Button>
            {workout.videoId && (
              <Link href={demoUrl(workout.videoId)} isExternal fontSize="sm" textDecoration="underline" textUnderlineOffset="3px">
                Watch a demo
              </Link>
            )}
          </HStack>
        </VStack>
      )}
    </QuickPanel>
  );
}
