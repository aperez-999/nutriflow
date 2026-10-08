import { Box, HStack, IconButton, Textarea } from '@chakra-ui/react';
import { FiArrowUp } from 'react-icons/fi';

const ChatInput = ({ value, onChange, onSend, isLoading }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box px={{ base: 3, md: 4 }} pb={{ base: 3, md: 4 }}>
      <HStack
        spacing={2}
        align="flex-end"
        borderWidth="1px"
        borderColor="border"
        borderRadius="panel"
        bg="bg.surface"
        px={3}
        py={2}
        _focusWithin={{ borderColor: 'border.strong' }}
        transition="border-color 0.15s ease"
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your coach"
          aria-label="Message your coach"
          variant="unstyled"
          minH="40px"
          maxH="140px"
          resize="none"
          rows={1}
          lineHeight="1.6"
          py={2}
          isDisabled={isLoading}
          flex="1"
        />
        <IconButton
          icon={<FiArrowUp />}
          size="sm"
          onClick={onSend}
          isLoading={isLoading}
          isDisabled={!value.trim() || isLoading}
          aria-label="Send message"
          flexShrink={0}
          mb={1}
        />
      </HStack>
    </Box>
  );
};

export default ChatInput;
