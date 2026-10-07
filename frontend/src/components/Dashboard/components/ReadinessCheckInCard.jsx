import { memo, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Flex,
  HStack,
  Heading,
  IconButton,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FiMinus, FiPlus } from 'react-icons/fi';

const LEVEL_LABEL = { high: 'Ready to push', moderate: 'Steady day', low: 'Recovery day' };
const DEFAULT_CHECK_IN = { sleepHours: 7, energy: 3, soreness: 2, waterCups: 4 };
const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ScoreRing({ score, level }) {
  const offset = RING_CIRCUMFERENCE * (1 - Math.min(Math.max(score, 0), 100) / 100);
  return (
    <Box position="relative" w="128px" h="128px" flexShrink={0}>
      <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden="true">
        <circle cx="64" cy="64" r={RING_RADIUS} fill="none" stroke="var(--chakra-colors-bg-muted)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--chakra-colors-recover-solid)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <Flex position="absolute" inset={0} direction="column" align="center" justify="center">
        <Text textStyle="figure" fontSize="5xl">{score}</Text>
        <Text fontSize="xs" color="fg.muted">{LEVEL_LABEL[level] || 'Readiness'}</Text>
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

function CheckInSummary({ checkIn, onEdit }) {
  const items = [
    ['Sleep', `${checkIn.sleepHours} h`],
    ['Energy', `${checkIn.energy}/5`],
    ['Soreness', `${checkIn.soreness}/5`],
    ['Water', `${checkIn.waterCups} cups`],
  ];
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontSize="sm" fontWeight="600">Today&apos;s check-in</Text>
        <Button size="xs" variant="outline" onClick={onEdit}>Edit</Button>
      </Flex>
      <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2}>
        {items.map(([label, value]) => (
          <Box key={label} bg="bg.muted" borderRadius="control" px={2.5} py={2}>
            <Text fontSize="xs" color="fg.muted">{label}</Text>
            <Text fontSize="sm" fontWeight="700">{value}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// Parent re-keys this card when the saved check-in changes, which resets the draft.
function ReadinessCheckInCard({ readiness, checkIn, onSaveCheckIn, isSaving }) {
  const [draft, setDraft] = useState(checkIn || DEFAULT_CHECK_IN);
  const [isEditing, setIsEditing] = useState(!checkIn);

  const update = (field) => (value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const saved = await onSaveCheckIn({
      sleepHours: draft.sleepHours,
      energy: draft.energy,
      soreness: draft.soreness,
      waterCups: draft.waterCups,
    });
    if (saved) setIsEditing(false);
  };

  return (
    <Card h="100%">
      <CardBody display="flex" flexDirection="column" gap={5}>
        <Flex gap={5} align="center">
          <ScoreRing score={readiness.score} level={readiness.level} />
          <Box minW={0}>
            <Heading as="h2" size="md">Readiness</Heading>
            <Text fontSize="sm" mt={1.5}>{readiness.shortRecommendation}</Text>
            {readiness.factors.bodyScore === null && (
              <Text fontSize="xs" color="fg.muted" mt={2}>
                Based on your logs only. Check in below to factor in how you actually feel.
              </Text>
            )}
          </Box>
        </Flex>

        {isEditing ? (
          <VStack align="stretch" spacing={4} as="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
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
            <HStack>
              <Button type="submit" isLoading={isSaving} flex="1">
                {checkIn ? 'Update check-in' : 'Save check-in'}
              </Button>
              {checkIn && <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>}
            </HStack>
          </VStack>
        ) : (
          <CheckInSummary checkIn={checkIn} onEdit={() => setIsEditing(true)} />
        )}
      </CardBody>
    </Card>
  );
}

export default memo(ReadinessCheckInCard);
