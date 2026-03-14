import React from 'react';
import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const dotVariants = {
  pulse: (i) => ({
    opacity: [0.3, 1, 0.3],
    scale: [0.8, 1, 0.8],
    transition: {
      duration: 1.4,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: i * 0.2,
    },
  }),
};

/**
 * Animated dots for typing indicator (Framer Motion).
 * Aligns with parent text when used in a flex row with spinner + message.
 */
export default function TypingDots() {
  return (
    <Box as="span" display="inline-flex" gap="2px" ml="2px" alignItems="center" alignSelf="center">
      {[0, 1, 2].map((i) => (
        <Box
          as={motion.span}
          key={i}
          w="4px"
          h="4px"
          borderRadius="full"
          bg="currentColor"
          variants={dotVariants}
          initial="pulse"
          animate="pulse"
          custom={i}
        />
      ))}
    </Box>
  );
}
