import { useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';
import { Box, Button, Container, Flex, Grid, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { DURATION, EASE_OUT } from '../components/Motion/tokens';
import { TryTodayBars, TryTodayControls, TryTodaySummary, TryTodayVerdict } from '../components/Landing/TryToday';
import { useTryToday } from '../components/Landing/tryDay';
import { LogoMark } from '../components/Global/Logo';
import AnatomyFigure from '../components/Library/AnatomyFigure';

const MotionBox = motion(Box);

const STEPS = [
  {
    flow: 'recover',
    title: 'Check in when you wake up',
    body: 'Sleep, energy, soreness and water. Four taps, about twenty seconds. Your readiness score updates right away.',
  },
  {
    flow: 'fuel',
    title: 'Log as the day happens',
    body: 'Search real foods from the USDA database and real exercises. Each entry fills in your fuel and training for the day.',
  },
  {
    flow: 'train',
    title: 'Do the one thing that matters',
    body: 'NutriFlow tells you whether today is for pushing, holding steady or recovering, and what to eat around it.',
  },
];

// Deterministic sample for the rhythm demo: 12 weeks, mostly consistent, a few real-life gaps.
const SAMPLE_RHYTHM = Array.from({ length: 12 }, (_, week) =>
  Array.from({ length: 7 }, (_, day) => {
    const seed = (week * 7 + day) * 2654435761 % 97;
    const missed = seed % 11 === 0;
    return {
      fuel: !missed && seed % 13 !== 1,
      train: !missed && (day === 0 || day === 2 || day === 4 || seed % 5 === 0),
      recover: !missed && seed % 3 !== 0,
    };
  })
);

/** Smooth, inertial scrolling for the marketing page only; Lenis turns itself off under reduced motion. */
function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, anchors: true });
    return () => lenis.destroy();
  }, []);
}

function HeadlineLine({ children, delay }) {
  return (
    <Box as="span" display="block" overflow="hidden" pb="0.06em">
      <MotionBox
        as="span"
        display="block"
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT, delay }}
      >
        {children}
      </MotionBox>
    </Box>
  );
}

function ScrollReveal({ children, delay = 0, ...props }) {
  // Transform only: content is visible even if the in-view observer never fires.
  return (
    <MotionBox
      initial={{ y: 28 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT, delay }}
      {...props}
    >
      {children}
    </MotionBox>
  );
}

/** A small product surface used as an illustration (card on the page's surface color). */
function Specimen({ children, label, ...props }) {
  return (
    <Box
      bg="bg.surface"
      color="fg"
      borderWidth="1px"
      borderColor="border"
      borderRadius="panel"
      p={{ base: 4, md: 5 }}
      w="100%"
      maxW="420px"
      boxShadow="overlay"
      role="img"
      aria-label={label}
      {...props}
    >
      {children}
    </Box>
  );
}

function FuelSpecimen() {
  const rows = [['Protein', '42 g'], ['Carbohydrate', '68 g'], ['Fat', '14 g']];
  return (
    <Specimen label="Example meal: chicken rice bowl, 560 kcal, 42 grams of protein.">
      <Text fontWeight="800" fontSize="lg">Chicken rice bowl</Text>
      <Text fontSize="xs" color="fg.muted">Lunch, from the USDA database</Text>
      <Box h="6px" bg="border.strong" mt={3} />
      <Flex justify="space-between" align="baseline" py={2} borderBottomWidth="3px" borderColor="border.strong">
        <Text fontWeight="800">Calories</Text>
        <Text textStyle="figure" fontSize="5xl" color="fuel.fg">560</Text>
      </Flex>
      {rows.map(([label, value]) => (
        <Flex key={label} justify="space-between" py={1.5} borderBottomWidth="1px" borderColor="border" _last={{ borderBottomWidth: 0 }}>
          <Text fontSize="sm">{label}</Text>
          <Text fontSize="sm" fontWeight="700">{value}</Text>
        </Flex>
      ))}
    </Specimen>
  );
}

// Mirrors the Library's plan view: segmented progress, session rows and the plan's muscle map.
function TrainSpecimen() {
  const sessions = [
    { title: 'Lower body strength', meta: '50 min, high', done: true },
    { title: 'Upper push', meta: '45 min, medium', done: false },
    { title: 'Easy run and core', meta: '35 min, low', done: false },
  ];
  return (
    <Specimen label="Example training plan in the Library: three sessions, one logged, with a muscle map of what the week trains.">
      <Flex justify="space-between" align="flex-start" gap={4}>
        <Box minW={0}>
          <Text fontFamily="heading" fontWeight="800" fontSize="2xl" lineHeight="1">Strength base week</Text>
          <Text fontSize="xs" color="fg.muted" mt={1}>Built by your coach, saved to your Library</Text>
        </Box>
        <Box w="84px" flexShrink={0} bg="bg.canvas" borderRadius="md" py={1.5}>
          <AnatomyFigure primary={['quads', 'glutes', 'chest', 'shoulders', 'triceps', 'abs']} secondary={['hamstrings', 'calves']} height={64} />
        </Box>
      </Flex>
      <Flex gap="3px" h="6px" mt={3}>
        {sessions.map((session) => (
          <Box key={session.title} flex="1" borderRadius="2px" bg={session.done ? 'train.solid' : 'bg.muted'} />
        ))}
      </Flex>
      {sessions.map((session, i) => (
        <Flex
          key={session.title}
          align="center"
          gap={3}
          mt={i ? 2 : 3}
          p={2.5}
          borderRadius="md"
          bg={session.done ? 'train.subtle' : 'transparent'}
          borderWidth="1px"
          borderColor={session.done ? 'transparent' : 'border'}
        >
          <Box flex="1" minW={0}>
            <Text fontSize="xs" fontWeight="700" color="train.fg">Session {i + 1}</Text>
            <Text fontSize="sm" fontWeight="700">{session.title}</Text>
            <Text fontSize="xs" color="fg.muted">{session.meta}</Text>
          </Box>
          {session.done ? (
            <Flex boxSize="24px" borderRadius="full" bg="train.solid" color="white" align="center" justify="center" fontSize="xs">
              <FiCheck />
            </Flex>
          ) : (
            <Box px={2.5} py={1} borderRadius="md" bg="fg" color="bg.surface" fontSize="xs" fontWeight="700">Log session</Box>
          )}
        </Flex>
      ))}
    </Specimen>
  );
}

function RecoverSpecimen() {
  const ratings = [['Energy', 4], ['Soreness', 2]];
  return (
    <Specimen label="Example check-in: 7.5 hours of sleep, energy 4 of 5, soreness 2 of 5.">
      <Text fontWeight="800" fontSize="lg">Morning check-in</Text>
      <Flex justify="space-between" mt={3} fontSize="sm">
        <Text fontWeight="600">Sleep last night</Text>
        <Text fontWeight="700" color="recover.fg">7.5 h</Text>
      </Flex>
      <Box h="6px" bg="bg.muted" borderRadius="full" mt={2}>
        <Box h="100%" w="50%" bg="recover.solid" borderRadius="full" />
      </Box>
      {ratings.map(([label, value]) => (
        <Box key={label} mt={4}>
          <Text fontSize="sm" fontWeight="600" mb={1.5}>{label}</Text>
          <Grid templateColumns="repeat(5, 1fr)" borderWidth="1px" borderColor="border" borderRadius="control" overflow="hidden">
            {[1, 2, 3, 4, 5].map((n) => (
              <Box
                key={n}
                textAlign="center"
                py={1.5}
                fontSize="sm"
                borderLeftWidth={n === 1 ? 0 : '1px'}
                borderColor="border"
                bg={n === value ? 'recover.subtle' : 'transparent'}
                color={n === value ? 'recover.fg' : 'fg.muted'}
                fontWeight={n === value ? 700 : 500}
              >
                {n}
              </Box>
            ))}
          </Grid>
        </Box>
      ))}
    </Specimen>
  );
}

// Mirrors the Coach chat: ink user bubble, the coach's mark, a short answer and follow-ups.
function CoachSpecimen() {
  return (
    <Specimen label="Example coach conversation about a leg day after short sleep, with follow-up suggestions.">
      <Flex justify="flex-end">
        <Box bg="fg" color="bg.surface" px={3.5} py={2} borderRadius="panel" borderBottomRightRadius="4px" maxW="80%">
          <Text fontSize="sm">Slept badly. Should I still do legs today?</Text>
        </Box>
      </Flex>
      <HStack spacing={2} mt={4} mb={1.5}>
        <LogoMark size={14} />
        <Text fontSize="xs" fontWeight="700">Coach <Text as="span" color="fg.muted" fontWeight="400">7:42 AM</Text></Text>
      </HStack>
      <Text fontSize="sm">Yes, but lighter: your readiness is 52 after 5.5 h of sleep.</Text>
      <Box as="ul" pl={4} mt={2} fontSize="sm">
        <Box as="li">Two working sets, a rep or two short of failure.</Box>
        <Box as="li">About 40 g of carbs an hour before.</Box>
        <Box as="li">An early night counts more than the last set.</Box>
      </Box>
      <Flex gap={2} mt={3} wrap="wrap">
        {['Make it shorter', 'What should I eat after?', 'How ready am I today?'].map((chip) => (
          <Box key={chip} px={2.5} py={1} borderWidth="1px" borderColor="border" borderRadius="md" fontSize="xs" fontWeight="500">{chip}</Box>
        ))}
      </Flex>
    </Specimen>
  );
}

const FEATURES = [
  {
    flow: 'fuel',
    title: 'Log a meal in seconds.',
    body: 'Search real foods from the USDA database and the numbers fill in for you. Meals are compared with your training, not judged against a diet.',
    points: ['Calories and protein against your own targets', 'Nutrition-label summary for any day', 'No food is labeled good or bad'],
    Specimen: FuelSpecimen,
  },
  {
    flow: 'train',
    title: 'Training that fits the day.',
    body: 'Log sessions as you go, or ask the coach to plan your week. Intensity follows how ready you are, so hard days land on good days.',
    points: ['Weekly plans built from your log, one tap to log each session', 'A muscle map of what every plan and exercise works', '36 exercises with form cues, plus search with burn estimates'],
    Specimen: TrainSpecimen,
  },
  {
    flow: 'recover',
    title: 'Readiness without a wearable.',
    body: 'A twenty-second morning check-in plus your logs gives one honest score and a verdict: push day, steady day or recovery day.',
    points: ['Sleep, energy, soreness and water', 'Short sleep or high soreness? It tells you to ease off', 'No watch, ring or subscription needed'],
    Specimen: RecoverSpecimen,
  },
];

function FeatureSection({ feature, index }) {
  const { flow, title, body, points, Specimen: Visual } = feature;
  const flip = index % 2 === 1;
  return (
    <Box as="section" bg={`${flow}.subtle`}>
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 20 }}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 10, lg: 16 }} alignItems="center">
          <ScrollReveal order={{ lg: flip ? 2 : 1 }}>
            <Text fontFamily="heading" fontWeight="800" fontSize={{ base: '2xl', md: '3xl' }} color={`${flow}.fg`} textTransform="capitalize">
              {flow}
            </Text>
            <Heading as="h2" fontSize={{ base: '5xl', md: '6xl' }} mt={1} maxW="14ch">{title}</Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color="fg.muted" mt={4} maxW="46ch">{body}</Text>
            <VStack as="ul" listStyleType="none" align="start" spacing={2} mt={6}>
              {points.map((point) => (
                <HStack as="li" key={point} spacing={3} align="center">
                  <Box boxSize="8px" borderRadius="2px" bg={`${flow}.solid`} flexShrink={0} />
                  <Text fontWeight="600">{point}</Text>
                </HStack>
              ))}
            </VStack>
          </ScrollReveal>
          <Flex justify={{ base: 'flex-start', lg: flip ? 'flex-start' : 'flex-end' }} order={{ lg: flip ? 1 : 2 }}>
            <ScrollReveal delay={0.1} w="100%" maxW="420px">
              <Visual />
            </ScrollReveal>
          </Flex>
        </Grid>
      </Container>
    </Box>
  );
}

/** Twelve sample weeks that fill in as the section scrolls into view. */
function RhythmDemo() {
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(12, minmax(0, 1fr))"
      gap={{ base: '4px', md: '6px' }}
      role="img"
      aria-label="Example rhythm map: twelve weeks of logged meals, workouts and check-ins with a few missed days."
    >
      {SAMPLE_RHYTHM.map((week, w) => (
        <Flex key={w} direction="column" gap={{ base: '4px', md: '6px' }}>
          {week.map((day, d) => (
            <Flex key={d} direction="column" gap="1px" p="2px" aspectRatio={1} bg="bg.muted" borderRadius="3px">
              {['fuel', 'train', 'recover'].map((flow) => (
                <MotionBox
                  key={flow}
                  flex="1"
                  borderRadius="1px"
                  bg={day[flow] ? `${flow}.solid` : 'transparent'}
                  style={{ originX: 0 }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: DURATION.base, ease: EASE_OUT, delay: w * 0.05 + d * 0.015 }}
                />
              ))}
            </Flex>
          ))}
        </Flex>
      ))}
    </Box>
  );
}

// What sets NutriFlow apart, side by side with the apps people already know.
const COMPARISON = [
  { them: 'Counts what you ate.', us: 'Tells you what today is for: push, hold steady or recover.', flow: 'train' },
  { them: 'Food, training and sleep live in separate apps.', us: 'Scores all three together, every morning.', flow: 'fuel' },
  { them: 'One missed day breaks the streak.', us: 'Forgives a missed day. Months matter more than a perfect week.', flow: 'recover' },
  { them: 'The same tips for everyone.', us: 'A coach that has read your log and answers in seconds.', flow: null },
];

function Comparison() {
  return (
    <Box as="section" bg="bg.surface" borderTopWidth="1px" borderBottomWidth="1px" borderColor="border">
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 20 }}>
        <ScrollReveal>
          <Heading as="h2" fontSize={{ base: '4xl', md: '6xl' }} maxW="18ch" lineHeight="0.95">
            Calorie apps count. NutriFlow decides.
          </Heading>
        </ScrollReveal>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1.4fr' }} mt={{ base: 8, md: 12 }} role="table" aria-label="A typical calorie app compared with NutriFlow">
          <Box role="row" display={{ base: 'none', md: 'contents' }}>
            <Text role="columnheader" fontSize="sm" fontWeight="700" color="fg.muted" pb={3}>A typical calorie app</Text>
            <Text role="columnheader" fontSize="sm" fontWeight="700" pb={3}>NutriFlow</Text>
          </Box>
          {COMPARISON.map((row, i) => (
            <ScrollReveal key={row.us} role="row" delay={i * 0.06} display="contents">
              <Text role="cell" color="fg.muted" py={{ base: 3, md: 5 }} pt={{ base: 5, md: 5 }} borderTopWidth="1px" borderColor="border" fontSize={{ base: 'md', md: 'lg' }}>
                {row.them}
              </Text>
              <Flex role="cell" gap={3} align="baseline" py={{ base: 0, md: 5 }} pb={{ base: 5, md: 5 }} borderTopWidth={{ base: 0, md: '1px' }} borderColor="border">
                <Box boxSize="10px" borderRadius="2px" bg={row.flow ? `${row.flow}.solid` : 'fg'} flexShrink={0} aria-hidden="true" />
                <Text fontWeight="700" fontSize={{ base: 'lg', md: 'xl' }}>{row.us}</Text>
              </Flex>
            </ScrollReveal>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function Home() {
  useSmoothScroll();
  const reduceMotion = useReducedMotion();
  const demo = useTryToday();

  return (
    <Box>
      <Box as="section" bg="bg.canvas" pt={{ base: 10, md: 16 }} pb={{ base: 12, md: 16 }} overflow="hidden">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <Grid
            templateAreas={{ base: '"intro" "verdict" "controls" "bars"', lg: '"intro controls" "verdict controls" "bars bars"' }}
            templateColumns={{ base: '1fr', lg: '1.25fr 1fr' }}
            columnGap={{ lg: 16 }}
            rowGap={{ base: 10, lg: 12 }}
            alignItems="start"
          >
            <Box gridArea="intro">
              <Heading as="h1" fontSize={{ base: '5xl', sm: '6xl', md: '7xl' }} lineHeight="0.88" letterSpacing="-0.005em">
                <HeadlineLine delay={0.05}>Not another</HeadlineLine>
                <HeadlineLine delay={0.15}>calorie counter.</HeadlineLine>
              </Heading>
              <MotionBox
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: 0.35 }}
              >
                <Text fontSize={{ base: 'lg', md: 'xl' }} color="fg.muted" mt={5} maxW="46ch">
                  NutriFlow reads what you ate, how you trained and how you slept, and every morning tells you what
                  today is for. No wearable required.
                </Text>
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} mt={7}>
                  <Button as={RouterLink} to="/register" state={{ demo: { level: demo.result.level, score: demo.result.score } }} size="lg">Create an account</Button>
                  <Button as={RouterLink} to="/login" size="lg" variant="outline">Log in</Button>
                </Stack>
              </MotionBox>
            </Box>

            <Box gridArea="verdict">
              <TryTodayVerdict result={demo.result} />
            </Box>

            <Box gridArea="controls">
              {/* Not a Specimen: that is a picture (role="img"); this card holds real controls. */}
              <Box
                as="section"
                aria-labelledby="try-heading"
                bg="bg.surface"
                borderWidth="1px"
                borderColor="border"
                borderRadius="panel"
                boxShadow="overlay"
                p={{ base: 5, md: 6 }}
                maxW={{ lg: '440px' }}
                ml={{ lg: 'auto' }}
              >
                <Heading as="h2" id="try-heading" fontSize="3xl" lineHeight="1">Try it on your morning</Heading>
                <Text fontSize="sm" color="fg.muted" mt={2} mb={5}>
                  Change anything. The verdict uses the same formula as the app.
                </Text>
                <TryTodayControls answers={demo.answers} onChange={demo.setAnswers} />
                <TryTodaySummary result={demo.result} />
              </Box>
            </Box>

            <Box gridArea="bars">
              <TryTodayBars result={demo.result} />
            </Box>
          </Grid>
        </Container>
      </Box>

      <Comparison />

      {FEATURES.map((feature, i) => <FeatureSection key={feature.flow} feature={feature} index={i} />)}

      <Box as="section" bg="bg.surface" borderBottomWidth="1px" borderColor="border">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 20 }}>
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 10, lg: 16 }} alignItems="center">
            <ScrollReveal>
              <Text fontFamily="heading" fontWeight="800" fontSize={{ base: '2xl', md: '3xl' }} color="fg.muted">Coach</Text>
              <Heading as="h2" fontSize={{ base: '5xl', md: '6xl' }} mt={1} maxW="14ch">A coach that has read your log.</Heading>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="fg.muted" mt={4} maxW="46ch">
                Ask anything and get a short answer built from your own entries, with a few next questions ready to tap.
                Plans it makes land in your Library. Only you, signed in, can see your data.
              </Text>
            </ScrollReveal>
            <Flex justify={{ base: 'flex-start', lg: 'flex-end' }}>
              <ScrollReveal delay={0.1} w="100%" maxW="420px">
                <CoachSpecimen />
              </ScrollReveal>
            </Flex>
          </Grid>
        </Container>
      </Box>

      <Container as="section" maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 20 }}>
        <ScrollReveal>
          <Heading as="h2" size="2xl" maxW="16ch">How a day works</Heading>
        </ScrollReveal>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={10} mt={12} as="ol" listStyleType="none">
          {STEPS.map((step, i) => (
            <ScrollReveal as="li" key={step.title} delay={i * 0.08} borderTopWidth="3px" borderColor="border.strong" pt={4}>
              <Text textStyle="figure" fontSize="7xl" color={`${step.flow}.fg`} aria-hidden="true">{i + 1}</Text>
              <Heading as="h3" size="md" mt={3}>{step.title}</Heading>
              <Text color="fg.muted" mt={2} maxW="40ch">{step.body}</Text>
            </ScrollReveal>
          ))}
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 10, lg: 16 }} alignItems="center" mt={{ base: 16, md: 24 }}>
          <ScrollReveal>
            <Heading as="h2" size="2xl" maxW="14ch">Streaks that forgive.</Heading>
            <Text color="fg.muted" fontSize="lg" mt={4} maxW="44ch">
              Every day shows what you logged: fuel, training and recovery. Miss a day and your streak survives. It only
              ends after two misses in a row, because months of consistency matter more than a perfect week.
            </Text>
            <HStack spacing={5} mt={6} fontSize="sm" color="fg.muted" flexWrap="wrap">
              {['fuel', 'train', 'recover'].map((flow) => (
                <HStack key={flow} spacing={2}>
                  <Box boxSize="10px" borderRadius="2px" bg={`${flow}.solid`} />
                  <Text textTransform="capitalize">{flow}</Text>
                </HStack>
              ))}
            </HStack>
          </ScrollReveal>
          <RhythmDemo />
        </Grid>
      </Container>

      {/* Solid brand color: identical in light and dark mode. */}
      <Box as="section" bg="train.500" color="gray.900">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 20 }}>
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'flex-end' }} gap={8}>
            <Heading as="h2" fontSize={{ base: '5xl', md: '7xl' }} color="gray.900" maxW="14ch" lineHeight="0.9">
              Start with tomorrow morning’s check-in.
            </Heading>
            <Button
              as={RouterLink}
              to="/register"
              // Carries the visitor's "try it" result into sign-up.
              state={{ demo: { level: demo.result.level, score: demo.result.score } }}
              size="lg"
              flexShrink={0}
              bg="gray.900"
              color="white"
              _hover={{ bg: 'black' }}
              _active={{ bg: 'black', transform: 'scale(0.97)' }}
            >
              Create an account
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;
