import { Box, Button, Card, CardBody, Flex, Heading, Skeleton, Text, VStack } from '@chakra-ui/react';
import { ScoreRing } from '../Dashboard/components/CheckInForm';
import { LEVEL_LABEL } from '../Dashboard/components/verdict';

// Follow-up questions that fit each kind of day.
const QUESTIONS = {
  high: ['What should I train hard today?', 'How do I fuel a big session?'],
  moderate: ['What kind of session fits today?', 'What should I eat today?'],
  low: ['What does a good recovery day look like?', 'What helps me recover faster?'],
};

/**
 * Today's read: the verdict and readiness the coach answers from, with
 * one-tap questions that go straight into the conversation.
 */
export default function CoachContextCard({ readiness, hasCheckIn, isLoading, onAsk }) {
  const verdict = LEVEL_LABEL[readiness.level] || 'Steady day';
  const questions = [`Why is today a ${verdict.toLowerCase()}?`, ...(QUESTIONS[readiness.level] || QUESTIONS.moderate)];
  return (
    <Card>
      <CardBody>
        <Heading as="h2" size="sm">Today’s read</Heading>
        {isLoading ? (
          <Skeleton h="180px" mt={4} borderRadius="panel" />
        ) : (
          <>
            <Flex align="center" gap={4} mt={4}>
              <ScoreRing score={readiness.score} level={readiness.level} size={72} />
              <Box minW={0}>
                <Text fontFamily="heading" fontWeight="800" fontSize="3xl" lineHeight="1">{verdict}.</Text>
                <Text fontSize="sm" color="fg.muted" mt={1}>
                  Readiness {readiness.score} of 100{hasCheckIn ? '' : ', without a check-in today'}.
                </Text>
              </Box>
            </Flex>
            {readiness.shortRecommendation && <Text fontSize="sm" mt={3}>{readiness.shortRecommendation}</Text>}
            <VStack align="stretch" spacing={1} mt={4} pt={3} borderTopWidth="1px" borderColor="border">
              <Text fontSize="xs" color="fg.muted" mb={1}>Ask about today</Text>
              {questions.map((question) => (
                <Button
                  key={question}
                  variant="ghost"
                  size="sm"
                  justifyContent="space-between"
                  fontWeight="500"
                  px={2}
                  mx={-2}
                  rightIcon={<Text as="span" color="recover.fg" aria-hidden="true">→</Text>}
                  onClick={() => onAsk(question)}
                  whiteSpace="normal"
                  textAlign="left"
                  h="auto"
                  py={2}
                >
                  {question}
                </Button>
              ))}
            </VStack>
          </>
        )}
      </CardBody>
    </Card>
  );
}
