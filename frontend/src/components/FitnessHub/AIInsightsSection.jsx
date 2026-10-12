import { Box, Button, Card, CardBody, Flex, Heading, Text } from '@chakra-ui/react';

// Each insight is keyed to the flow it describes; consistency spans all three.
const INSIGHT_FLOW = { training: 'train', nutrition: 'fuel' };

export default function AIInsightsSection({ insights = [], onAsk }) {
  return (
    <Card>
      <CardBody py={4}>
        <Heading as="h2" size="sm">From your log</Heading>
        {!insights || insights.length === 0 ? (
          <Text fontSize="sm" color="fg.muted" mt={2}>
            Log a few meals or workouts and patterns from your week will show up here.
          </Text>
        ) : (
          insights.map((insight, index) => {
            const flow = INSIGHT_FLOW[insight.type];
            return (
              <Box key={insight.id || index} py={3} borderBottomWidth="1px" borderColor="border" _last={{ borderBottomWidth: 0, pb: 0 }}>
                <Flex align="center" gap={2}>
                  <Box boxSize="8px" borderRadius="2px" bg={flow ? `${flow}.solid` : 'fg'} aria-hidden="true" />
                  <Text fontSize="sm" fontWeight="700">{insight.title}</Text>
                </Flex>
                <Text fontSize="sm" color="fg.muted" mt={1}>{insight.content}</Text>
                {onAsk && (
                  <Button variant="link" size="sm" mt={2} color="fg" fontWeight="600" onClick={() => onAsk(`Tell me more about my ${insight.title.toLowerCase()}. What should I change?`)}>
                    Ask about this
                  </Button>
                )}
              </Box>
            );
          })
        )}
      </CardBody>
    </Card>
  );
}
