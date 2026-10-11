import { Box, Grid, Heading, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { LogoMark } from '../../../Global/Logo';
import { DURATION, EASE_OUT } from '../../../Motion/tokens';
import { PROMPT_CARDS } from '../constants';

const MotionBox = motion(Box);

/** A fresh conversation: four starting points instead of an empty transcript. */
export default function ChatEmptyState({ intro, onPick, isDisabled }) {
  return (
    <Box maxW="640px" mx="auto" py={{ base: 2, md: 6 }}>
      <LogoMark size={36} />
      <Heading as="h2" fontSize={{ base: '4xl', md: '5xl' }} lineHeight="0.95" mt={4}>
        What should we work on?
      </Heading>
      <Text color="fg.muted" mt={3} fontSize={{ base: 'sm', md: 'md' }}>{intro}</Text>
      <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={3} mt={6}>
        {PROMPT_CARDS.map((card, i) => (
          <MotionBox
            key={card.action}
            as="button"
            type="button"
            onClick={() => onPick(card.action)}
            disabled={isDisabled}
            textAlign="left"
            p={4}
            borderRadius="panel"
            bg={card.flow ? `${card.flow}.subtle` : 'bg.surface'}
            borderWidth={card.flow ? 0 : '1px'}
            borderColor="border"
            _hover={{ boxShadow: '0 0 0 1px var(--chakra-colors-border-strong)' }}
            _focusVisible={{ outline: 'none', boxShadow: '0 0 0 2px var(--chakra-colors-focus-ring)' }}
            _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.base, ease: EASE_OUT, delay: 0.05 + i * 0.05 }}
          >
            <Text fontWeight="700" color={card.flow ? `${card.flow}.fg` : 'fg'}>{card.title}</Text>
            <Text fontSize="sm" color="fg.muted" mt={1}>{card.detail}</Text>
          </MotionBox>
        ))}
      </Grid>
    </Box>
  );
}
