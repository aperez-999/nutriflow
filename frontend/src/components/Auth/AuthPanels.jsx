import { Box, Text, VStack } from '@chakra-ui/react';
import FlowBand from '../Global/FlowBand';
import { LEVEL_FLOW, LEVEL_LABEL } from '../Dashboard/components/verdict';
import VerdictCarousel from './VerdictCarousel';

// The brand side of the auth screens says something different for each visit:
// coming back, starting out, or locked out.

function PanelFooter({ children }) {
  return (
    <Box>
      <FlowBand delay={0.15} barHeight="10px" gap={2} />
      <Text color="fg.muted" mt={5} maxW="40ch">{children}</Text>
    </Box>
  );
}

/** Returning: today's verdict is already waiting. */
export function LoginPanel() {
  return (
    <>
      <VerdictCarousel intro="Your verdict for today is waiting:" />
      <PanelFooter>Your streak, plans and coach are right where you left them.</PanelFooter>
    </>
  );
}

const FIRST_DAY = [
  { flow: 'recover', when: 'Today', text: 'Set your targets and log anything you’ve eaten or trained.' },
  { flow: 'fuel', when: 'Tonight', text: 'Ask the coach for a training week. It lands in your Library.' },
  { flow: 'train', when: 'Tomorrow morning', text: 'A twenty-second check-in, and your first real verdict.' },
];

/** Starting out: what the first day looks like, and the demo result if they just tried it. */
export function RegisterPanel({ demo }) {
  const flow = demo && LEVEL_FLOW[demo.level];
  return (
    <>
      <Box>
        {demo && flow ? (
          <Text fontSize="lg" maxW="36ch">
            You tried it:{' '}
            <Text as="span" fontWeight="800" color={`${flow}.fg`}>{LEVEL_LABEL[demo.level]}, {demo.score}</Text>.
            {' '}Tomorrow it runs on your own data.
          </Text>
        ) : (
          <Text fontSize="sm" fontWeight="600" color="fg.muted">Your first day with NutriFlow</Text>
        )}
        <VStack as="ol" listStyleType="none" align="stretch" spacing={0} mt={8}>
          {FIRST_DAY.map((step, i) => (
            <Box as="li" key={step.when} py={5} borderTopWidth={i ? '1px' : '3px'} borderColor={i ? 'border' : 'border.strong'}>
              <Text fontFamily="heading" fontWeight="800" fontSize={{ lg: '3xl', xl: '4xl' }} lineHeight="1" color={`${step.flow}.fg`}>
                {step.when}
              </Text>
              <Text fontSize="lg" mt={2} maxW="36ch">{step.text}</Text>
            </Box>
          ))}
        </VStack>
      </Box>
      <PanelFooter>Free, no wearable needed, and only you can see your log.</PanelFooter>
    </>
  );
}

/** Locked out: calm, and a reminder that nothing is lost. */
export function PasswordPanel() {
  return (
    <>
      <Box>
        <Text fontFamily="heading" fontWeight="800" fontSize={{ lg: '7xl', xl: '8xl' }} lineHeight="0.88">It happens.</Text>
        <Text fontSize="lg" mt={5} maxW="36ch">
          Reset your password and you’re back in a minute. Your log, plans and streak are safe.
        </Text>
      </Box>
      <PanelFooter>One readiness score from what you ate, how you trained and how you slept.</PanelFooter>
    </>
  );
}
