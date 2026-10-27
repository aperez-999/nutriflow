import { Box, Button, Card, CardBody, Flex, Grid, Heading, Text, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiShare } from 'react-icons/fi';
import { CountUp } from '../Motion';
import { EASE_OUT } from '../Motion/tokens';
import { LEVEL_FLOW, LEVEL_LABEL } from '../Dashboard/components/verdict';
import { formatDayKey } from '../../utils/dateUtils';
import { recapShareText } from './recapUtils';

const MotionBox = motion(Box);
const FIGURES = [
  { key: 'daysLogged', label: 'Days logged', unit: 'of 7' },
  { key: 'sessions', label: 'Sessions', unit: 'logged' },
  { key: 'avgCalories', label: 'Calories', unit: 'a day on average' },
  { key: 'checkIns', label: 'Check-ins', unit: 'mornings' },
];

const change = (now, before) => {
  const diff = now - before;
  if (diff === 0) return 'same as last week';
  return `${diff > 0 ? '+' : '−'}${Math.abs(diff).toLocaleString()} vs last week`;
};

/** Profile → Your week: readiness for each of the last 7 days, the best one, and totals vs last week. */
export default function WeeklyRecap({ recap }) {
  const toast = useToast();
  const { days, week, lastWeek, best } = recap;

  const share = async () => {
    const text = recapShareText(recap);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My NutriFlow week', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied your week', description: text, status: 'success', duration: 4000, isClosable: true });
    } catch (error) {
      // Closing the share sheet is not an error worth reporting.
      if (error?.name !== 'AbortError') {
        toast({ title: 'Could not share', description: text, status: 'info', duration: 6000, isClosable: true });
      }
    }
  };

  return (
    <Card>
      <CardBody p={{ base: 5, md: 7 }}>
        <Flex justify="space-between" align="flex-start" gap={4} wrap="wrap">
          <Box>
            <Heading as="h2" size="md">Your week</Heading>
            <Text fontSize="sm" color="fg.muted" mt={1}>The last 7 days, compared with the 7 before.</Text>
          </Box>
          <Button size="sm" variant="outline" leftIcon={<FiShare />} onClick={share} isDisabled={!week.daysLogged}>
            Share my week
          </Button>
        </Flex>

        <Text fontFamily="heading" fontWeight="800" fontSize={{ base: '3xl', md: '4xl' }} lineHeight="1" mt={5}>
          {best
            ? `Best day: ${formatDayKey(best.dayKey, { weekday: 'long' })}, readiness ${best.score}.`
            : 'Your week fills in as you log.'}
        </Text>

        {/* Readiness per day; a day with nothing logged has no real score, so it stays grey. */}
        <Grid
          templateColumns="repeat(7, 1fr)"
          gap={{ base: 1.5, md: 3 }}
          mt={6}
          role="img"
          aria-label={days.map((d) => `${d.label} ${d.logged ? `${LEVEL_LABEL[d.level]}, ${d.score}` : 'nothing logged'}`).join('; ')}
        >
          {days.map((day, i) => (
            <Flex key={day.dayKey} direction="column" align="center" gap={1.5}>
              <Text fontSize="xs" fontWeight="700" color={day.logged ? 'fg' : 'fg.muted'} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {day.logged ? day.score : '–'}
              </Text>
              <Flex h="96px" w="100%" align="flex-end" bg="bg.muted" borderRadius="4px" overflow="hidden">
                <MotionBox
                  w="100%"
                  h={day.logged ? `${Math.max(day.score, 4)}%` : '6%'}
                  bg={day.logged ? `${LEVEL_FLOW[day.level]}.solid` : 'border'}
                  style={{ originY: 1 }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 + i * 0.05 }}
                />
              </Flex>
              <Text fontSize="xs" color={i === days.length - 1 ? 'fg' : 'fg.muted'} fontWeight={i === days.length - 1 ? 700 : 500}>
                {i === days.length - 1 ? 'Today' : day.label}
              </Text>
            </Flex>
          ))}
        </Grid>

        <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4} mt={6} pt={5} borderTopWidth="1px" borderColor="border">
          {FIGURES.map((figure) => (
            <Box key={figure.key}>
              <Text fontSize="xs" fontWeight="700" color="fg.muted">{figure.label}</Text>
              <Text textStyle="figure" fontSize="4xl" lineHeight="1.1"><CountUp value={week[figure.key]} /></Text>
              <Text fontSize="xs" color="fg.muted">{figure.unit}, {change(week[figure.key], lastWeek[figure.key])}</Text>
            </Box>
          ))}
        </Grid>
      </CardBody>
    </Card>
  );
}
