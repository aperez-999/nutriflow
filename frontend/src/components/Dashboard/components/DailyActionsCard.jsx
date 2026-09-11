import React from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Box,
  Card,
  CardBody,
  HStack,
  Icon,
  Stack,
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

const iconToneMap = {
  workout: {
    color: 'teal.500',
  },
  nutrition: {
    color: 'orange.400',
  },
  recovery: {
    color: 'purple.400',
  },
};

function DailyActionsCard({ actions = undefined }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const panelBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const panelHoverBg = useColorModeValue('white', 'gray.700');
  const iconBg = useColorModeValue('white', 'whiteAlpha.100');
  const iconBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const iconShadow = useColorModeValue('sm', 'none');

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} {...cardStyles} h="100%">
      <CardBody>
        <VStack align="stretch" spacing={4} h="100%">
          <HStack justify="space-between" align="flex-start" spacing={4}>
            <Box>
              <Text fontSize="sm" fontWeight="600" color={subColor} letterSpacing="wider">
                DAILY ACTIONS
              </Text>
              <Text fontSize="sm" color={subColor} mt={1} lineHeight="tall">
                A simple coaching prompt for today based on your readiness trend.
              </Text>
            </Box>
            <Badge
              colorScheme={intensityColorMap[actions?.workoutIntensity] || 'yellow'}
              borderRadius="full"
              px={3}
              py={1}
              whiteSpace="nowrap"
            >
              {actions?.workoutIntensity || 'Moderate'} day
            </Badge>
          </HStack>

          <Stack spacing={3} align="stretch">
            {actionItems.map((item) => {
              const content =
                item.key === 'workout'
                  ? actions?.workoutDetail
                  : item.key === 'nutrition'
                    ? actions?.nutritionSuggestion
                    : actions?.recoverySuggestion;

              const tone = iconToneMap[item.key];

              return (
                <HStack
                  key={item.key}
                  align="flex-start"
                  spacing={4}
                  p={4}
                  bg={panelBg}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor={iconBorder}
                  transition="all 0.2s ease"
                  _hover={{
                    bg: panelHoverBg,
                    borderColor,
                    transform: 'translateY(-1px)',
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxSize={12}
                    flexShrink={0}
                    borderRadius="xl"
                    bg={iconBg}
                    borderWidth="1px"
                    borderColor={iconBorder}
                    boxShadow={iconShadow}
                  >
                    <Icon as={item.icon} boxSize={6} color={tone.color} />
                  </Box>

                  <Box flex="1" minW={0}>
                    <Text fontSize="sm" fontWeight="700" color={textColor} mb={1}>
                      {item.label}
                    </Text>
                    <Text fontSize="sm" color={subColor} lineHeight="tall">
                      {content}
                    </Text>
                  </Box>
                </HStack>
              );
            })}
          </Stack>
        </VStack>
      </CardBody>
    </Card>
  );
}

DailyActionsCard.propTypes = {
  actions: PropTypes.shape({
    workoutIntensity: PropTypes.string,
    workoutDetail: PropTypes.string,
    nutritionSuggestion: PropTypes.string,
    recoverySuggestion: PropTypes.string,
  }),
};

export default React.memo(DailyActionsCard);
