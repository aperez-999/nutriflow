import {
  Box,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FiTrendingUp, FiActivity, FiZap } from 'react-icons/fi';

const INSIGHT_CONFIG = [
  { key: 'training', title: 'Training Insight', icon: FiActivity, color: 'blue.500' },
  { key: 'nutrition', title: 'Nutrition Insight', icon: FiZap, color: 'teal.500' },
  { key: 'consistency', title: 'Consistency Insight', icon: FiTrendingUp, color: 'orange.500' },
];

const cardStyles = {
  borderRadius: 'xl',
  boxShadow: 'sm',
  borderWidth: '1px',
  _hover: {
    transform: 'translateY(-2px)',
    boxShadow: 'lg',
  },
  transition: 'all 0.2s ease',
};

export default function AIInsightsSection({ insights = [] }) {
  const cardBg = 'bg.surface';
  const borderColor = 'border';
  const textColor = 'fg';
  const subColor = 'fg.muted';
  const sectionBg = 'bg.muted';

  if (!insights || insights.length === 0) {
    return (
      <Box>
        <Text fontSize="sm" fontWeight="600" color={textColor} letterSpacing="wider" mb={3}>
          AI INSIGHTS
        </Text>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} {...cardStyles}>
          <CardBody>
            <VStack py={10} spacing={4} align="center" justify="center" textAlign="center" minH="240px">
              <Icon as={FiActivity} boxSize={10} color={subColor} />
              <VStack spacing={2} maxW="320px">
                <Text fontSize="md" fontWeight="600" color={textColor}>
                  Insights will appear here
                </Text>
                <Text color={subColor} fontSize="sm" lineHeight="1.7">
                  Log workouts or meals to receive AI-generated insights.
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="600" color={textColor} letterSpacing="wider" mb={3}>
        AI INSIGHTS
      </Text>
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} {...cardStyles}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {insights.map((insight, index) => {
              const config = INSIGHT_CONFIG.find((c) => c.key === insight.type) || INSIGHT_CONFIG[index % INSIGHT_CONFIG.length];
              return (
                <Box
                  key={insight.id || index}
                  p={4}
                  bg={sectionBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                >
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={3} align="center">
                      <Icon as={config.icon} boxSize={4} color={config.color} />
                      <Text fontSize="sm" fontWeight="600" color={textColor}>
                        {insight.title || config.title}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={subColor} lineHeight="1.7">
                      {insight.content}
                    </Text>
                  </VStack>
                </Box>
              );
            })}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
