import React from 'react';
import {
  Box,
  Card,
  CardBody,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
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

/**
 * AI Insights section: shows insight cards or empty state.
 * insights: array of { type: 'training'|'nutrition'|'consistency', title?, content } (optional).
 */
export default function AIInsightsSection({ insights = [] }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');

  if (!insights || insights.length === 0) {
    return (
      <Box mt={8}>
        <Text fontSize="sm" fontWeight="600" color={textColor} letterSpacing="wider" mb={3}>
          AI INSIGHTS
        </Text>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} {...cardStyles}>
          <CardBody>
            <VStack py={8} spacing={2} align="center" justify="center">
              <Icon as={FiActivity} boxSize={10} color={subColor} />
              <Text color={subColor} textAlign="center" fontSize="sm" maxW="320px">
                Log workouts or meals to receive AI-generated insights.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box mt={8}>
      <Text fontSize="sm" fontWeight="600" color={textColor} letterSpacing="wider" mb={3}>
        AI INSIGHTS
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {insights.map((insight, index) => {
          const config = INSIGHT_CONFIG.find((c) => c.key === insight.type) || INSIGHT_CONFIG[index % INSIGHT_CONFIG.length];
          return (
            <Card
              key={insight.id || index}
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              {...cardStyles}
            >
              <CardBody>
                <HStack spacing={2} mb={2}>
                  <Icon as={config.icon} boxSize={4} color={config.color} />
                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                    {insight.title || config.title}
                  </Text>
                </HStack>
                <Text fontSize="sm" color={subColor}>{insight.content}</Text>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
