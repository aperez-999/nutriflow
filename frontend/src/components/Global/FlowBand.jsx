import { Box, Stack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { EASE_OUT } from '../Motion/tokens';

const MotionBox = motion(Box);

// Proportions of the logo mark: fuel, train, recover.
const BARS = [
  { flow: 'fuel', width: '100%' },
  { flow: 'train', width: '70%' },
  { flow: 'recover', width: '85%' },
];

/** The logo mark at billboard scale; the bars sweep in once on mount. */
export default function FlowBand({ barHeight = { base: '14px', md: '22px' }, gap = { base: 2, md: 3 }, delay = 0.35 }) {
  return (
    <Stack spacing={gap} aria-hidden="true">
      {BARS.map((bar, i) => (
        <MotionBox
          key={bar.flow}
          h={barHeight}
          w={bar.width}
          bg={`${bar.flow}.solid`}
          borderRadius="4px"
          style={{ originX: 0 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: delay + i * 0.12 }}
        />
      ))}
    </Stack>
  );
}
