import {
  Box,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CountUp, SwapIn } from '../Motion';
import { DURATION, EASE_OUT } from '../Motion/tokens';
import { RatingScale } from '../Dashboard/components/CheckInForm';
import { LEVEL_FLOW, LEVEL_LABEL } from '../Dashboard/components/verdict';
import { FUEL_OPTIONS, YESTERDAY_OPTIONS } from './tryDay';

const MotionBox = motion(Box);

const BARS = [
  { flow: 'fuel', label: 'Fuel' },
  { flow: 'train', label: 'Training' },
  { flow: 'recover', label: 'Body' },
];

/** The answers a visitor can play with: last night, how they feel, yesterday. */
export function TryTodayControls({ answers, onChange }) {
  const set = (field) => (value) => onChange({ ...answers, [field]: value });
  return (
    <VStack align="stretch" spacing={5}>
      <Box>
        <Flex justify="space-between" mb={1}>
          <Text fontSize="sm" fontWeight="600" id="try-sleep-label">Sleep last night</Text>
          <Text fontSize="sm" fontWeight="700" color="recover.fg">{answers.sleepHours} h</Text>
        </Flex>
        <Slider
          aria-labelledby="try-sleep-label"
          min={4}
          max={10}
          step={0.5}
          value={answers.sleepHours}
          onChange={set('sleepHours')}
          focusThumbOnChange={false}
        >
          <SliderTrack bg="bg.muted"><SliderFilledTrack bg="recover.solid" /></SliderTrack>
          <SliderThumb boxSize={5} borderWidth="2px" borderColor="recover.solid" />
        </Slider>
      </Box>
      <RatingScale label="Energy" value={answers.energy} onChange={set('energy')} lowLabel="drained" highLabel="charged" />
      <RatingScale label="Soreness" value={answers.soreness} onChange={set('soreness')} lowLabel="none" highLabel="very sore" />
      <RatingScale label="Yesterday’s training" value={answers.yesterday} onChange={set('yesterday')} options={YESTERDAY_OPTIONS} />
      <RatingScale label="Eating this week" value={answers.fuel} onChange={set('fuel')} options={FUEL_OPTIONS} />
    </VStack>
  );
}

/** The live answer: today's verdict in its flow color, the score and the next step. */
export function TryTodayVerdict({ result }) {
  const flow = LEVEL_FLOW[result.level];
  return (
    <Box aria-live="polite">
      <Text fontSize={{ base: 'md', md: 'lg' }} color="fg.muted" fontWeight="500">Today is a</Text>
      <SwapIn key={result.level}>
        <Text
          fontFamily="heading"
          fontWeight="800"
          // Sized so the longest verdict ("Recovery day.") stays on one line: no jump when it changes.
          fontSize={{ base: '6xl', sm: '7xl', md: '8xl' }}
          lineHeight="0.85"
          whiteSpace="nowrap"
          color={`${flow}.solid`}
          mt={1}
        >
          {LEVEL_LABEL[result.level]}.
        </Text>
      </SwapIn>
      <Flex align="baseline" gap={3} mt={{ base: 4, md: 5 }}>
        <Text textStyle="figure" fontSize={{ base: '5xl', md: '6xl' }} lineHeight="1"><CountUp value={result.score} duration={0.5} /></Text>
        <Text color="fg.muted">readiness out of 100</Text>
      </Flex>
      <Text fontSize={{ base: 'md', md: 'lg' }} mt={2} maxW="44ch">{result.next}</Text>
    </Box>
  );
}

/** The billboard bars, sized by what each flow contributes to today's score. */
export function TryTodayBars({ result }) {
  return (
    <Stack spacing={{ base: 2, md: 3 }}>
      {BARS.map((bar) => {
        const share = Math.max(result.parts[bar.flow], 0.06);
        return (
          <Flex key={bar.flow} align="center" gap={3}>
            <Box flex="1" h={{ base: '14px', md: '22px' }} aria-hidden="true">
              <MotionBox
                h="100%"
                bg={`${bar.flow}.solid`}
                borderRadius="4px"
                style={{ originX: 0 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: share }}
                transition={{ duration: DURATION.slow, ease: EASE_OUT }}
              />
            </Box>
            <Text fontSize="sm" color="fg.muted" w={{ base: '96px', md: '120px' }} flexShrink={0}>
              {bar.label} <Text as="span" fontWeight="700" color="fg">{Math.round(result.parts[bar.flow] * 100)}%</Text>
            </Text>
          </Flex>
        );
      })}
    </Stack>
  );
}

/** Phones: the verdict sits above the controls, so repeat it compactly under them. */
export function TryTodaySummary({ result }) {
  const flow = LEVEL_FLOW[result.level];
  return (
    <Flex display={{ base: 'flex', lg: 'none' }} justify="space-between" align="baseline" mt={5} pt={4} borderTopWidth="1px" borderColor="border" aria-hidden="true">
      <Text fontFamily="heading" fontWeight="800" fontSize="3xl" lineHeight="1" color={`${flow}.solid`}>{LEVEL_LABEL[result.level]}.</Text>
      <Text textStyle="figure" fontSize="3xl" lineHeight="1">{result.score}</Text>
    </Flex>
  );
}
