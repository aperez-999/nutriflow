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
            Step {Number(step)}
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
              <Heading as="h3" size="md" color={headingColor}>
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
  const eyebrowBg = 'bg.surface';
  const eyebrowColor = 'fg';
  const buttonText = 'fg';
  const buttonBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.300');
  const buttonBg = 'bg.surface';
  const buttonHoverBg = 'bg.muted';
  const buttonHoverBorder = 'border';
  const ghostHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const panelShadow = useColorModeValue('0 20px 45px rgba(15, 23, 42, 0.08)', '0 20px 60px rgba(2, 6, 23, 0.35)');

  const heroMetrics = [
    { label: 'Fuel', value: 'Meals that match the day', detail: 'USDA-backed logging with protein and calorie targets.' },
    { label: 'Train', value: 'Effort that fits you', detail: 'Session intensity guided by your readiness.' },
    { label: 'Recover', value: '20-second check-in', detail: 'Sleep, energy, soreness and water shape your score.' },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Check in each morning',
      description: 'Four quick taps for sleep, energy, soreness and water. Your readiness score updates instantly.',
      media: {
        src: '/images/running.jpg',
        alt: 'Athlete running outdoors with a focused training posture',
        objectPosition: 'center center',
        loading: 'eager',
      },
    },
    {
      step: '02',
      title: 'Log meals and sessions',
      description: 'Search real USDA foods and exercises. Every entry fills in your Fuel and Train flows for the day.',
      media: {
        src: '/images/core-workout.jpg',
        alt: 'Core workout training scene with focused movement',
        objectPosition: 'center center',
      },
    },
    {
      step: '03',
      title: 'Follow one clear next step',
      description: 'Your coach reads the whole day and tells you whether to push, hold steady, or recover.',
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
      title: 'A coach that knows your day',
      description: 'Ask anything. Answers draw on your own meals, sessions and check-ins, not generic advice.',
      bullets: ['Workout and meal plans built from your logs.', 'Short, direct answers you can act on.', 'Your data stays yours: only your signed-in account can read it.'],
      accent: 'teal.400',
      media: {
        src: '/images/hiit.jpg',
        alt: 'High-intensity training session with strong visual energy',
        objectPosition: 'center center',
      },
    },
    {
      icon: FiActivity,
      title: 'Readiness without a wearable',
      description: 'Training load, fuel and a 20-second check-in combine into one honest score for today.',
      bullets: ['Short sleep or high soreness? It tells you to ease off.', 'Fully rested? It tells you to push.', 'No watch, ring or subscription needed.'],
      accent: 'cyan.400',
      media: {
        src: '/images/full-body.jpg',
        alt: 'Full body fitness training image with a balanced workout feel',
        objectPosition: 'center center',
      },
    },
    {
      icon: FiCoffee,
      title: 'Fuel for the session ahead',
      description: 'Meals are judged against your training, not a diet. Under-fueled before a hard day? You will know.',
      bullets: ['Protein and calorie targets you set.', 'Real foods from the USDA database.', 'No food is labeled good or bad.'],
      accent: 'emerald.400',
      media: {
        src: '/images/trackingdiet-bg.jpeg',
        alt: 'Fresh whole foods laid out for a day of meals',
        objectPosition: 'center center',
      },
    },
    {
      icon: FiBarChart2,
      title: 'Consistency that forgives',
      description: 'Your rhythm map shows twelve weeks of fuel, training and recovery. One missed day never resets your streak.',
      bullets: ['Grace days instead of guilt.', 'See your patterns, not just today.', 'Built for real life, not perfect weeks.'],
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
                  Readiness without a wearable
                </LandingEyebrow>
                <Box maxW="3xl">
                  <Heading
                    as="h1"
                    size={{ base: '2xl', md: '3xl', lg: '4xl' }}
                    lineHeight="0.95"
                    color={headingColor}
                    letterSpacing="-0.04em"
                  >
                    <Box as="span" color="fuel.fg">Fuel. </Box>
                    <Box as="span" color="train.fg">Train. </Box>
                    <Box as="span" color="recover.fg">Recover.</Box>
                    <Box as="span" display="block">In rhythm.</Box>
                  </Heading>
                </Box>
                <Text fontSize={{ base: 'lg', md: 'xl' }} lineHeight="tall" color={shellText} maxW="2xl">
                  NutriFlow connects what you eat, how you train, and how you actually feel into one daily readiness
                  score, then coaches you toward consistency instead of perfection.
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
              <Heading as="h2" size="xl" color={headingColor} letterSpacing="-0.03em">
                Less than a minute of input, a clear plan back.
              </Heading>
              <Text color={shellText} fontSize={{ base: 'md', md: 'lg' }} lineHeight="tall">
                Check in, log as you go, then follow the one recommendation that matters for today.
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
              <Heading as="h2" size="xl" color={headingColor} letterSpacing="-0.03em">
                Built for real people, not perfect weeks.
              </Heading>
              <Text color={shellText} fontSize={{ base: 'md', md: 'lg' }} lineHeight="tall">
                Most trackers count calories and judge you for missing a day. NutriFlow connects eating, training and
                recovery so every log helps you decide what to do next.
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
                    Start your rhythm today.
                  </Heading>
                  <Text color={shellText} lineHeight="tall">
                    Make an account, do your first check-in, and get today&apos;s recommendation in under a
                    minute.
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
