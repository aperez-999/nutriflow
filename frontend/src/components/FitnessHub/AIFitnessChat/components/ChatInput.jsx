import React from 'react';
import {
  Box,
  HStack,
  Textarea,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';

const ChatInput = ({ value, onChange, onSend, isLoading }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const containerBg = useColorModeValue('white', 'gray.800');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box
      px={{ base: 3, md: 4 }}
      py={3}
      borderTop="1px"
      borderColor={borderColor}
      bg={containerBg}
      borderBottomRadius="xl"
    >
      <HStack
        spacing={2}
        align="flex-end"
        borderWidth="1.5px"
        borderColor={borderColor}
        borderRadius="xl"
        bg={inputBg}
        px={3}
        py={2}
        _focusWithin={{
          borderColor: 'teal.400',
          boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)',
        }}
        transition="all 0.15s ease"
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your AI coach anything... (Enter to send, Shift+Enter for new line)"
          bg="transparent"
          border="none"
          outline="none"
          minH="44px"
          maxH="140px"
          resize="none"
          fontSize="sm"
          lineHeight="1.6"
          p={0}
          disabled={isLoading}
          _focus={{ boxShadow: 'none', border: 'none' }}
          _placeholder={{ color: placeholderColor }}
          flex="1"
        />
        <IconButton
          icon={<FiSend />}
          colorScheme="teal"
          size="sm"
          borderRadius="lg"
          onClick={onSend}
          isLoading={isLoading}
          isDisabled={!value.trim() || isLoading}
          aria-label="Send message"
          flexShrink={0}
          mb={0.5}
        />
      </HStack>
    </Box>
  );
};

export default ChatInput;
