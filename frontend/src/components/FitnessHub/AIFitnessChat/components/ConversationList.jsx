import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';

const formatWhen = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/** Desktop sidebar of conversations, newest activity first. */
export default function ConversationList({ conversations, activeId, onSelect, onNew }) {
  const sorted = [...conversations].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return (
    <Box as="nav" aria-label="Conversations" display="flex" flexDirection="column" minH={0} h="100%">
      <Box p={3}>
        <Button w="100%" size="sm" leftIcon={<FiPlus />} variant="outline" onClick={onNew}>New chat</Button>
      </Box>
      <VStack as="ul" listStyleType="none" align="stretch" spacing={0.5} px={2} pb={3} overflowY="auto" minH={0} flex="1">
        {sorted.map((conversation) => {
          const active = conversation.id === activeId;
          return (
            <Box as="li" key={conversation.id}>
              <Box
                as="button"
                type="button"
                w="100%"
                textAlign="left"
                px={3}
                py={2}
                borderRadius="md"
                bg={active ? 'bg.muted' : 'transparent'}
                _hover={{ bg: 'bg.muted' }}
                _focusVisible={{ outline: 'none', boxShadow: '0 0 0 2px var(--chakra-colors-focus-ring)' }}
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelect(conversation.id)}
              >
                <Text fontSize="sm" fontWeight={active ? 700 : 500} noOfLines={1}>{conversation.title}</Text>
                <Text fontSize="xs" color="fg.muted">{formatWhen(conversation.updatedAt)}</Text>
              </Box>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}
