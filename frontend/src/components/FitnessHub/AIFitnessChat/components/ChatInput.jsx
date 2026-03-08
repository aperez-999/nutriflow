import React from 'react';
import {
  Box,
  HStack,
  Input,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';

const ChatInput = ({ value, onChange, onSend, isLoading }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box p={4} borderTop="1px" borderColor={borderColor}>
      <HStack spacing={2} align="stretch">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask the AI coach for a workout plan, meal plan, or progress analysis…"
          bg={inputBg}
          border="1px"
          borderColor={borderColor}
          minH="44px"
          _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }}
          disabled={isLoading}
        />
        <Button
          colorScheme="teal"
          onClick={onSend}
          isLoading={isLoading}
          disabled={!value.trim() || isLoading}
          leftIcon={<FiSend />}
          transition="all 0.2s ease"
        >
          Send
        </Button>
      </HStack>
    </Box>
  );
};

export default ChatInput;
