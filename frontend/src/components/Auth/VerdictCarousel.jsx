import { useEffect, useState } from 'react';
import { Box, Button, Flex, HStack, IconButton, Text } from '@chakra-ui/react';
import { FiPause, FiPlay } from 'react-icons/fi';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT } from '../Motion/tokens';

const MotionBox = motion(Box);
const INTERVAL_MS = 4200;

// The three daily verdicts NutriFlow gives, each with the kind of note that comes with it.
const VERDICTS = [
  { flow: 'train', title: 'Push day.', note: 'Slept well and fueled well. Go after the main lift.' },
  { flow: 'fuel', title: 'Steady day.', note: 'Good, not great. Quality reps, and leave a little in reserve.' },
  { flow: 'recover', title: 'Recovery day.', note: 'Short sleep, sore legs. Walk, stretch and eat well. Tomorrow counts more.' },
];

/**
 * Idle animation for the sign-in screens: cycles through the daily verdicts.
 * Has a pause control, and does not rotate on its own under reduced motion.
 */
export default function VerdictCarousel({ intro = 'Every morning, NutriFlow tells you:' }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const autoplay = !reduceMotion && !paused;

  useEffect(() => {
    if (!autoplay) return undefined;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % VERDICTS.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoplay]);

  const verdict = VERDICTS[index];

  return (
    <Box>
      <Text fontSize="sm" fontWeight="600" color="fg.muted">{intro}</Text>
      <Box position="relative" overflow="hidden" mt={3} minH={{ lg: '260px', xl: '300px' }}>
        <AnimatePresence mode="wait" initial={false}>
          <MotionBox
            key={verdict.title}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <Text
              as="p"
              fontFamily="heading"
              fontWeight="800"
              fontSize={{ lg: '7xl', xl: '8xl' }}
              lineHeight="0.88"
              color={`${verdict.flow}.fg`}
            >
              {verdict.title}
            </Text>
            <Box h="10px" w="64%" bg={`${verdict.flow}.solid`} borderRadius="3px" mt={5} />
            <Text fontSize="lg" mt={5} maxW="36ch">{verdict.note}</Text>
          </MotionBox>
        </AnimatePresence>
      </Box>
      <Flex align="center" gap={3} mt={6}>
        <HStack spacing={1.5} role="group" aria-label="Choose a verdict">
          {VERDICTS.map((v, i) => (
            <Button
              key={v.title}
              size="xs"
              variant="unstyled"
              minW="28px"
              h="20px"
              display="flex"
              alignItems="center"
              onClick={() => { setIndex(i); setPaused(true); }}
              aria-label={`Show ${v.title}`}
              aria-pressed={i === index}
            >
              <Box h="6px" w="100%" borderRadius="full" bg={i === index ? `${v.flow}.solid` : 'border'} transition="background-color 0.2s ease" />
            </Button>
          ))}
        </HStack>
        {!reduceMotion && (
          <IconButton
            size="xs"
            variant="ghost"
            aria-label={paused ? 'Play' : 'Pause'}
            icon={paused ? <FiPlay /> : <FiPause />}
            onClick={() => setPaused((p) => !p)}
          />
        )}
      </Flex>
    </Box>
  );
}
