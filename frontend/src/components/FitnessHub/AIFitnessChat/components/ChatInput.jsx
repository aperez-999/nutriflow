import React from 'react';
import {
  Box,
  Stack,
  Textarea,
  Button,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';

const ChatInput = ({ value, onChange, onSend, isLoading }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const helperTextColor = useColorModeValue('gray.500', 'gray.400');
  const containerBg = useColorModeValue('white', 'gray.800');
  const helperBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box px={{ base: 4, md: 5 }} py={4} borderTop="1px" borderColor={borderColor} bg={containerBg}>
      <VStack spacing={3} align="stretch">
        <Box px={3} py={2} borderRadius="xl" bg={helperBg} borderWidth="1px" borderColor={borderColor}>
          <Text fontSize="xs" color={helperTextColor}>
            Ask for a weekly plan, nutrition changes, recovery guidance, or a progress check-in.
          </Text>
        </Box>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={3} align="stretch">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message your AI coach..."
            bg={inputBg}
            border="1px"
            borderColor={borderColor}
            minH="72px"
            maxH="160px"
            resize="none"
            borderRadius="xl"
            disabled={isLoading}
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }}
          />
          <Button
            colorScheme="teal"
            onClick={onSend}
            isLoading={isLoading}
            isDisabled={!value.trim() || isLoading}
            leftIcon={<FiSend />}
            minW={{ base: '96px', md: '112px' }}
            minH="72px"
            borderRadius="xl"
            alignSelf={{ base: 'flex-end', md: 'stretch' }}
          >
            Send
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

export default ChatInput;
