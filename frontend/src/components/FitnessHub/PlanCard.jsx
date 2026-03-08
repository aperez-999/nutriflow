import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiActivity, FiCoffee } from 'react-icons/fi';

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
 * Displays an AI-generated plan (workout or meal) with title and list of items.
 * type: 'workout' | 'meal' for header icon (FiActivity / FiCoffee).
 */
export default function PlanCard({ title = 'Plan', items = [], type = 'workout' }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const iconColor = useColorModeValue('teal.500', 'teal.300');
  const PlanIcon = type === 'meal' ? FiCoffee : FiActivity;

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} {...cardStyles} height="100%">
      <CardHeader pb={2}>
        <HStack spacing={2} align="center">
          <Icon as={PlanIcon} boxSize={4} color={iconColor} />
          <Heading size="sm" fontWeight="600" color={textColor}>
            {title}
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <VStack align="stretch" spacing={2}>
          {Array.isArray(items) && items.length > 0 ? (
            items.map((item, index) => (
              <Text key={index} fontSize="sm" color={subColor}>
                • {typeof item === 'string' ? item : item.label || item.name}
              </Text>
            ))
          ) : (
            <Text fontSize="sm" color={subColor}>
              No items in this plan.
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
