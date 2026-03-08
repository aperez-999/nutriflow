import React from 'react';
import { Box, VStack, Text, Button, HStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { FiMessageCircle, FiPlusCircle } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Shortcuts: AI Coach (Fitness Hub) and prompt to log meal/workout (scroll or just copy).
 */
export default function QuickActionsCard({ onScrollToDiet, onScrollToWorkout }) {
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('teal.500', 'teal.300');

  return (
    <Box
      p={5}
      bg={bg}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      height="100%"
      display="flex"
      flexDirection="column"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
      transition="all 0.2s ease"
    >
      <HStack spacing={2} mb={3}>
        <Icon as={FiPlusCircle} boxSize={4} color={accentColor} />
        <Text fontSize="sm" fontWeight="600" color={textColor}>Quick actions</Text>
      </HStack>
      <VStack align="stretch" spacing={3} flex="1">
        <Button
          as={RouterLink}
          to="/fitness-hub"
          size="md"
          colorScheme="teal"
          variant="solid"
          leftIcon={<FiMessageCircle />}
          _hover={{ opacity: 0.9 }}
          w="100%"
          transition="all 0.2s ease"
        >
          Open AI Coach
        </Button>
        {typeof onScrollToDiet === 'function' && (
          <Button size="sm" variant="outline" colorScheme="teal" onClick={onScrollToDiet} w="100%" transition="all 0.2s ease">
            Log meal
          </Button>
        )}
        {typeof onScrollToWorkout === 'function' && (
          <Button size="sm" variant="outline" colorScheme="teal" onClick={onScrollToWorkout} w="100%" transition="all 0.2s ease">
            Log workout
          </Button>
        )}
      </VStack>
    </Box>
  );
}
