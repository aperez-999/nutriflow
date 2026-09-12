import { Box, VStack, Text, HStack, Badge, useColorModeValue } from '@chakra-ui/react';
import AIFitnessChat from './AIFitnessChat/index.jsx';

export default function FitnessHubChatSection({ userWorkouts = [], userDiets = [], toast }) {
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const panelBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box w="100%" h="100%">
      <VStack align="stretch" spacing={4} w="100%" h="100%">
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" fontWeight="600" color={headingColor} letterSpacing="wider">
            COACHING CONSOLE
          </Text>
          <Text fontSize="sm" color={textColor} maxW="720px">
            Chat with the AI coach, generate a weekly plan without exposing raw JSON, and keep your plan history synced
            below.
          </Text>
        </VStack>

        <HStack
          spacing={2}
          flexWrap="wrap"
          bg={panelBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="2xl"
          px={3}
          py={2.5}
          align="center"
        >
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

        <Box flex="1" minH={0}>
          <AIFitnessChat userWorkouts={userWorkouts} userDiets={userDiets} toast={toast} />
        </Box>
      </VStack>
    </Box>
  );
}
