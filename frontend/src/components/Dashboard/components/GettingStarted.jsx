import { useState } from 'react';
import { Box, Button, Flex, Grid, Heading, Icon, Text } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

const storageKey = (userId) => `nutriflow.onboarding.dismissed.${userId}`;

const readDismissed = (userId) => {
  try {
    return window.localStorage.getItem(storageKey(userId)) === '1';
  } catch {
    return false;
  }
};

/**
 * First-run guide: four steps that tick themselves off as the user does them.
 * Hidden once everything is done, or when the user dismisses it (remembered per account).
 */
export default function GettingStarted({ userId, steps, onAction }) {
  const [dismissed, setDismissed] = useState(() => readDismissed(userId));
  const doneCount = steps.filter((step) => step.done).length;
  if (dismissed || doneCount === steps.length) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(storageKey(userId), '1');
    } catch {
      // Storage can be unavailable (private mode); hiding for this visit is enough.
    }
  };

  return (
    <Box as="section" aria-label="Getting started" borderWidth="2px" borderColor="border.strong" borderRadius="panel" p={{ base: 4, md: 5 }}>
      <Flex justify="space-between" align="baseline" gap={3} wrap="wrap">
        <Box>
          <Heading as="h2" size="md">Start here</Heading>
          <Text fontSize="sm" color="fg.muted" mt={1}>
            Four steps to a readiness score that knows you. {doneCount} of {steps.length} done.
          </Text>
        </Box>
        <Button size="sm" variant="ghost" onClick={dismiss}>Hide guide</Button>
      </Flex>
      <Grid as="ol" listStyleType="none" templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={{ base: 2, md: 3 }} mt={4}>
        {steps.map((step, i) => (
          <Flex
            as="li"
            key={step.key}
            align="center"
            gap={3}
            p={3}
            borderRadius="control"
            bg={step.done ? `${step.flow}.subtle` : 'bg.muted'}
          >
            <Flex
              boxSize="28px"
              flexShrink={0}
              borderRadius="full"
              align="center"
              justify="center"
              bg={step.done ? `${step.flow}.solid` : 'bg.surface'}
              color={step.done ? 'white' : 'fg'}
              fontWeight="700"
              fontSize="sm"
              aria-hidden="true"
            >
              {step.done ? <Icon as={FiCheck} /> : i + 1}
            </Flex>
            <Box minW={0} flex="1">
              <Text fontSize="sm" fontWeight="700" textDecoration={step.done ? 'line-through' : 'none'} color={step.done ? 'fg.muted' : 'fg'}>
                {step.label}
                {step.done && <Text as="span" srOnly> (done)</Text>}
              </Text>
            </Box>
            {!step.done && (
              step.to
                ? <Button as={RouterLink} to={step.to} size="xs" variant="outline">Go</Button>
                : <Button size="xs" variant="outline" onClick={() => onAction(step.key)}>Start</Button>
            )}
          </Flex>
        ))}
      </Grid>
    </Box>
  );
}
