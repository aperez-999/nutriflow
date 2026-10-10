import { useState } from 'react';
import { Box, Button, Flex, Grid, Heading, HStack, Icon, Text } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { isGuideHidden, setGuideHidden } from '../utils/onboarding';
import { DURATION, EASE_OUT } from '../../Motion/tokens';

const MotionBox = motion(Box);

// What each step does, and where it lives in the app once the guide is gone.
const STEP_COPY = {
  checkin: {
    what: 'Four quick questions about sleep, energy, soreness and water. It makes today’s readiness score yours.',
    where: 'Any time: the Check in button at the top of Today.',
  },
  meal: {
    what: 'Search a food and the numbers fill in for you. Your Fuel tile starts counting.',
    where: 'Any time: Log meal, at the top of Today.',
  },
  workout: {
    what: 'Pick an exercise or type your own. It counts toward this week’s training.',
    where: 'Any time: Log workout, at the top of Today.',
  },
  coach: {
    what: 'Ask anything, or tap “Plan my training week”. Plans you get are saved to your Library.',
    where: 'Coach, in the main menu.',
  },
};

/** Scrolls to the real control for a step and briefly rings it, so the user learns where it lives. */
const spotlight = (key) => {
  const target = [...document.querySelectorAll(`[data-guide="${key}"]`)].find((el) => el.offsetParent !== null);
  if (!target) return;
  target.scrollIntoView({ block: 'center' });
  target.focus({ preventScroll: true });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  target.animate(
    [
      { boxShadow: '0 0 0 0 rgba(60, 95, 217, 0.0)' },
      { boxShadow: '0 0 0 6px rgba(60, 95, 217, 0.45)' },
      { boxShadow: '0 0 0 0 rgba(60, 95, 217, 0.0)' },
    ],
    { duration: 900, iterations: 3, easing: 'ease-out' }
  );
};

/**
 * First-run guide. Shows one step at a time with what it does and where to find it,
 * ticks steps off as the user does them, and can be hidden (remembered per account).
 */
export default function GettingStarted({ userId, steps, onAction }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => isGuideHidden(userId));
  const doneCount = steps.filter((step) => step.done).length;
  const current = steps.find((step) => !step.done);
  if (dismissed || !current) return null;

  const currentIndex = steps.indexOf(current);
  const copy = STEP_COPY[current.key] || {};
  const dismiss = () => {
    setDismissed(true);
    setGuideHidden(userId, true);
  };
  const start = () => (current.to ? navigate(current.to) : onAction(current.key));

  return (
    <Box as="section" aria-label="Getting started" borderWidth="2px" borderColor="border.strong" borderRadius="panel" p={{ base: 4, md: 6 }}>
      <Flex justify="space-between" align="center" gap={3}>
        <Box>
          <Heading as="h2" size="md">Start here</Heading>
          <Text fontSize="sm" color="fg.muted" mt={1}>{doneCount} of {steps.length} done</Text>
        </Box>
        <Button size="sm" variant="ghost" onClick={dismiss}>Hide guide</Button>
      </Flex>

      {/* Progress: one segment per step, filled in its flow color when done. */}
      <Grid templateColumns={`repeat(${steps.length}, 1fr)`} gap={1.5} mt={4} aria-hidden="true">
        {steps.map((step) => (
          <Box
            key={step.key}
            h="6px"
            borderRadius="full"
            bg={step.done ? `${step.flow}.solid` : step === current ? 'fg' : 'bg.muted'}
            transition={`background-color ${DURATION.base}s ease`}
          />
        ))}
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '1.4fr 1fr' }} gap={{ base: 5, lg: 8 }} mt={5}>
        <AnimatePresence mode="wait" initial={false}>
          <MotionBox
            key={current.key}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: DURATION.base, ease: EASE_OUT }}
          >
            <HStack spacing={3} align="baseline">
              <Text textStyle="figure" fontSize="5xl" color={`${current.flow}.fg`} aria-hidden="true">{currentIndex + 1}</Text>
              <Heading as="h3" fontSize={{ base: '3xl', md: '4xl' }}>{current.label}</Heading>
            </HStack>
            <Text mt={2} maxW="56ch">{copy.what}</Text>
            <Text fontSize="sm" color="fg.muted" mt={1}>{copy.where}</Text>
            <HStack spacing={2} mt={4} flexWrap="wrap">
              <Button onClick={start}>Do it now</Button>
              <Button variant="outline" onClick={() => spotlight(current.key)}>Show me where</Button>
            </HStack>
          </MotionBox>
        </AnimatePresence>

        <Box as="ol" listStyleType="none" alignSelf="start">
          {steps.map((step, i) => (
            <Flex
              as="li"
              key={step.key}
              align="center"
              gap={3}
              py={2}
              borderTopWidth={i === 0 ? 0 : '1px'}
              borderColor="border"
              aria-current={step === current ? 'step' : undefined}
            >
              <Flex
                boxSize="24px"
                flexShrink={0}
                borderRadius="full"
                align="center"
                justify="center"
                fontSize="xs"
                fontWeight="700"
                bg={step.done ? `${step.flow}.solid` : step === current ? 'fg' : 'bg.muted'}
                color={step.done || step === current ? 'bg.surface' : 'fg.muted'}
                aria-hidden="true"
              >
                {step.done ? <Icon as={FiCheck} /> : i + 1}
              </Flex>
              <Text fontSize="sm" fontWeight={step === current ? 700 : 500} color={step.done ? 'fg.muted' : 'fg'}>
                {step.label}
                {step.done && <Text as="span" srOnly> (done)</Text>}
              </Text>
            </Flex>
          ))}
        </Box>
      </Grid>
    </Box>
  );
}
