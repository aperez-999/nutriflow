import { useEffect } from 'react';
import { Box, Button, Container, Flex, Grid, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { CountUp } from '../components/Motion';
import { DURATION, EASE_OUT } from '../components/Motion/tokens';
import FlowBand from '../components/Global/FlowBand';

const MotionBox = motion(Box);

// Sample day shown in the hero. It uses the same layout as the in-app day label.
const SAMPLE_ROWS = [
  { flow: 'fuel', label: 'Fuel', value: 1840, unit: '/ 2,200 kcal', detail: '128 g protein', fill: 0.84 },
  { flow: 'train', label: 'Train', value: 45, unit: 'min', detail: 'Strength, medium intensity', fill: 1 },
  { flow: 'recover', label: 'Recover', value: 7.5, decimals: 1, unit: 'h sleep', detail: 'Energy 4 of 5, soreness 2 of 5', fill: 0.9 },
];

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

function SampleDayLabel() {
  const reduceMotion = useReducedMotion();
  return (
    <MotionBox
      // Under reduced motion the label is simply there; no fade or delay.
      initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5 }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.25 }}
      w="100%"
      maxW="420px"
    >
      <Specimen label="Example day: readiness 78, fuel 1,840 of 2,200 kcal, 45 minutes of strength training, 7.5 hours of sleep." p={0} px={{ base: 5, md: 6 }} pt={5} pb={4}>
        <Flex justify="space-between" align="baseline">
          <Text fontFamily="heading" fontWeight="800" fontSize="3xl" lineHeight="1">Today</Text>
          <Text fontSize="sm" color="fg.muted">Tuesday</Text>
        </Flex>
        <Box h="8px" bg="border.strong" mt={2} />
        <Flex justify="space-between" align="baseline" py={3} borderBottomWidth="4px" borderColor="border.strong">
          <Text fontWeight="800" fontSize="lg">Readiness</Text>
          <Text textStyle="figure" fontSize="7xl" color="recover.fg"><CountUp value={78} duration={1.2} /></Text>
        </Flex>
        {SAMPLE_ROWS.map((row, i) => (
          <Box key={row.label} py={2.5} borderBottomWidth="1px" borderColor="border">
            <Flex justify="space-between" align="flex-start" gap={4}>
              <Box>
                <Text fontWeight="700" fontSize="sm">{row.label}</Text>
                <Text fontSize="xs" color="fg.muted">{row.detail}</Text>
              </Box>
              <Text fontWeight="700" fontSize="sm" whiteSpace="nowrap">
                <CountUp value={row.value} decimals={row.decimals || 0} duration={1.1} />{' '}
                <Text as="span" color="fg.muted" fontWeight="500">{row.unit}</Text>
              </Text>
            </Flex>
            <Box h="4px" bg="bg.muted" borderRadius="full" mt={2} overflow="hidden">
              <MotionBox
                h="100%"
                bg={`${row.flow}.solid`}
                borderRadius="full"
                style={{ originX: 0 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: row.fill }}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.6 + i * 0.12 }}
              />
            </Box>
          </Box>
        ))}
        <Box pt={3}>
          <Text fontSize="xs" fontWeight="700" color="fg.muted">Next step</Text>
          <Text fontSize="sm" mt={0.5}>
            Good day to push your main lift. Have a carb-forward meal about two hours before.
          </Text>
        </Box>
      </Specimen>
    </MotionBox>
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

function TrainSpecimen() {
  const days = [
    ['Mon', 'Upper body push', '50 min', 'High'],
    ['Wed', 'Easy run', '35 min', 'Low'],
    ['Fri', 'Legs and core', '55 min', 'Medium'],
  ];
  return (
    <Specimen label="Example training week: three sessions with duration and intensity.">
      <Text fontWeight="800" fontSize="lg">Your week</Text>
      <Text fontSize="xs" color="fg.muted">Built by your coach from your log</Text>
      {days.map(([day, name, time, effort]) => (
        <Flex key={day} align="center" gap={3} py={2.5} borderTopWidth="1px" borderColor="border" mt={2}>
          <Text textStyle="figure" fontSize="2xl" w="44px" color="train.fg">{day}</Text>
          <Box flex="1" minW={0}>
            <Text fontSize="sm" fontWeight="700">{name}</Text>
            <Text fontSize="xs" color="fg.muted">{effort} intensity</Text>
          </Box>
          <Text fontSize="sm" fontWeight="700">{time}</Text>
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

function CoachSpecimen() {
  return (
    <Specimen label="Example coach conversation about a leg day after short sleep.">
      <Flex justify="flex-end">
        <Box bg="bg.muted" px={3.5} py={2} borderRadius="panel" borderBottomRightRadius="4px" maxW="80%">
          <Text fontSize="sm">Slept badly. Should I still do legs today?</Text>
        </Box>
      </Flex>
      <Text fontSize="xs" fontWeight="700" mt={4}>Coach</Text>
      <Text fontSize="sm" mt={1}>
        Your readiness is 52 after 5.5 h of sleep. Keep legs, but drop to two working sets and stay a rep or two
        short of failure. Eat about 40 g of carbs an hour before.
      </Text>
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
    points: ['Real exercise search with burn estimates', 'Weekly plans built from your log', 'One tap to log a planned session'],
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

function Home() {
  useSmoothScroll();
  const reduceMotion = useReducedMotion();

  return (
    <Box>
      <Box as="section" bg="bg.canvas" pt={{ base: 10, md: 20 }} pb={{ base: 10, md: 14 }} overflow="hidden">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <Grid templateColumns={{ base: '1fr', lg: '1.15fr 1fr' }} gap={{ base: 12, lg: 16 }} alignItems="center">
            <Box>
              <Heading as="h1" fontSize={{ base: '5xl', sm: '6xl', md: '8xl' }} lineHeight="0.88" letterSpacing="-0.005em">
                <HeadlineLine delay={0.05}>Know what</HeadlineLine>
                <HeadlineLine delay={0.15}>today needs.</HeadlineLine>
              </Heading>
              <MotionBox
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: 0.35 }}
              >
                <Text fontSize={{ base: 'lg', md: 'xl' }} color="fg.muted" mt={6} maxW="46ch">
                  NutriFlow reads what you ate, how you trained and how you slept, then gives you one readiness score and
                  one next step. No wearable required.
                </Text>
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} mt={8}>
                  <Button as={RouterLink} to="/register" size="lg">Create an account</Button>
                  <Button as={RouterLink} to="/login" size="lg" variant="outline">Log in</Button>
                </Stack>
              </MotionBox>
            </Box>
            <Flex justify={{ base: 'flex-start', lg: 'flex-end' }} pr={{ lg: 4 }}>
              <SampleDayLabel />
            </Flex>
          </Grid>
          <Box mt={{ base: 14, md: 20 }}>
            <FlowBand />
          </Box>
        </Container>
      </Box>

      {FEATURES.map((feature, i) => <FeatureSection key={feature.flow} feature={feature} index={i} />)}

      <Box as="section" bg="bg.surface" borderBottomWidth="1px" borderColor="border">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 20 }}>
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 10, lg: 16 }} alignItems="center">
            <ScrollReveal>
              <Text fontFamily="heading" fontWeight="800" fontSize={{ base: '2xl', md: '3xl' }} color="fg.muted">Coach</Text>
              <Heading as="h2" fontSize={{ base: '5xl', md: '6xl' }} mt={1} maxW="14ch">A coach that has read your log.</Heading>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="fg.muted" mt={4} maxW="46ch">
                Ask anything, or tap for a training week, a meal plan or a readiness check. Answers come from your own
                entries, and only you, signed in, can see that data.
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
