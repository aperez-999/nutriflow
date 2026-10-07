import { Box, Button, Container, Flex, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

// Sample day shown in the hero. It uses the same layout as the in-app day label.
const SAMPLE_ROWS = [
  { flow: 'fuel', label: 'Fuel', value: '1,840', unit: '/ 2,200 kcal', detail: '128 g protein' },
  { flow: 'train', label: 'Train', value: '45', unit: 'min', detail: 'Strength, medium intensity' },
  { flow: 'recover', label: 'Recover', value: '7.5', unit: 'h sleep', detail: 'Energy 4 of 5, soreness 2 of 5' },
];

const STEPS = [
  {
    title: 'Check in when you wake up',
    body: 'Sleep, energy, soreness and water. Four taps, about twenty seconds. Your readiness score updates right away.',
  },
  {
    title: 'Log as the day happens',
    body: 'Search real foods from the USDA database and real exercises. Each entry fills in your fuel and training for the day.',
  },
  {
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
    title: 'Streaks that forgive',
    body: 'Miss a day and your streak survives. It only ends after two misses in a row, because consistency over months matters more than a perfect week.',
  },
  {
    title: 'A coach that has read your log',
    body: 'Ask for a training week or a meal plan and the answer is built from your own entries. Only you, signed in, can see that data.',
  },
];

function SampleDayLabel() {
  return (
    <Box
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border"
      borderRadius="panel"
      px={{ base: 5, md: 6 }}
      pt={5}
      pb={4}
      w="100%"
      maxW="420px"
      aria-label="Example of a NutriFlow day summary"
      role="img"
    >
      <Flex justify="space-between" align="baseline">
        <Text fontWeight="800" fontSize="2xl" letterSpacing="-0.02em">Today</Text>
        <Text fontSize="sm" color="fg.muted">Tuesday</Text>
      </Flex>
      <Box h="8px" bg="border.strong" mt={2} />
      <Flex justify="space-between" align="baseline" py={3} borderBottomWidth="4px" borderColor="border.strong">
        <Text fontWeight="800" fontSize="lg">Readiness</Text>
        <Text textStyle="figure" fontSize="6xl" color="recover.fg">78</Text>
      </Flex>
      {SAMPLE_ROWS.map((row) => (
        <Flex key={row.label} justify="space-between" align="flex-start" py={2.5} borderBottomWidth="1px" borderColor="border" gap={4}>
          <HStack spacing={2.5} align="center">
            <Box boxSize="10px" borderRadius="2px" bg={`${row.flow}.solid`} />
            <Box>
              <Text fontWeight="700" fontSize="sm">{row.label}</Text>
              <Text fontSize="xs" color="fg.muted">{row.detail}</Text>
            </Box>
          </HStack>
          <Text fontWeight="700" fontSize="sm" whiteSpace="nowrap" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {row.value} <Text as="span" color="fg.muted" fontWeight="500">{row.unit}</Text>
          </Text>
        </Flex>
      ))}
      <Box borderTopWidth="4px" borderColor="border.strong" mt="-1px" pt={3}>
        <Text fontSize="xs" fontWeight="700" color="fg.muted">Next step</Text>
        <Text fontSize="sm" mt={0.5}>
          Good day to push your main lift. Have a carb-forward meal about two hours before.
        </Text>
      </Box>
    </Box>
  );
}

function Home() {
  return (
    <Box>
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} pt={{ base: 10, md: 20 }} pb={{ base: 14, md: 24 }}>
        <Grid templateColumns={{ base: '1fr', lg: '1.1fr 1fr' }} gap={{ base: 12, lg: 16 }} alignItems="center">
          <Box maxW="560px">
            <Heading as="h1" fontSize={{ base: '4xl', md: '6xl' }} lineHeight="1.02" letterSpacing="-0.03em">
              Know what today needs.
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} color="fg.muted" mt={5} maxW="48ch">
              NutriFlow reads what you ate, how you trained and how you slept, then gives you one readiness score and one
              next step. No wearable required.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} mt={8}>
              <Button as={RouterLink} to="/register" size="lg">Create an account</Button>
              <Button as={RouterLink} to="/login" size="lg" variant="outline">Log in</Button>
            </Stack>
          </Box>
          <Flex justify={{ base: 'flex-start', lg: 'flex-end' }}>
            <SampleDayLabel />
          </Flex>
        </Grid>
      </Container>

      <Box bg="bg.surface" borderTopWidth="1px" borderBottomWidth="1px" borderColor="border">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 20 }}>
          <Heading as="h2" size="xl" maxW="20ch">How a day works</Heading>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={{ base: 8, md: 10 }} mt={10} as="ol" listStyleType="none">
            {STEPS.map((step, i) => (
              <Box as="li" key={step.title} borderTopWidth="3px" borderColor="border.strong" pt={4}>
                <Text textStyle="figure" fontSize="4xl" aria-hidden="true">{i + 1}</Text>
                <Heading as="h3" size="md" mt={3}>{step.title}</Heading>
                <Text color="fg.muted" mt={2} maxW="40ch">{step.body}</Text>
              </Box>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 20 }}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={{ base: 8, lg: 16 }}>
          <Heading as="h2" size="xl" maxW="14ch">Built for real weeks, not perfect ones</Heading>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} columnGap={10}>
            {DIFFERENCES.map((item) => (
              <Box key={item.title} borderTopWidth="1px" borderColor="border" py={5}>
                <Heading as="h3" size="sm">{item.title}</Heading>
                <Text color="fg.muted" mt={2}>{item.body}</Text>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Container>

      <Container maxW="container.xl" px={{ base: 4, md: 6 }} pb={{ base: 4, md: 8 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          gap={5}
          borderTopWidth="3px"
          borderColor="border.strong"
          pt={6}
        >
          <Box>
            <Heading as="h2" size="lg">Start with tomorrow morning’s check-in.</Heading>
            <Text color="fg.muted" mt={1}>Make an account tonight. It takes about a minute.</Text>
          </Box>
          <Button as={RouterLink} to="/register" size="lg">Create an account</Button>
        </Flex>
      </Container>
    </Box>
  );
}

export default Home;
