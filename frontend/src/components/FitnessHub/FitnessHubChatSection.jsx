import React from 'react';
import { Box, VStack, Text, HStack, Badge, Button, useColorModeValue } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import AIFitnessChat from './AIFitnessChat/index.jsx';

/**
 * Fitness Hub — AI Coach chat block with section label.
 */
export default function FitnessHubChatSection({
  userWorkouts = [],
  userDiets = [],
  toast,
  onGetRecommendations,
  recommendationsLoading = false,
}) {
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box w="100%">
      <VStack align="stretch" spacing={4} w="100%">
        <HStack justify="space-between" align={{ base: 'start', md: 'center' }} flexWrap="wrap" gap={3}>
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="600" color={headingColor} letterSpacing="wider">
              COACHING CONSOLE
            </Text>
            <Text fontSize="sm" color={textColor} maxW="560px">
              Use the AI coach for fast guidance, then generate plans and review them alongside the conversation.
            </Text>
          </VStack>
          <Button
            leftIcon={<FiStar />}
            colorScheme="teal"
            variant="outline"
            onClick={onGetRecommendations}
            isLoading={recommendationsLoading}
          >
            Generate weekly plan
          </Button>
        </HStack>

        <HStack spacing={2} flexWrap="wrap">
          <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="full">
            {userWorkouts.length} workout signals
          </Badge>
          <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="full">
            {userDiets.length} nutrition signals
          </Badge>
          <Badge colorScheme="purple" variant="subtle" px={2} py={1} borderRadius="full">
            Chat-first planning
          </Badge>
        </HStack>

        <Text fontSize="sm" fontWeight="600" color={headingColor} letterSpacing="wider">
          AI COACH
        </Text>
        <AIFitnessChat userWorkouts={userWorkouts} userDiets={userDiets} toast={toast} />
      </VStack>
    </Box>
  );
}
