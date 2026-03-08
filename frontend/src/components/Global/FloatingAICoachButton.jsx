import React from 'react';
import { Button, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiMessageCircle } from 'react-icons/fi';

/**
 * Floating button to open the AI Coach (Fitness Hub). Visible across the app.
 */
export default function FloatingAICoachButton() {
  const location = useLocation();
  const isOnFitnessHub = location.pathname === '/fitness-hub';

  if (isOnFitnessHub) return null;

  return (
    <Button
      as={RouterLink}
      to="/fitness-hub"
      position="fixed"
      bottom="24px"
      right="24px"
      leftIcon={<FiMessageCircle size={18} />}
      colorScheme="teal"
      size="md"
      boxShadow="lg"
      zIndex={1000}
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'xl',
      }}
      transition="all 0.2s ease"
      aria-label="Ask AI Coach"
    >
      Ask AI Coach
    </Button>
  );
}
