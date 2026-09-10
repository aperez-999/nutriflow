import React from 'react';
import { Box, VStack, Text, HStack, Badge, useColorModeValue } from '@chakra-ui/react';
import AIFitnessChat from './AIFitnessChat/index.jsx';

export default function FitnessHubChatSection({ userWorkouts = [], userDiets = [], toast }) {
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box w="100%">
      <VStack align="stretch" spacing={4} w="100%">
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" fontWeight="600" color={headingColor} letterSpacing="wider">
            COACHING CONSOLE
          </Text>
          <Text fontSize="sm" color={textColor} maxW="720px">
            Chat with the AI coach, generate a weekly plan without exposing raw JSON, and keep your plan history synced
            below.
          </Text>
        </VStack>

        <HStack spacing={2} flexWrap="wrap">
          <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="full">
            {userWorkouts.length} workout signals
          </Badge>
          <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="full">
            {userDiets.length} nutrition signals
          </Badge>
          <Badge colorScheme="purple" variant="subtle" px={2} py={1} borderRadius="full">
            Plan history enabled
          </Badge>
        </HStack>

        <AIFitnessChat userWorkouts={userWorkouts} userDiets={userDiets} toast={toast} />
      </VStack>
    </Box>
  );
}
