import React, { useContext } from 'react';
import { Button } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiMessageCircle } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';

/**
 * Floating button to open the AI Coach (Fitness Hub). Only visible when the user is signed in.
 * Hidden on Fitness Hub page and on public pages (home, login, register).
 */
export default function FloatingAICoachButton() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isOnFitnessHub = location.pathname === '/fitness-hub';

  if (!user || isOnFitnessHub) return null;

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
