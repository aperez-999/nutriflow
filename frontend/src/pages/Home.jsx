import { useEffect } from 'react';
import { Box, Button, Container, DarkMode, Flex, Grid, Heading, HStack, LightMode, Stack, Text } from '@chakra-ui/react';
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

const DIFFERENCES = [
  {
    title: 'Readiness without a wearable',
    body: 'Most readiness scores need a watch or a ring. NutriFlow combines your training load, what you ate and a quick check-in into one honest number.',
  },
  {
    title: 'Food is fuel, not a test',
    body: 'Meals are compared with the training ahead, not with a diet. Nothing is labeled good or bad. Under-fueled before a hard session? You will know.',
  },
  {
    title: 'A coach that has read your log',
    body: 'Ask for a training week or a meal plan and the answer is built from your own entries. Only you, signed in, can see that data.',
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

function SampleDayLabel() {
  const reduceMotion = useReducedMotion();
  return (
    <LightMode>
      <MotionBox
        bg="bg.surface"
        color="fg"
        borderRadius="panel"
        px={{ base: 5, md: 6 }}
        pt={5}
        pb={4}
        w="100%"
        maxW="420px"
        role="img"
        aria-label="Example day: readiness 78, fuel 1,840 of 2,200 kcal, 45 minutes of strength training, 7.5 hours of sleep."
        // Under reduced motion the label is simply there; no fade or delay.
        initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: -1.5 }}
        transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.25 }}
        boxShadow="0 24px 60px rgba(0, 0, 0, 0.45)"
      >
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
      </MotionBox>
    </LightMode>
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

function Home() {
  useSmoothScroll();
  const reduceMotion = useReducedMotion();

  return (
    <Box>
      <DarkMode>
        <Box as="section" bg="bg.canvas" color="fg" pt={{ base: '104px', md: '136px' }} pb={{ base: 10, md: 14 }} overflow="hidden">
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
                    <Button as={RouterLink} to="/login" size="lg" variant="outline" bg="transparent">Log in</Button>
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
      </DarkMode>

      <Box as="section" bg="bg.surface" borderBottomWidth="1px" borderColor="border">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 16, md: 24 }}>
          <ScrollReveal>
            <Heading as="h2" size="2xl" maxW="16ch">How a day works</Heading>
          </ScrollReveal>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={{ base: 10, md: 10 }} mt={12} as="ol" listStyleType="none">
            {STEPS.map((step, i) => (
              <ScrollReveal as="li" key={step.title} delay={i * 0.08} borderTopWidth="3px" borderColor="border.strong" pt={4}>
                <Text textStyle="figure" fontSize="7xl" color={`${step.flow}.fg`} aria-hidden="true">{i + 1}</Text>
                <Heading as="h3" size="md" mt={3}>{step.title}</Heading>
                <Text color="fg.muted" mt={2} maxW="40ch">{step.body}</Text>
              </ScrollReveal>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container as="section" maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 16, md: 24 }}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 10, lg: 16 }} alignItems="center">
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

        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} columnGap={10} mt={{ base: 16, md: 24 }}>
          {DIFFERENCES.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.08} borderTopWidth="1px" borderColor="border" py={5}>
              <Heading as="h3" size="md">{item.title}</Heading>
              <Text color="fg.muted" mt={2}>{item.body}</Text>
            </ScrollReveal>
          ))}
        </Grid>
      </Container>

      <LightMode>
        <Box as="section" bg="train.500" color="gray.900">
          <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 20 }}>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'flex-end' }} gap={8}>
              <Heading as="h2" fontSize={{ base: '5xl', md: '7xl' }} color="gray.900" maxW="14ch" lineHeight="0.9">
                Start with tomorrow morning’s check-in.
              </Heading>
              <Button as={RouterLink} to="/register" size="lg" flexShrink={0}>Create an account</Button>
            </Flex>
          </Container>
        </Box>
      </LightMode>
    </Box>
  );
}

export default Home;
