import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Select,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useExerciseCatalog from './useExerciseCatalog';
import AnatomyFigure from './AnatomyFigure';
import { describeMuscles } from './anatomy';
import QuickPanel from '../Dashboard/components/QuickPanel';
import { DURATION, EASE_OUT } from '../Motion/tokens';

const MotionBox = motion(Box);
// Two compact columns on phones, as many 220px+ cards as fit elsewhere.
const GRID_COLUMNS = { base: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(auto-fill, minmax(220px, 1fr))' };
const meta = (ex) => [ex.muscleGroup, ex.equipment.toLowerCase(), ex.difficulty.toLowerCase()].join(', ');

function ExerciseCard({ exercise, onOpen }) {
  return (
    <Box
      as="button"
      type="button"
      onClick={() => onOpen(exercise)}
      textAlign="left"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border"
      borderRadius="panel"
      overflow="hidden"
      h="100%"
      display="flex"
      flexDirection="column"
      transition={`border-color ${DURATION.fast}s ease, box-shadow ${DURATION.fast}s ease`}
      _hover={{ borderColor: 'border.strong' }}
      _focusVisible={{ borderColor: 'border.strong', boxShadow: '0 0 0 2px var(--chakra-colors-focus-ring)', outline: 'none' }}
      aria-label={`${exercise.name}. ${meta(exercise)}. ${describeMuscles(exercise.primary, exercise.secondary)}`}
    >
      <Box bg="bg.canvas" py={{ base: 3, md: 4 }} px={2} borderBottomWidth="1px" borderColor="border" aria-hidden="true">
        <AnatomyFigure primary={exercise.primary} secondary={exercise.secondary} height={140} />
      </Box>
      <Box p={{ base: 3, md: 4 }} flex="1">
        <Text fontWeight="700" fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.25">{exercise.name}</Text>
        <Text fontSize={{ base: 'xs', md: 'sm' }} color="fg.muted" mt={0.5}>{meta(exercise)}</Text>
        <Text fontSize="sm" mt={2} noOfLines={2} display={{ base: 'none', sm: '-webkit-box' }}>{exercise.summary}</Text>
      </Box>
    </Box>
  );
}

function ExerciseDetail({ exercise, onAsk }) {
  return (
    <VStack align="stretch" spacing={6}>
      <Box bg="bg.canvas" borderRadius="panel" py={5}>
        <AnatomyFigure primary={exercise.primary} secondary={exercise.secondary} height={260} showLegend />
      </Box>
      <Text fontSize="sm" color="fg.muted">{describeMuscles(exercise.primary, exercise.secondary)}</Text>
      <Box>
        <Text fontWeight="700" mb={2}>How to do it</Text>
        <VStack as="ol" listStyleType="none" align="stretch" spacing={3}>
          {exercise.cues.map((cue, i) => (
            <HStack as="li" key={cue} align="flex-start" spacing={3}>
              <Text textStyle="figure" fontSize="2xl" color="train.fg" w="20px" flexShrink={0}>{i + 1}</Text>
              <Text pt={0.5}>{cue}</Text>
            </HStack>
          ))}
        </VStack>
      </Box>
      <HStack spacing={3} flexWrap="wrap">
        <Button onClick={() => onAsk(exercise)}>Ask Coach about this</Button>
        {exercise.videoUrl && (
          <Button as={Link} href={exercise.videoUrl} isExternal variant="outline" _hover={{ textDecoration: 'none', bg: 'bg.muted' }}>
            Watch a demo
          </Button>
        )}
      </HStack>
    </VStack>
  );
}

/** Searchable exercise grid backed by the Exercise collection, with a detail panel. */
export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const state = useExerciseCatalog();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [equipment, setEquipment] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selected, setSelected] = useState(null);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return state.exercises.filter((ex) => (
      (!group || ex.muscleGroup === group)
      && (!equipment || ex.equipment === equipment)
      && (!difficulty || ex.difficulty === difficulty)
      && (!text || ex.name.toLowerCase().includes(text) || ex.muscleGroup.toLowerCase().includes(text))
    ));
  }, [difficulty, equipment, group, query, state.exercises]);

  const askCoach = (exercise) => {
    const question = `How do I do ${exercise.name} well, and where should it go in my week?`;
    navigate(`/fitness-hub?ask=${encodeURIComponent(question)}`);
  };

  const groups = state.filters?.muscleGroups || [];
  const hasFilters = Boolean(query || group || equipment || difficulty);

  return (
    <Box>
      <Grid templateColumns={{ base: '1fr 1fr', md: '1fr auto auto' }} gap={3} alignItems="center">
        <InputGroup gridColumn={{ base: '1 / -1', md: 'auto' }}>
          <InputLeftElement pointerEvents="none" color="fg.muted"><SearchIcon /></InputLeftElement>
          <Input placeholder="Search exercises" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search exercises" />
        </InputGroup>
        <Select size="md" value={equipment} onChange={(e) => setEquipment(e.target.value)} aria-label="Equipment" minW={{ md: '160px' }}>
          <option value="">Any equipment</option>
          {(state.filters?.equipment || []).map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        <Select size="md" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Difficulty" minW={{ md: '160px' }}>
          <option value="">Any level</option>
          {(state.filters?.difficulty || []).map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
      </Grid>

      {/* Muscle group chips: side-scroll on phones, wrap on wider screens. */}
      <HStack
        role="radiogroup"
        aria-label="Muscle group"
        spacing={2}
        mt={3}
        overflowX={{ base: 'auto', md: 'visible' }}
        flexWrap={{ base: 'nowrap', md: 'wrap' }}
        pb={1}
        sx={{ scrollbarWidth: 'none' }}
      >
        {['', ...groups].map((item) => {
          const active = group === item;
          return (
            <Button
              key={item || 'all'}
              size="sm"
              role="radio"
              aria-checked={active}
              onClick={() => setGroup(item)}
              variant="outline"
              flexShrink={0}
              borderRadius="full"
              bg={active ? 'fg' : 'bg.surface'}
              color={active ? 'bg.surface' : 'fg'}
              borderColor={active ? 'fg' : 'border'}
              _hover={{ bg: active ? 'fg' : 'bg.muted' }}
            >
              {item || 'All'}
            </Button>
          );
        })}
      </HStack>

      <Flex justify="space-between" align="center" mt={5} mb={3} minH="32px">
        <Text fontSize="sm" color="fg.muted" aria-live="polite">
          {state.status === 'ready' && `${visible.length} of ${state.exercises.length} exercises`}
        </Text>
        {hasFilters && (
          <Button size="sm" variant="ghost" onClick={() => { setQuery(''); setGroup(''); setEquipment(''); setDifficulty(''); }}>
            Clear filters
          </Button>
        )}
      </Flex>

      {state.status === 'loading' && (
        <Grid templateColumns={GRID_COLUMNS} gap={{ base: 3, md: 4 }}>
          {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} h={{ base: '230px', sm: '290px' }} borderRadius="panel" />)}
        </Grid>
      )}

      {state.status === 'error' && (
        <Box borderWidth="1px" borderColor="border" borderRadius="panel" p={6}>
          <Text fontWeight="700">The exercise library didn’t load.</Text>
          <Text fontSize="sm" color="fg.muted" mt={1}>Check your connection, then try again.</Text>
          <Button mt={4} size="sm" onClick={state.reload}>Try again</Button>
        </Box>
      )}

      {state.status === 'ready' && visible.length === 0 && (
        <Text color="fg.muted" py={10} textAlign="center">No exercises match. Try another muscle group or clear the filters.</Text>
      )}

      {state.status === 'ready' && visible.length > 0 && (
        <Grid templateColumns={GRID_COLUMNS} gap={{ base: 3, md: 4 }}>
          <AnimatePresence initial={false}>
            {visible.map((exercise) => (
              <MotionBox
                key={exercise.slug}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: DURATION.base, ease: EASE_OUT }}
              >
                <ExerciseCard exercise={exercise} onOpen={setSelected} />
              </MotionBox>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      <QuickPanel
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name}
        description={selected ? `${meta(selected)}. ${selected.summary}` : undefined}
      >
        {selected && <ExerciseDetail exercise={selected} onAsk={askCoach} />}
      </QuickPanel>
    </Box>
  );
}
