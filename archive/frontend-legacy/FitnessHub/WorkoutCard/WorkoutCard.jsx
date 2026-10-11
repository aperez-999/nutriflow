import { memo } from 'react';
import { Box, Button, Flex, HStack, Link, Text } from '@chakra-ui/react';

const demoUrl = (videoId) => {
  const v = String(videoId);
  return /^https?:\/\//i.test(v) ? v : `https://www.youtube.com/watch?v=${v}`;
};

/**
 * One session in an AI training plan: what it is, the key exercises, and a
 * single action to log it once done.
 */
function WorkoutCard({ workout, onViewDetails, onComplete, isCompleted = false, isCompleting = false }) {
  const meta = [
    workout.duration && `${workout.duration} min`,
    workout.intensity && `${String(workout.intensity).toLowerCase()} intensity`,
    workout.difficulty && String(workout.difficulty).toLowerCase(),
  ].filter(Boolean).join(', ');
  const exercises = workout.exercises || [];

  return (
    <Box borderWidth="1px" borderColor="border" borderRadius="control" p={4} h="100%" display="flex" flexDirection="column" gap={3}>
      <Box>
        <Text fontWeight="700" noOfLines={2}>{workout.title}</Text>
        {meta && <Text fontSize="sm" color="fg.muted">{meta}</Text>}
      </Box>

      {workout.description && <Text fontSize="sm" noOfLines={2}>{workout.description}</Text>}

      {workout.focusAreas?.length > 0 && (
        <Text fontSize="sm" color="fg.muted">Focus: {workout.focusAreas.join(', ')}</Text>
      )}

      {exercises.length > 0 && (
        <Box as="ul" pl={5} fontSize="sm">
          {exercises.slice(0, 3).map((exercise, idx) => (
            <Text as="li" key={idx} noOfLines={1}>
              {exercise.name}
              {exercise.sets && exercise.reps && <Text as="span" color="fg.muted">{` ${exercise.sets} × ${exercise.reps}`}</Text>}
              {exercise.interval && <Text as="span" color="fg.muted">{` ${exercise.interval}`}</Text>}
            </Text>
          ))}
          {exercises.length > 3 && (
            <Text as="li" color="fg.muted" listStyleType="none" ml={-5}>and {exercises.length - 3} more</Text>
          )}
        </Box>
      )}

      <Flex mt="auto" gap={2} align="center" wrap="wrap">
        <Button
          size="sm"
          variant={isCompleted ? 'ghost' : 'solid'}
          isDisabled={isCompleted}
          isLoading={isCompleting}
          loadingText="Logging"
          onClick={() => onComplete?.(workout)}
        >
          {isCompleted ? 'Logged' : 'Log session'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onViewDetails(workout)}>Details</Button>
        {workout.videoId && (
          <HStack ml="auto">
            <Link href={demoUrl(workout.videoId)} isExternal fontSize="sm" textDecoration="underline" textUnderlineOffset="3px">
              Watch demo
            </Link>
          </HStack>
        )}
      </Flex>
    </Box>
  );
}

export default memo(WorkoutCard);
