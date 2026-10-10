import { memo } from 'react';
import { Box, Button, Flex, Grid, Heading, Text, Wrap, WrapItem } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { CountUp } from '../../Motion';
import { DURATION, EASE_OUT } from '../../Motion/tokens';
import { ScoreRing } from './CheckInForm';
import { LEVEL_LABEL } from './verdict';

const MotionBox = motion(Box);

function Bar({ flow, fill, index }) {
  return (
    <Box h="8px" bg="bg.surface" borderRadius="full" mt={3} overflow="hidden">
      <MotionBox
        h="100%"
        bg={`${flow}.solid`}
        borderRadius="full"
        style={{ originX: 0 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.min(Math.max(fill, 0), 1) }}
        transition={{ duration: 1, ease: EASE_OUT, delay: 0.25 + index * 0.1 }}
      />
    </Box>
  );
}

/** A tile tinted in its flow's color: the label, one big number, and a bar toward the goal. */
function FlowTile({ flow, label, value, unit, fill, detail, index }) {
  return (
    <Box bg={`${flow}.subtle`} borderRadius="panel" p={{ base: 4, md: 5 }}>
      <Text fontSize="sm" fontWeight="700" color={`${flow}.fg`}>{label}</Text>
      <Text textStyle="figure" fontSize={{ base: '5xl', md: '6xl' }} mt={2} color="fg">
        <CountUp value={value} />
        <Text as="span" fontFamily="body" fontSize="sm" fontWeight="500" color="fg.muted" ml={2} sx={{ fontVariantNumeric: 'normal' }}>
          {unit}
        </Text>
      </Text>
      <Bar flow={flow} fill={fill} index={index} />
      {detail && <Text fontSize="sm" color="fg.muted" mt={2}>{detail}</Text>}
    </Box>
  );
}

const ACTION_DOTS = { checkin: 'recover', meal: 'fuel', workout: 'train' };

/**
 * The top of the dashboard: today's verdict as the headline, one row of actions,
 * then readiness, fuel and training as tinted tiles. Follows light and dark mode.
 */
function TodayScoreboard({ greeting, dateLabel, readiness, today, goals, checkIn, onAction }) {
  const verdict = LEVEL_LABEL[readiness.level] || 'Steady day';
  // The next most useful step gets the primary button.
  const primary = !checkIn ? 'checkin' : today.calories === 0 ? 'meal' : 'workout';
  const actions = [
    { key: 'checkin', label: checkIn ? 'Edit check-in' : 'Check in' },
    { key: 'meal', label: 'Log meal' },
    { key: 'workout', label: 'Log workout' },
  ];

  return (
    <Box as="section" aria-label="Today at a glance">
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, ease: EASE_OUT }}
      >
        <Text fontSize="sm" color="fg.muted" fontWeight="500">{greeting} {dateLabel}</Text>
        <Heading as="h1" fontSize={{ base: '6xl', md: '8xl' }} lineHeight="0.88" mt={1}>
          {verdict}.
        </Heading>
        <Text fontSize={{ base: 'md', md: 'lg' }} mt={3} maxW="60ch">{readiness.shortRecommendation}</Text>
      </MotionBox>

      <Wrap spacing={2} mt={5}>
        {actions.map((action) => (
          <WrapItem key={action.key}>
            <Button
              variant={action.key === primary ? 'solid' : 'outline'}
              onClick={() => onAction(action.key)}
              leftIcon={<Box boxSize="8px" borderRadius="2px" bg={`${ACTION_DOTS[action.key]}.solid`} />}
            >
              {action.label}
            </Button>
          </WrapItem>
        ))}
        <WrapItem>
          <Button as={RouterLink} to="/fitness-hub" variant="ghost">Ask your coach</Button>
        </WrapItem>
      </Wrap>

      <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: '1.1fr 1fr 1fr' }} gap={{ base: 3, md: 4 }} mt={6}>
        <Flex
          as="button"
          type="button"
          onClick={() => onAction('checkin')}
          aria-label={`Readiness ${readiness.score} of 100, ${verdict}. Open check-in.`}
          textAlign="left"
          bg="recover.subtle"
          borderRadius="panel"
          p={{ base: 4, md: 5 }}
          gap={4}
          align="center"
          gridColumn={{ sm: '1 / -1', lg: 'auto' }}
          transition={`box-shadow ${DURATION.fast}s ease`}
          _hover={{ boxShadow: 'inset 0 0 0 2px var(--chakra-colors-recover-solid)' }}
          _focusVisible={{ boxShadow: 'inset 0 0 0 2px var(--chakra-colors-recover-solid)', outline: 'none' }}
        >
          <ScoreRing score={readiness.score} level={readiness.level} size={104} />
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="700" color="recover.fg">Readiness</Text>
            <Text fontSize="sm" color="fg.muted" mt={1}>
              {checkIn
                ? `Checked in: ${checkIn.sleepHours} h sleep, energy ${checkIn.energy} of 5.`
                : 'From your logs only. Check in to add how you feel.'}
            </Text>
          </Box>
        </Flex>
        <FlowTile
          index={0}
          flow="fuel"
          label="Fuel today"
          value={Math.round(today.calories)}
          unit={`/ ${goals.dailyCalories.toLocaleString()} kcal`}
          fill={goals.dailyCalories ? today.calories / goals.dailyCalories : 0}
          detail={`${Math.round(today.protein)} of ${goals.dailyProtein} g protein`}
        />
        <FlowTile
          index={1}
          flow="train"
          label="Training this week"
          value={today.weeklyWorkouts}
          unit={`/ ${goals.weeklyWorkouts} sessions`}
          fill={goals.weeklyWorkouts ? today.weeklyWorkouts / goals.weeklyWorkouts : 0}
        />
      </Grid>
    </Box>
  );
}

export default memo(TodayScoreboard);
