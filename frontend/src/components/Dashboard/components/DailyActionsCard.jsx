import {
  Badge,
  Box,
  Card,
  CardBody,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiActivity, FiCoffee, FiMoon } from 'react-icons/fi';

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

const intensityColorMap = {
  High: 'green',
  Moderate: 'yellow',
  Low: 'blue',
};

const actionItems = [
  { key: 'workout', label: 'Workout', icon: FiActivity },
  { key: 'nutrition', label: 'Nutrition', icon: FiCoffee },
  { key: 'recovery', label: 'Recovery', icon: FiMoon },
];

export default function DailyActionsCard({ actions }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const panelBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} {...cardStyles} h="100%">
      <CardBody>
        <VStack align="stretch" spacing={4} h="100%">
          <HStack justify="space-between" align="start">
            <Box>
              <Text fontSize="sm" fontWeight="600" color={subColor} letterSpacing="wider">
                DAILY ACTIONS
              </Text>
              <Text fontSize="sm" color={subColor} mt={1}>
                A simple coaching prompt for today based on your readiness trend.
              </Text>
            </Box>
            <Badge
              colorScheme={intensityColorMap[actions?.workoutIntensity] || 'yellow'}
              borderRadius="full"
              px={3}
              py={1}
            >
              {actions?.workoutIntensity || 'Moderate'} day
            </Badge>
          </HStack>

          <VStack spacing={3} align="stretch">
            {actionItems.map((item) => {
              const content =
                item.key === 'workout'
                  ? actions?.workoutDetail
                  : item.key === 'nutrition'
                    ? actions?.nutritionSuggestion
                    : actions?.recoverySuggestion;

              return (
                <HStack
                  key={item.key}
                  align="start"
                  spacing={3}
                  p={3.5}
                  bg={panelBg}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Box as={item.icon} boxSize={4.5} color={subColor} mt={0.5} flexShrink={0} />
                  <Box>
                    <Text fontSize="sm" fontWeight="700" color={textColor} mb={1}>
                      {item.label}
                    </Text>
                    <Text fontSize="sm" color={subColor}>
                      {content}
                    </Text>
                  </Box>
                </HStack>
              );
            })}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
