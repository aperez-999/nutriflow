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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box p={4} borderTop="1px" borderColor={borderColor}>
      <HStack spacing={2}>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask me about workouts, form, nutrition, or planning..."
          bg={useColorModeValue('gray.50', 'gray.700')}
          border="1px"
          borderColor={borderColor}
          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
          disabled={isLoading}
        />
        <Button
          colorScheme="blue"
          onClick={onSend}
          isLoading={isLoading}
          disabled={!value.trim() || isLoading}
          leftIcon={<FiSend />}
        >
          Send
        </Button>
      </HStack>
    </Box>
  );
};

export default ChatInput;
