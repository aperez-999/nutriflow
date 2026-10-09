import { memo } from 'react';
import { Box, Card, CardBody, Flex, HStack, Heading, Text, Tooltip, VisuallyHidden } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CountUp } from '../../Motion';
import { DURATION, EASE_OUT } from '../../Motion/tokens';

const MotionBox = motion(Box);
import { formatDayKey } from '../../../utils/dateUtils';

const FLOWS = [
  { key: 'fuel', label: 'Fuel', hint: 'meal logged' },
  { key: 'train', label: 'Train', hint: 'workout logged' },
  { key: 'recover', label: 'Recover', hint: 'check-in done' },
];
const WEEKDAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

function describeDay(day) {
  const date = formatDayKey(day.dayKey, { weekday: 'short', month: 'short', day: 'numeric' });
  if (day.count === 0) return `${date}: nothing logged`;
  const done = FLOWS.filter((f) => day.flows[f.key]).map((f) => f.label);
  return `${date}: ${done.join(', ')}`;
}

/** One day = three stacked bars in fixed order, so identity never depends on color alone. */
function DayCell({ day, column }) {
  if (day.isFuture) return <Box w="100%" aspectRatio={1} />;
  return (
    <Tooltip label={describeDay(day)} placement="top" hasArrow openDelay={80}>
      <Flex
        direction="column"
        gap="1px"
        w="100%"
        aspectRatio={1}
        p="2px"
        bg="bg.muted"
        borderRadius="3px"
        tabIndex={0}
        aria-label={describeDay(day)}
        _hover={{ outline: '2px solid', outlineColor: 'fg.muted' }}
        _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500' }}
      >
        {FLOWS.map((flow) => (
          <MotionBox
            key={flow.key}
            flex="1"
            borderRadius="1px"
            bg={day.flows[flow.key] ? `${flow.key}.solid` : 'transparent'}
            style={{ originX: 0 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: DURATION.base, ease: EASE_OUT, delay: 0.2 + column * 0.04 }}
          />
        ))}
      </Flex>
    </Tooltip>
  );
}

function RhythmCard({ rhythm }) {
  const { columns, activeDays28, streak } = rhythm;
  const recentColumns = columns.slice(-12);

  return (
    <Card h="100%">
      <CardBody display="flex" flexDirection="column" gap={5}>
        <Flex justify="space-between" align="flex-start" gap={4} wrap="wrap">
          <Box>
            <Heading as="h2" size="md">Your rhythm</Heading>
            <Text fontSize="sm" color="fg.muted" mt={1} maxW="42ch">
              Consistency beats perfection. One missed day is a grace day; your streak only ends after two in a row.
            </Text>
          </Box>
          <HStack spacing={6} align="flex-end">
            <Box textAlign="right">
              <Text textStyle="figure" fontSize="4xl"><CountUp value={streak} /></Text>
              <Text fontSize="xs" color="fg.muted">day streak</Text>
            </Box>
            <Box textAlign="right">
              <Text textStyle="figure" fontSize="4xl">
                <CountUp value={activeDays28} /><Text as="span" fontSize="lg" color="fg.muted">/28</Text>
              </Text>
              <Text fontSize="xs" color="fg.muted">active days</Text>
            </Box>
          </HStack>
        </Flex>

        <Flex gap={2} role="group" aria-label="Last 12 weeks of logging">
          <Flex direction="column" gap={{ base: '3px', md: '5px' }} display={{ base: 'none', sm: 'flex' }}>
            {WEEKDAY_LABELS.map((label, i) => (
              <Flex key={i} flex="1" align="center" fontSize="10px" color="fg.muted" minH={0} aspectRatio={1} w="24px">
                {label}
              </Flex>
            ))}
          </Flex>
          <Box
            flex="1"
            display="grid"
            gridTemplateColumns={`repeat(${recentColumns.length}, minmax(0, 1fr))`}
            gap={{ base: '3px', md: '5px' }}
            maxW="640px"
          >
            {recentColumns.map((column, columnIndex) => (
              <Flex key={column[0].dayKey} direction="column" gap={{ base: '3px', md: '5px' }}>
                {column.map((day) => <DayCell key={day.dayKey} day={day} column={columnIndex} />)}
              </Flex>
            ))}
          </Box>
        </Flex>

        <HStack spacing={4} flexWrap="wrap" fontSize="xs" color="fg.muted">
          {FLOWS.map((flow, i) => (
            <HStack key={flow.key} spacing={1.5}>
              <Flex direction="column" gap="1px" w="10px">
                {FLOWS.map((f, j) => (
                  <Box key={f.key} h="3px" borderRadius="1px" bg={i === j ? `${flow.key}.solid` : 'bg.muted'} />
                ))}
              </Flex>
              <Text>{flow.label}: {flow.hint}</Text>
            </HStack>
          ))}
        </HStack>
        <VisuallyHidden>
          {`${streak}-day streak, ${activeDays28} of the last 28 days active.`}
        </VisuallyHidden>
      </CardBody>
    </Card>
  );
}

export default memo(RhythmCard);
