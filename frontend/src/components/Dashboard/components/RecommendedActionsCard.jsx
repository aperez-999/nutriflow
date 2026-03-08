import React from 'react';
import {
  Card,
  CardBody,
  Text,
  VStack,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

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
 * Suggested next steps as interactive buttons.
 */
export default function RecommendedActionsCard({
  onScrollToDiet,
  onScrollToWorkout,
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const teal = useColorModeValue('teal.500', 'teal.300');

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} {...cardStyles} height="100%">
      <CardBody>
        <Text fontSize="sm" fontWeight="600" color={textColor} letterSpacing="wider" mb={3}>
          RECOMMENDED ACTIONS
        </Text>
        <VStack align="stretch" spacing={2}>
          <Button
            size="sm"
            variant="outline"
            colorScheme="teal"
            leftIcon={<Icon as={FiCheckCircle} boxSize={4} color={teal} />}
            onClick={onScrollToDiet}
            w="100%"
            justifyContent="flex-start"
            transition="all 0.2s ease"
          >
            Log Meal
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="teal"
            leftIcon={<Icon as={FiCheckCircle} boxSize={4} color={teal} />}
            onClick={onScrollToWorkout}
            w="100%"
            justifyContent="flex-start"
            transition="all 0.2s ease"
          >
            Log Workout
          </Button>
          <Button
            as={RouterLink}
            to="/fitness-hub"
            size="sm"
            variant="outline"
            colorScheme="teal"
            leftIcon={<Icon as={FiCheckCircle} boxSize={4} color={teal} />}
            w="100%"
            justifyContent="flex-start"
            transition="all 0.2s ease"
          >
            Open AI Coach
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}
