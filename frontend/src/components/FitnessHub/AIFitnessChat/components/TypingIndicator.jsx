import { Box, HStack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const BARS = [
  { flow: 'fuel', width: 20 },
  { flow: 'train', width: 14 },
  { flow: 'recover', width: 17 },
];

/**
 * The coach's "thinking" state: the logo's three flow bars filling in turn,
 * so waiting on an answer looks like the product rather than a generic spinner.
 */
export default function TypingIndicator({ label }) {
  return (
    <HStack spacing={3} color="fg.muted" fontSize="sm" role="status">
      <Box display="flex" flexDirection="column" gap="3px" w="22px" aria-hidden="true">
        {BARS.map((bar, i) => (
          <Box
            key={bar.flow}
            as={motion.span}
            display="block"
            h="5px"
            w={`${bar.width}px`}
            borderRadius="1.5px"
            bg={`${bar.flow}.solid`}
            style={{ originX: 0 }}
            animate={{ scaleX: [0.25, 1, 0.25] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
          />
        ))}
      </Box>
      <Text>{label}</Text>
    </HStack>
  );
}
