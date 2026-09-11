/* eslint-disable react/prop-types */
import {
  Badge,
  Box,
  Button,
  AspectRatio,
  Container,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiCoffee,
  FiZap,
} from 'react-icons/fi';
import {
  PreAuthCard,
  PreAuthShell,
  Reveal,
  usePreAuthPalette,
} from '../components/Marketing/PreAuthSurface';

function LandingEyebrow({ children, borderColor, backgroundColor, textColor, accentColor }) {
  return (
    <HStack
      spacing={2}
      align="center"
      px={3}
      py={1.5}
      borderRadius="full"
      borderWidth="1px"
      borderColor={borderColor}
      bg={backgroundColor}
      color={textColor}
      fontSize="xs"
      fontWeight="700"
      letterSpacing="0.18em"
      textTransform="uppercase"
      w="fit-content"
    >
      <Box boxSize={2} borderRadius="full" bg={accentColor} />
      <Text>{children}</Text>
    </HStack>
  );
}

function LandingMetric({ label, value, detail, borderColor, backgroundColor, headingColor, textColor }) {
  return (
    <Box
      p={4}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      bg={backgroundColor}
      transition="transform 0.2s ease, border-color 0.2s ease, background 0.2s ease"
      _hover={{ borderColor: 'teal.300', transform: 'translateY(-1px)' }}
    >
      <Text fontSize="xs" fontWeight="700" letterSpacing="0.16em" textTransform="uppercase" color={textColor}>
        {label}
      </Text>
      <Heading as="p" size="md" color={headingColor} mt={2}>
        {value}
      </Heading>
      <Text mt={1.5} fontSize="sm" color={textColor}>
        {detail}
      </Text>
    </Box>
  );
}

function LandingStepCard({ step, title, description, media, accent, borderColor, backgroundColor, headingColor, textColor }) {
  return (
    <Box
      h="full"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      bg={backgroundColor}
      overflow="hidden"
      boxShadow="lg"
      transition="transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease"
      _hover={{ transform: 'translateY(-4px)', borderColor: accent, boxShadow: '0 18px 42px rgba(2, 6, 23, 0.16)' }}
    >
      <AspectRatio ratio={16 / 10}>
        <Box position="relative" overflow="hidden">
          <Image
            src={media.src}
            alt={media.alt}
            w="full"
            h="full"
            objectFit="cover"
            objectPosition={media.objectPosition || 'center'}
            loading={media.loading || 'lazy'}
            decoding="async"
            draggable={false}
            sizes="(min-width: 992px) 22vw, 100vw"
          />
          <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(2, 6, 23, 0.76), transparent 60%)" />
          <Box
            position="absolute"
            top={4}
            left={4}
            px={3}
            py={1.5}
            borderRadius="full"
            bg="blackAlpha.600"
            color="white"
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.16em"
            textTransform="uppercase"
          >
            Step {step}
          </Box>
          <Box
            position="absolute"
            right={4}
            bottom={4}
            px={3}
            py={1.5}
            borderRadius="full"
            bg={accent || 'teal.400'}
            color="#020617"
            fontSize="xs"
            fontWeight="800"
          >
            {title}
          </Box>
        </Box>
      </AspectRatio>
      <Box p={6}>
        <VStack align="start" spacing={3}>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.16em" textTransform="uppercase" color={textColor}>
            How it works
          </Text>
          <Heading as="h3" size="md" color={headingColor} letterSpacing="-0.02em">
            {title}
          </Heading>
          <Text color={textColor} lineHeight="tall">
            {description}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}

function LandingFeatureCard({
  icon: Icon,
  title,
  description,
  bullets,
  accent,
  media,
  borderColor,
  backgroundColor,
  headingColor,
  textColor,
  mutedSurface,
}) {
  return (
    <Box
      h="full"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      bg={backgroundColor}
      overflow="hidden"
      boxShadow="lg"
      transition="transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease"
      _hover={{ transform: 'translateY(-4px)', borderColor: accent, boxShadow: '0 18px 42px rgba(2, 6, 23, 0.16)' }}
    >
      {media ? (
        <AspectRatio ratio={16 / 9}>
          <Box position="relative" overflow="hidden" borderBottomWidth="1px" borderBottomColor={borderColor}>
            <Image
              src={media.src}
              alt={media.alt}
              w="full"
              h="full"
              objectFit="cover"
              objectPosition={media.objectPosition || 'center'}
              loading={media.loading || 'lazy'}
              decoding="async"
              draggable={false}
              sizes="(min-width: 1280px) 19vw, (min-width: 992px) 24vw, 100vw"
            />
            <Box
              position="absolute"
              inset={0}
              bgGradient="linear(to-t, rgba(2, 6, 23, 0.72), transparent 52%)"
            />
            <Box
              position="absolute"
              inset={0}
              bgImage="radial-gradient(circle at top left, rgba(45, 212, 191, 0.18), transparent 30%)"
            />
          </Box>
        </AspectRatio>
      ) : null}

      <Box p={6} h="full">
        <VStack align="start" spacing={4} h="full">
          <HStack spacing={3}>
            <Box
              p={3}
              borderRadius="xl"
              bg={mutedSurface}
              color={accent || 'teal.400'}
              borderWidth="1px"
              borderColor={borderColor}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box as={Icon} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.16em" textTransform="uppercase" color={textColor}>
                Smart workflow
              </Text>
              <Heading as="h3" size="md" color={headingColor} mt={1}>
                {title}
              </Heading>
            </Box>
          </HStack>

          <Text color={textColor} lineHeight="tall">
            {description}
          </Text>

          <Stack spacing={2} w="full" mt="auto">
            {bullets.map((bullet) => (
              <HStack key={bullet} spacing={3} align="start">
                <Box boxSize={2.5} borderRadius="full" bg={accent || 'teal.400'} mt={2} flexShrink={0} />
                <Text fontSize="sm" color={textColor}>
                  {bullet}
                </Text>
              </HStack>
            ))}
          </Stack>
        </VStack>
      </Box>
    </Box>
  );
}

function Home() {
  const navigate = useNavigate();
  const palette = usePreAuthPalette();
  const pageBackground = useColorModeValue(
    'linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.96) 46%, rgba(236, 254, 255, 0.92) 100%)',
    'linear-gradient(180deg, #020617 0%, #0f172a 44%, #052e2b 100%)',
  );
  const pageGlow = useColorModeValue(
    'radial-gradient(circle at top left, rgba(45, 212, 191, 0.09), transparent 26%), radial-gradient(circle at top right, rgba(34, 211, 238, 0.08), transparent 22%), radial-gradient(circle at bottom center, rgba(15, 118, 110, 0.08), transparent 24%)',
    'radial-gradient(circle at top left, rgba(45, 212, 191, 0.22), transparent 26%), radial-gradient(circle at top right, rgba(34, 211, 238, 0.16), transparent 22%), radial-gradient(circle at bottom center, rgba(15, 118, 110, 0.2), transparent 26%)',
  );
  const headingColor = useColorModeValue('gray.900', palette.headingColor);
  const shellText = useColorModeValue('gray.700', palette.shellText);
  const surfaceBorder = useColorModeValue('blackAlpha.100', palette.surfaceBorder);
  const mutedSurface = useColorModeValue('white', palette.mutedSurface);
  const cardSurface = useColorModeValue('rgba(255, 255, 255, 0.88)', palette.surfaceBg);
  const eyebrowBg = useColorModeValue('white', 'whiteAlpha.100');
  const eyebrowColor = useColorModeValue('gray.800', 'white');
  const buttonText = useColorModeValue('gray.800', 'whiteAlpha.900');
  const buttonBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.300');
  const buttonBg = useColorModeValue('white', 'whiteAlpha.50');
  const buttonHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const buttonHoverBorder = useColorModeValue('gray.300', 'whiteAlpha.400');
  const ghostHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const panelShadow = useColorModeValue('0 20px 45px rgba(15, 23, 42, 0.08)', '0 20px 60px rgba(2, 6, 23, 0.35)');

  const heroMetrics = [
    { label: 'Ready in', value: '12 weeks', detail: 'Build a reliable training rhythm.' },
    { label: 'Tracks', value: 'Meals + workouts', detail: 'Keep nutrition and movement in one flow.' },
    { label: 'Guidance', value: 'AI-first', detail: 'Turn daily activity into next-step coaching.' },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Set your training direction',
      description: 'Pick the goal, target, or block you want to follow so the workspace can stay focused on the right outcome.',
      media: {
        src: '/images/running.jpg',
        alt: 'Athlete running outdoors with a focused training posture',
        objectPosition: 'center center',
        loading: 'eager',
      },
    },
    {
      step: '02',
      title: 'Capture the day without friction',
      description: 'Log meals, workouts, and quick check-ins in a layout that keeps the next step obvious instead of buried.',
      media: {
        src: '/images/core-workout.jpg',
        alt: 'Core workout training scene with focused movement',
        objectPosition: 'center center',
      },
    },
    {
      step: '03',
      title: 'Let AI steer the next move',
      description: 'Use readiness, progress, and habit signals to decide what to push, repeat, or recover from next.',
      media: {
        src: '/images/monitor-bg.webp',
        alt: 'Nutrition and training dashboard on a monitor',
        objectPosition: 'center center',
      },
    },
  ];

  const featureCards = [
    {
      icon: FiZap,
      title: 'AI coaching that stays concise',
      description: 'Turn messy daily activity into a short, useful recommendation that tells you what matters right now.',
      bullets: ['Action-oriented guidance instead of long explanations.', 'Built to keep the next step obvious.', 'Works alongside your workouts, meals, and recovery data.'],
      accent: 'teal.400',
      media: {
        src: '/images/hiit.jpg',
        alt: 'High-intensity training session with strong visual energy',
        objectPosition: 'center center',
      },
    },
    {
      icon: FiActivity,
      title: 'Readiness and recovery in one loop',
      description: 'See how training load and recovery fit together before you decide whether to push hard or hold back.',
      bullets: ['Daily signals that guide your effort.', 'Recovery cues paired with workload.', 'Less guesswork, more consistent training.'],
      accent: 'cyan.400',
      media: {
        src: '/images/full-body.jpg',
        alt: 'Full body fitness training image with a balanced workout feel',
        objectPosition: 'center center',
      },
    },
    {
      icon: FiCoffee,
      title: 'Nutrition logging that stays fast',
      description: 'Capture meals quickly, review patterns at a glance, and stay aligned with your calorie and macro targets.',
      bullets: ['Simple meal capture with less friction.', 'Clear visibility into daily nutrition trends.', 'Built for frequent, low-effort check-ins.'],
      accent: 'emerald.400',
      media: {
        src: '/images/arnold.jpg',
        alt: 'Athletic nutrition and bodybuilding inspiration image',
        objectPosition: 'center center',
      },
    },
    {
      icon: FiBarChart2,
      title: 'Progress views that feel actionable',
      description: 'Charts, scores, and summaries are arranged to help you make a decision, not just inspect data.',
      bullets: ['Clean summary of what changed today.', 'Trend visibility for long-term progress.', 'Easy to read on mobile and desktop.'],
      accent: 'sky.400',
      media: {
        src: '/images/ppl.webp',
        alt: 'People training together in a performance-focused environment',
        objectPosition: 'center center',
      },
    },
  ];

  return (
    <PreAuthShell>
      <Box
        as="main"
        position="relative"
        w="full"
        overflow="hidden"
        bg={pageBackground}
        bgImage={pageGlow}
        color={shellText}
      >
        <Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 18, xl: 24 }}>
          <Stack spacing={{ base: 14, lg: 20 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 12 }} alignItems="center">
            <Reveal>
              <VStack align="start" spacing={6}>
                <LandingEyebrow
                  borderColor={surfaceBorder}
                  backgroundColor={eyebrowBg}
                  textColor={eyebrowColor}
                  accentColor="teal.400"
                >
                  Fitness workspace
                </LandingEyebrow>
                <Box maxW="3xl">
                  <Heading
                    as="h1"
                    size={{ base: '2xl', md: '3xl', lg: '4xl' }}
                    lineHeight="0.95"
                    color={headingColor}
                    letterSpacing="-0.04em"
                  >
                    Train with structure.
                    <Box as="span" display="block" bgGradient="linear(to-r, teal.300, cyan.300)" bgClip="text">
                      Track nutrition with context.
                    </Box>
                    Know what to do next.
                  </Heading>
                </Box>
                <Text fontSize={{ base: 'lg', md: 'xl' }} lineHeight="tall" color={shellText} maxW="2xl">
                  NutriFlow brings workouts, meals, readiness, and AI coaching into one dark, focused workspace so every
                  day has a clear next step without the clutter of a template-style landing page.
                </Text>
                <HStack spacing={3} flexWrap="wrap">
                  <Button
                    onClick={() => navigate('/register')}
                    size="lg"
                    colorScheme="teal"
                    rightIcon={<FiArrowRight />}
                    px={8}
                    h={14}
                    borderRadius="full"
                    boxShadow="0 16px 30px rgba(20, 184, 166, 0.24)"
                    _hover={{ transform: 'translateY(-1px)', boxShadow: '0 18px 36px rgba(20, 184, 166, 0.3)' }}
                    transition="all 0.2s ease"
                  >
                    Get Started
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    size="lg"
                    variant="outline"
                    color={buttonText}
                    borderColor={buttonBorder}
                    bg={buttonBg}
                    px={8}
                    h={14}
                    borderRadius="full"
                    _hover={{ bg: buttonHoverBg, borderColor: buttonHoverBorder }}
                    transition="all 0.2s ease"
                  >
                    Sign Up
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    size="lg"
                    variant="ghost"
                    color={buttonText}
                    px={6}
                    h={14}
                    borderRadius="full"
                    _hover={{ bg: ghostHoverBg }}
                    transition="all 0.2s ease"
                  >
                    Login
                  </Button>
                </HStack>
                <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} w="full">
                  {heroMetrics.map((metric) => (
                    <LandingMetric
                      key={metric.label}
                      {...metric}
                      borderColor={surfaceBorder}
                      backgroundColor={mutedSurface}
                      headingColor={headingColor}
                      textColor={shellText}
                    />
                  ))}
                </SimpleGrid>
              </VStack>
            </Reveal>

            <Reveal delay={0.08}>
              <PreAuthCard
                p={{ base: 5, md: 7 }}
                bg={cardSurface}
                borderColor={surfaceBorder}
                boxShadow={panelShadow}
              >
                <VStack align="stretch" spacing={5}>
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color={shellText}>
                        Today&apos;s snapshot
                      </Text>
                      <Heading as="h2" size="lg" color={headingColor} mt={2}>
                        A focused view of the day.
                      </Heading>
                    </Box>
                    <Badge
                      borderRadius="full"
                      px={3}
                      py={1}
                      color="white"
                      bgGradient="linear(to-r, teal.400, cyan.400)"
                      textTransform="none"
                    >
                      Ready to train
                    </Badge>
                  </HStack>

                  <Box
                    position="relative"
                    borderRadius="2xl"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={surfaceBorder}
                    bg={mutedSurface}
                  >
                    <AspectRatio ratio={16 / 10}>
                      <Box position="relative">
                        <Image
                          src="/images/fitness-bg.jpg"
                          alt="Athlete training in a focused premium fitness space"
                          w="full"
                          h="full"
                          objectFit="cover"
                          objectPosition="center center"
                          loading="eager"
                          decoding="async"
                          draggable={false}
                          sizes="(min-width: 1280px) 42vw, (min-width: 992px) 46vw, 100vw"
                        />
                        <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(2, 6, 23, 0.72), transparent 56%)" />
                        <Box
                          position="absolute"
                          top={4}
                          left={4}
                          px={3}
                          py={1.5}
                          borderRadius="full"
                          bg="blackAlpha.600"
                          color="white"
                          fontSize="xs"
                          fontWeight="700"
                          letterSpacing="0.16em"
                          textTransform="uppercase"
                          display="inline-flex"
                          alignItems="center"
                          gap={2}
                        >
                          <FiActivity />
                          Training focus
                        </Box>
                        <Box
                          position="absolute"
                          right={4}
                          bottom={4}
                          px={4}
                          py={3}
                          borderRadius="xl"
                          bg="rgba(2, 6, 23, 0.72)"
                          borderWidth="1px"
                          borderColor="whiteAlpha.200"
                          backdropFilter="blur(10px)"
                        >
                          <Text fontSize="xs" color="gray.300" letterSpacing="0.16em" textTransform="uppercase">
                            Daily readiness
                          </Text>
                          <HStack spacing={3} align="baseline" mt={1}>
                            <Heading as="p" size="md" color={headingColor}>
                              82
                            </Heading>
                            <Text fontSize="sm" color="gray.300">
                              Moderate load
                            </Text>
                          </HStack>
                        </Box>
                      </Box>
                    </AspectRatio>
                  </Box>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                    <Box
                      position="relative"
                      borderRadius="xl"
                      overflow="hidden"
                      borderWidth="1px"
                      borderColor={surfaceBorder}
                      bg={mutedSurface}
                    >
                      <AspectRatio ratio={4 / 3}>
                        <Box position="relative">
                          <Image
                            src="/images/charts-bg.jpg"
                            alt="Performance charts and trend review"
                            w="full"
                            h="full"
                            objectFit="cover"
                            objectPosition="center center"
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            sizes="(min-width: 992px) 20vw, 46vw"
                          />
                          <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(2, 6, 23, 0.68), transparent 58%)" />
                          <Box position="absolute" left={3} bottom={3} px={3} py={1.5} borderRadius="full" bg="blackAlpha.600" color="white" fontSize="xs" fontWeight="700">
                            Progress review
                          </Box>
                        </Box>
                      </AspectRatio>
                    </Box>
                    <Box
                      position="relative"
                      borderRadius="xl"
                      overflow="hidden"
                      borderWidth="1px"
                      borderColor={surfaceBorder}
                      bg={mutedSurface}
                    >
                      <AspectRatio ratio={4 / 3}>
                        <Box position="relative">
                          <Image
                            src="/images/trackingdiet-bg.jpeg"
                            alt="Meal tracking and nutrition planning view"
                            w="full"
                            h="full"
                            objectFit="cover"
                            objectPosition="center center"
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            sizes="(min-width: 992px) 20vw, 46vw"
                          />
                          <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(2, 6, 23, 0.68), transparent 58%)" />
                          <Box position="absolute" left={3} bottom={3} px={3} py={1.5} borderRadius="full" bg="blackAlpha.600" color="white" fontSize="xs" fontWeight="700">
                            Meal logging
                          </Box>
                        </Box>
                      </AspectRatio>
                    </Box>
                  </SimpleGrid>

                  <Box p={4} borderRadius="xl" borderWidth="1px" borderColor={surfaceBorder} bg={mutedSurface}>
                    <Text fontSize="sm" fontWeight="700" color={headingColor}>
                      What NutriFlow keeps aligned
                    </Text>
                    <Stack spacing={2} mt={3}>
                      {[
                        'Workout tracking that connects to your recovery trend.',
                        'Nutrition logging that supports real daily decisions.',
                        'AI guidance that stays concise and action oriented.',
                      ].map((line) => (
                        <HStack key={line} spacing={3} align="start">
                          <Box boxSize={2.5} borderRadius="full" bg="teal.300" mt={2} />
                          <Text color={shellText}>{line}</Text>
                        </HStack>
                      ))}
                    </Stack>
                  </Box>
                </VStack>
              </PreAuthCard>
            </Reveal>
          </SimpleGrid>

          <Reveal delay={0.12}>
            <VStack spacing={4} textAlign="center" maxW="3xl" mx="auto">
              <LandingEyebrow
                borderColor={surfaceBorder}
                backgroundColor={eyebrowBg}
                textColor={eyebrowColor}
                accentColor="teal.400"
              >
                How it works
              </LandingEyebrow>
              <Heading as="h2" size="xl" color={headingColor} letterSpacing="-0.03em">
                A simple loop from plan to progress.
              </Heading>
              <Text color={shellText} fontSize={{ base: 'md', md: 'lg' }} lineHeight="tall">
                Each section is designed to keep the workflow clear: set direction, log the day, then let AI help you
                choose the next move.
              </Text>
            </VStack>
          </Reveal>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {howItWorks.map((step, index) => (
              <Reveal key={step.title} delay={0.08 * index}>
                <LandingStepCard
                  {...step}
                  borderColor={surfaceBorder}
                  backgroundColor={cardSurface}
                  headingColor={headingColor}
                  textColor={shellText}
                />
              </Reveal>
            ))}
          </SimpleGrid>

          <Reveal delay={0.14}>
            <VStack spacing={4} textAlign="center" maxW="3xl" mx="auto">
              <LandingEyebrow
                borderColor={surfaceBorder}
                backgroundColor={eyebrowBg}
                textColor={eyebrowColor}
                accentColor="cyan.400"
              >
                Features
              </LandingEyebrow>
              <Heading as="h2" size="xl" color={headingColor} letterSpacing="-0.03em">
                Built for the parts of training that actually repeat.
              </Heading>
              <Text color={shellText} fontSize={{ base: 'md', md: 'lg' }} lineHeight="tall">
                The landing now shows the product surface more clearly: AI coaching, readiness, training, and nutrition
                all presented in a way that feels closer to the dashboard experience.
              </Text>
            </VStack>
          </Reveal>

          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6}>
            {featureCards.map((feature, index) => (
              <Reveal key={feature.title} delay={0.06 * index}>
                <LandingFeatureCard
                  {...feature}
                  borderColor={surfaceBorder}
                  backgroundColor={cardSurface}
                  headingColor={headingColor}
                  textColor={shellText}
                  mutedSurface={mutedSurface}
                />
              </Reveal>
            ))}
          </SimpleGrid>

          <Reveal delay={0.16}>
            <PreAuthCard
              p={{ base: 6, md: 8 }}
              bg={cardSurface}
              borderColor={surfaceBorder}
              boxShadow={panelShadow}
            >
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} alignItems="center">
                <VStack align="start" spacing={3}>
                  <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                    Start in minutes
                  </Badge>
                  <Heading as="h2" size="lg" color={headingColor} letterSpacing="-0.03em">
                    Ready to make nutrition and training feel coordinated?
                  </Heading>
                  <Text color={shellText} lineHeight="tall">
                    Create your account, sign in, and begin with a cleaner daily workflow that keeps your workouts,
                    meals, and coaching recommendations aligned.
                  </Text>
                </VStack>
                <HStack spacing={3} justify={{ base: 'start', lg: 'end' }} flexWrap="wrap">
                  <Button
                    onClick={() => navigate('/register')}
                    size="lg"
                    colorScheme="teal"
                    px={8}
                    h={14}
                    borderRadius="full"
                    boxShadow="0 16px 30px rgba(20, 184, 166, 0.24)"
                    _hover={{ transform: 'translateY(-1px)', boxShadow: '0 18px 36px rgba(20, 184, 166, 0.3)' }}
                    transition="all 0.2s ease"
                  >
                    Get Started
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    size="lg"
                    h={14}
                    px={8}
                    borderRadius="full"
                    variant="outline"
                    color={buttonText}
                    borderColor={buttonBorder}
                    bg={buttonBg}
                    _hover={{ bg: buttonHoverBg, borderColor: buttonHoverBorder }}
                    transition="all 0.2s ease"
                  >
                    Login
                  </Button>
                </HStack>
              </SimpleGrid>
            </PreAuthCard>
          </Reveal>
        </Stack>
      </Container>
      </Box>
    </PreAuthShell>
  );
}

export default Home;
