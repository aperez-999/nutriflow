import { Box, Button, Flex, HStack, IconButton, Text } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { formatDayKey, getTodayDayKey, shiftDayKey } from '../../../utils/dateUtils';

/**
 * A day's totals laid out like a Nutrition Facts label: a heavy rule under the
 * title, one headline figure, then right-aligned rows separated by hairlines.
 */
function DaySummaryLabel({ title, flow, selectedDate, setSelectedDate, headline, rows }) {
  const today = getTodayDayKey();
  const isToday = selectedDate === today;

  return (
    <Box bg="bg.surface" borderWidth="1px" borderColor="border" borderRadius="panel" px={5} pt={4} pb={2}>
      <Flex justify="space-between" align="center" gap={3}>
        <Text fontWeight="800" fontSize="xl" letterSpacing="-0.02em">{title}</Text>
        <HStack spacing={1}>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Previous day"
            icon={<ChevronLeftIcon boxSize={5} />}
            onClick={() => setSelectedDate(shiftDayKey(selectedDate, -1))}
          />
          <Text fontSize="sm" fontWeight="600" minW="92px" textAlign="center" aria-live="polite">
            {isToday ? 'Today' : formatDayKey(selectedDate, { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Next day"
            icon={<ChevronRightIcon boxSize={5} />}
            isDisabled={isToday}
            onClick={() => setSelectedDate(shiftDayKey(selectedDate, 1))}
          />
          {!isToday && (
            <Button size="sm" variant="outline" onClick={() => setSelectedDate(today)}>Today</Button>
          )}
        </HStack>
      </Flex>

      <Box h="6px" bg="border.strong" mt={3} />

      <Flex justify="space-between" align="baseline" py={3} borderBottomWidth="3px" borderColor="border.strong">
        <Text fontWeight="800" fontSize="lg">{headline.label}</Text>
        <Text textStyle="figure" fontSize="5xl" color={`${flow}.fg`}>
          {headline.value.toLocaleString()}
          {headline.unit && <Text as="span" fontSize="lg" color="fg.muted" ml={1} fontWeight={600}>{headline.unit}</Text>}
        </Text>
      </Flex>

      {rows.map((row, i) => (
        <Flex
          key={row.label}
          justify="space-between"
          align="baseline"
          py={2}
          borderBottomWidth={i === rows.length - 1 ? 0 : '1px'}
          borderColor="border"
        >
          <Text fontSize="sm" fontWeight={i === 0 ? 700 : 500}>{row.label}</Text>
          <Text fontSize="sm" fontWeight="700" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {row.value.toLocaleString()}
            {row.unit && <Text as="span" color="fg.muted" fontWeight="500"> {row.unit}</Text>}
          </Text>
        </Flex>
      ))}
    </Box>
  );
}

export default DaySummaryLabel;
