import { memo } from 'react';
import { Box, Button, Container, DarkMode, Flex, Grid, Heading, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CountUp } from '../../Motion';
import { DURATION, EASE_OUT } from '../../Motion/tokens';

const MotionBox = motion(Box);

function FlowStat({ flow, label, value, decimals = 0, unit, fill, index, action }) {
  return (
    <Box>
      <Flex justify="space-between" align="baseline" gap={3}>
        <Text fontSize="sm" fontWeight="600" color="fg.muted">{label}</Text>
        {action}
      </Flex>
      <Text textStyle="figure" fontSize={{ base: '5xl', md: '6xl' }} mt={1}>
        {value === null ? '–' : <CountUp value={value} decimals={decimals} />}
        {unit && (
          <Text as="span" fontFamily="body" fontSize="md" fontWeight="500" color="fg.muted" ml={2} sx={{ fontVariantNumeric: 'normal' }}>
            {unit}
          </Text>
        )}
      </Text>
      <Box h={{ base: '10px', md: '12px' }} bg="bg.muted" borderRadius="3px" mt={3} overflow="hidden">
        <MotionBox
          h="100%"
          bg={`${flow}.solid`}
          borderRadius="3px"
          style={{ originX: 0 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: Math.min(Math.max(fill, 0), 1) }}
          transition={{ duration: 1, ease: EASE_OUT, delay: 0.2 + index * 0.1 }}
        />
      </Box>
    </Box>
  );
}

/**
 * The top of the dashboard: a black band with today's three flows as big numbers
 * and bars, the same scoreboard language as the landing page.
 */
function TodayScoreboard({ dateLabel, greeting, today, goals, checkIn, onCheckIn }) {
  return (
    <DarkMode>
      <Box as="section" bg="bg.canvas" color="fg" aria-label="Today at a glance">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} pt={{ base: 7, md: 10 }} pb={{ base: 8, md: 12 }}>
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.slow, ease: EASE_OUT }}
          >
            <Text fontSize="sm" color="fg.muted" fontWeight="500">{dateLabel}</Text>
            <Heading as="h1" fontSize={{ base: '5xl', md: '7xl' }} mt={1} lineHeight="0.9">{greeting}</Heading>
          </MotionBox>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={{ base: 6, md: 10 }} mt={{ base: 7, md: 10 }}>
            <FlowStat
              index={0}
              flow="fuel"
              label="Fuel today"
              value={Math.round(today.calories)}
              unit={`/ ${goals.dailyCalories.toLocaleString()} kcal`}
              fill={goals.dailyCalories ? today.calories / goals.dailyCalories : 0}
            />
            <FlowStat
              index={1}
              flow="train"
              label="Training this week"
              value={today.weeklyWorkouts}
              unit={`/ ${goals.weeklyWorkouts} sessions`}
              fill={goals.weeklyWorkouts ? today.weeklyWorkouts / goals.weeklyWorkouts : 0}
            />
            <FlowStat
              index={2}
              flow="recover"
              label="Sleep last night"
              value={checkIn ? Number(checkIn.sleepHours) : null}
              decimals={checkIn && !Number.isInteger(Number(checkIn.sleepHours)) ? 1 : 0}
              unit={checkIn ? 'hours' : 'not checked in'}
              fill={checkIn ? Number(checkIn.sleepHours) / 8 : 0}
              action={!checkIn && (
                <Button size="xs" variant="outline" onClick={onCheckIn}>Check in</Button>
              )}
            />
          </Grid>
        </Container>
      </Box>
    </DarkMode>
  );
}

export default memo(TodayScoreboard);
