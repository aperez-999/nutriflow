import React from 'react';
import { Box, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import AIFitnessChat from './AIFitnessChat/index.jsx';

/**
 * Fitness Hub — AI Coach chat block with section label.
 */
export default function FitnessHubChatSection({ userWorkouts = [], userDiets = [], toast }) {
  const headingColor = useColorModeValue('gray.800', 'white');

  return (
    <Box mt={8} w="100%">
      <VStack align="stretch" spacing={3} w="100%" maxW={{ base: '100%', lg: '720px' }} mx="auto">
        <Text fontSize="sm" fontWeight="600" color={headingColor} letterSpacing="wider">
          AI COACH
        </Text>
        <AIFitnessChat userWorkouts={userWorkouts} userDiets={userDiets} toast={toast} />
      </VStack>
    </Box>
  );
}
