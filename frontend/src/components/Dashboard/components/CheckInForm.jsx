import { memo, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { LEVEL_LABEL } from './verdict';
import { motion } from 'framer-motion';
import { CountUp } from '../../Motion';
import { EASE_OUT } from '../../Motion/tokens';

const DEFAULT_CHECK_IN = { sleepHours: 7, energy: 3, soreness: 2, waterCups: 4 };
const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ScoreRing({ score, level, size = 128 }) {
  const offset = RING_CIRCUMFERENCE * (1 - Math.min(Math.max(score, 0), 100) / 100);
  return (
    <Box position="relative" w={`${size}px`} h={`${size}px`} flexShrink={0}>
      <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden="true">
        <circle cx="64" cy="64" r={RING_RADIUS} fill="none" stroke="var(--chakra-colors-bg-muted)" strokeWidth="10" />
        {/* The ring draws from empty to the score on mount and when the score changes. */}
        <motion.circle
          cx="64"
          cy="64"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--chakra-colors-recover-solid)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: EASE_OUT }}
          transform="rotate(-90 64 64)"
        />
      </svg>
      <Flex position="absolute" inset={0} direction="column" align="center" justify="center">
        <Text textStyle="figure" fontSize={size >= 120 ? '5xl' : '4xl'}><CountUp value={score} duration={1} /></Text>
        {/* Small rings sit beside the verdict headline, so they show the number only. */}
        {size >= 120 && <Text fontSize="xs" color="fg.muted">{LEVEL_LABEL[level] || 'Readiness'}</Text>}
      </Flex>
    </Box>
  );
}

/** Five-step rating as a segmented control (radio semantics). */
function RatingScale({ label, value, onChange, lowLabel, highLabel }) {
  return (
    <Box role="radiogroup" aria-label={label}>
      <Flex justify="space-between" mb={1.5}>
        <Text fontSize="sm" fontWeight="600">{label}</Text>
        <Text fontSize="xs" color="fg.muted">{lowLabel} → {highLabel}</Text>
      </Flex>
      <ButtonGroup isAttached size="sm" w="100%" variant="outline">
        {[1, 2, 3, 4, 5].map((n) => (
          <Button
            key={n}
            flex="1"
            role="radio"
            aria-checked={value === n}
            aria-label={`${label} ${n} of 5`}
            onClick={() => onChange(n)}
            borderColor="border"
            bg={value === n ? 'recover.subtle' : 'bg.surface'}
            color={value === n ? 'recover.fg' : 'fg.muted'}
            fontWeight={value === n ? 700 : 500}
            _hover={{ bg: 'recover.subtle', transform: 'none' }}
          >
            {n}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
}

/**
 * The daily check-in (sleep, energy, soreness, water). Lives in a quick panel;
 * `onSave` resolves true when stored so the panel can close.
 */
function CheckInForm({ checkIn, onSave, isSaving }) {
  const [draft, setDraft] = useState(checkIn || DEFAULT_CHECK_IN);
  const update = (field) => (value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      sleepHours: draft.sleepHours,
      energy: draft.energy,
      soreness: draft.soreness,
      waterCups: draft.waterCups,
    });
  };

  return (
    <VStack align="stretch" spacing={5} as="form" onSubmit={handleSubmit}>
      <Box>
        <Flex justify="space-between" mb={1}>
          <Text fontSize="sm" fontWeight="600" id="sleep-label">Sleep last night</Text>
          <Text fontSize="sm" fontWeight="700" color="recover.fg">{draft.sleepHours} h</Text>
        </Flex>
        <Slider
          aria-labelledby="sleep-label"
          min={3}
          max={12}
          step={0.5}
          value={draft.sleepHours}
          onChange={update('sleepHours')}
          focusThumbOnChange={false}
        >
          <SliderTrack bg="bg.muted"><SliderFilledTrack bg="recover.solid" /></SliderTrack>
          <SliderThumb boxSize={5} borderWidth="2px" borderColor="recover.solid" />
        </Slider>
      </Box>
      <RatingScale label="Energy" value={draft.energy} onChange={update('energy')} lowLabel="drained" highLabel="charged" />
      <RatingScale label="Soreness" value={draft.soreness} onChange={update('soreness')} lowLabel="none" highLabel="very sore" />
      <Flex justify="space-between" align="center">
        <Text fontSize="sm" fontWeight="600">Water so far</Text>
        <HStack>
          <IconButton
            size="sm"
            variant="outline"
            aria-label="One less cup of water"
            icon={<FiMinus />}
            isDisabled={draft.waterCups <= 0}
            onClick={() => update('waterCups')(draft.waterCups - 1)}
          />
          <Text minW="64px" textAlign="center" fontWeight="700" aria-live="polite">{draft.waterCups} cups</Text>
          <IconButton
            size="sm"
            variant="outline"
            aria-label="One more cup of water"
            icon={<FiPlus />}
            isDisabled={draft.waterCups >= 20}
            onClick={() => update('waterCups')(draft.waterCups + 1)}
          />
        </HStack>
      </Flex>
      <Button type="submit" isLoading={isSaving}>
        {checkIn ? 'Update check-in' : 'Save check-in'}
      </Button>
    </VStack>
  );
}

export { ScoreRing };
export default memo(CheckInForm);
