import { useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { getCheckIns, getDiets, getWorkouts } from '../services/api';
import { CountUp } from '../components/Motion';
import { DURATION, EASE_OUT } from '../components/Motion/tokens';
import { RhythmCard } from '../components/Dashboard/components';
import { getRhythm } from '../components/Dashboard/utils/dashboardUtils';
import { getProfileStats, memberSince } from '../components/Profile/profileUtils';
import { getWeeklyRecap } from '../components/Profile/recapUtils';
import WeeklyRecap from '../components/Profile/WeeklyRecap';

const MotionBox = motion(Box);
const FLOWS = [
  { key: 'fuel', label: 'Fuel' },
  { key: 'train', label: 'Train' },
  { key: 'recover', label: 'Recover' },
];
const DEFAULT_GOALS = { dailyCalories: 2000, dailyProtein: 150, weeklyWorkouts: 5 };

const initialsOf = (name = '') => {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'NF';
};

/** The user's personal signature: how their logged days split across the three flows. */
function MixStrip({ mix }) {
  const total = mix.fuel + mix.train + mix.recover;
  return (
    <Box>
      <Flex h="14px" borderRadius="3px" overflow="hidden" bg="bg.muted" gap="2px" aria-hidden="true">
        {total > 0 && FLOWS.map((flow, i) => (
          <MotionBox
            key={flow.key}
            bg={`${flow.key}.solid`}
            style={{ originX: 0 }}
            flexGrow={mix[flow.key]}
            flexBasis={0}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 + i * 0.1 }}
          />
        ))}
      </Flex>
      {total === 0 && (
        <Text fontSize="sm" color="fg.muted" mt={3}>Your mix fills in as you log meals, workouts and check-ins.</Text>
      )}
      <HStack spacing={5} mt={3} flexWrap="wrap" fontSize="sm">
        {FLOWS.map((flow) => (
          <HStack key={flow.key} spacing={2}>
            <Box boxSize="10px" borderRadius="2px" bg={`${flow.key}.solid`} />
            <Text><Text as="span" fontWeight="700">{mix[flow.key]}</Text> <Text as="span" color="fg.muted">{flow.label.toLowerCase()} days</Text></Text>
          </HStack>
        ))}
      </HStack>
    </Box>
  );
}

function Stat({ label, value, flow }) {
  return (
    <Box bg={flow ? `${flow}.subtle` : 'bg.surface'} borderWidth={flow ? 0 : '1px'} borderColor="border" borderRadius="panel" p={4}>
      <Text fontSize="sm" fontWeight="600" color={flow ? `${flow}.fg` : 'fg.muted'}>{label}</Text>
      <Text textStyle="figure" fontSize={{ base: '4xl', md: '5xl' }} mt={2}><CountUp value={value} /></Text>
    </Box>
  );
}

function FavoriteList({ title, items, empty }) {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="700" mb={2}>{title}</Text>
      {items.length === 0 ? (
        <Text fontSize="sm" color="fg.muted">{empty}</Text>
      ) : (
        <VStack as="ol" align="stretch" spacing={0} listStyleType="none">
          {items.map((item, i) => (
            <Flex as="li" key={item.label} justify="space-between" py={2} borderTopWidth={i === 0 ? 0 : '1px'} borderColor="border">
              <Text fontSize="sm" noOfLines={1}>{item.label}</Text>
              <Text fontSize="sm" color="fg.muted" flexShrink={0}>{item.count}×</Text>
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
}

function Profile() {
  const { user } = useContext(AuthContext);
  const account = user?.user || {};
  const goals = { ...DEFAULT_GOALS, ...account.goals };
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getDiets().catch(() => []),
      getWorkouts().catch(() => []),
      getCheckIns(120).catch(() => []),
    ]).then(([diets, workouts, checkIns]) => {
      if (alive) setLogs({ diets: diets || [], workouts: workouts || [], checkIns: checkIns || [] });
    });
    return () => { alive = false; };
  }, []);

  const stats = useMemo(() => (logs ? getProfileStats(logs.diets, logs.workouts, logs.checkIns) : null), [logs]);
  const rhythm = useMemo(() => (logs ? getRhythm(logs.diets, logs.workouts, logs.checkIns) : null), [logs]);
  const recap = useMemo(() => (logs ? getWeeklyRecap(logs.diets, logs.workouts, logs.checkIns) : null), [logs]);
  const since = memberSince(account._id);

  return (
    <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, ease: EASE_OUT }}
      >
        <Card>
          <CardBody p={{ base: 5, md: 7 }}>
            <Flex gap={{ base: 4, md: 6 }} align={{ base: 'flex-start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }}>
              <Flex
                boxSize={{ base: '88px', md: '112px' }}
                flexShrink={0}
                bg="fg"
                color="bg.surface"
                borderRadius="panel"
                align="center"
                justify="center"
                fontFamily="heading"
                fontWeight="800"
                fontSize={{ base: '5xl', md: '6xl' }}
                aria-hidden="true"
              >
                {initialsOf(account.username)}
              </Flex>
              <Box minW={0} flex="1">
                {/* Long names step down a size so they wrap at most once instead of mid-word. */}
                <Heading
                  as="h1"
                  fontSize={(account.username || '').length > 12 ? { base: '3xl', md: '5xl' } : { base: '5xl', md: '7xl' }}
                  lineHeight="0.95"
                  noOfLines={2}
                  wordBreak="break-word"
                >
                  {account.username || 'Your profile'}
                </Heading>
                <Text color="fg.muted" mt={2}>
                  {since ? `Member since ${since.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}` : account.email}
                </Text>
              </Box>
              <Button as={RouterLink} to="/settings" variant="outline" flexShrink={0}>Settings</Button>
            </Flex>
            <Box mt={6}>
              {stats ? <MixStrip mix={stats.mix} /> : <Skeleton h="14px" borderRadius="3px" />}
            </Box>
          </CardBody>
        </Card>
      </MotionBox>

      <Box mt={6}>
        {recap ? <WeeklyRecap recap={recap} /> : <Skeleton h="360px" borderRadius="panel" />}
      </Box>

      {!stats ? (
        <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3} mt={6}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} h="104px" borderRadius="panel" />)}
        </Grid>
      ) : (
        <>
          <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3} mt={6}>
            <Stat label="Best streak" value={stats.bestStreak} flow="recover" />
            <Stat label="Days logged" value={stats.activeDays} />
            <Stat label="Meals logged" value={stats.meals} flow="fuel" />
            <Stat label="Workouts logged" value={stats.workouts} flow="train" />
          </Grid>

          <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: '7fr 5fr' }} gap={6} mt={6} alignItems="start">
            <RhythmCard rhythm={rhythm} />
            <VStack spacing={6} align="stretch">
              <Card>
                <CardBody>
                  <Heading as="h2" size="md">What you log most</Heading>
                  <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={6} mt={4}>
                    <FavoriteList title="Foods" items={stats.topFoods} empty="Log a few meals to see your staples." />
                    <FavoriteList title="Workouts" items={stats.topWorkoutTypes} empty="Log a few sessions to see your favorites." />
                  </Grid>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Flex justify="space-between" align="center" gap={3}>
                    <Heading as="h2" size="md">Your goals</Heading>
                    <Button as={RouterLink} to="/settings#goals" size="sm" variant="outline">Change</Button>
                  </Flex>
                  <Grid templateColumns="repeat(3, 1fr)" gap={3} mt={4}>
                    {[
                      ['Calories', goals.dailyCalories.toLocaleString(), 'kcal a day', 'fuel'],
                      ['Protein', goals.dailyProtein, 'g a day', 'fuel'],
                      ['Training', goals.weeklyWorkouts, 'sessions a week', 'train'],
                    ].map(([label, value, unit, flow]) => (
                      <Box key={label}>
                        <Text fontSize="xs" fontWeight="700" color={`${flow}.fg`}>{label}</Text>
                        <Text textStyle="figure" fontSize="3xl" mt={1}>{value}</Text>
                        <Text fontSize="xs" color="fg.muted">{unit}</Text>
                      </Box>
                    ))}
                  </Grid>
                </CardBody>
              </Card>
            </VStack>
          </Box>
        </>
      )}
    </Container>
  );
}

export default Profile;
