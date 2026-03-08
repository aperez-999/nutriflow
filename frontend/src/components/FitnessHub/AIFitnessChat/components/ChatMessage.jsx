import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Flex,
  Badge,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUser, FiCpu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PRIMARY_SUGGESTIONS } from '../constants';

const MotionBox = motion(Box);

/** Splits suggestions into primary (prominent buttons) and secondary (smaller chips). */
function splitSuggestions(suggestions) {
  if (!Array.isArray(suggestions)) return { primary: [], secondary: [] };
  const primary = suggestions.filter((s) => PRIMARY_SUGGESTIONS.includes(s));
  const secondary = suggestions.filter((s) => !PRIMARY_SUGGESTIONS.includes(s));
  return { primary, secondary };
}

const ChatMessage = React.memo(function ChatMessage({ message, onSuggestionClick }) {
  const userBubbleColor = useColorModeValue('blue.500', 'blue.400');
  const aiBubbleColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const secondaryHoverBg = useColorModeValue('gray.100', 'gray.600');

  const { primary, secondary } = useMemo(
    () => splitSuggestions(message.suggestions),
    [message.suggestions]
  );

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Flex justify={message.type === 'user' ? 'flex-end' : 'flex-start'}>
        <HStack
          spacing={3}
          maxW="80%"
          flexDirection={message.type === 'user' ? 'row-reverse' : 'row'}
        >
          <Avatar
            size="sm"
            bg={message.type === 'user' ? userBubbleColor : 'blue.500'}
            icon={message.type === 'user' ? <FiUser /> : <FiCpu />}
          />
          <VStack spacing={3} align={message.type === 'user' ? 'end' : 'start'}>
            <Box
              bg={message.type === 'user' ? userBubbleColor : aiBubbleColor}
              color={message.type === 'user' ? 'white' : textColor}
              px={4}
              py={3}
              borderRadius="lg"
              borderBottomLeftRadius={message.type === 'user' ? 'lg' : 'sm'}
              borderBottomRightRadius={message.type === 'user' ? 'sm' : 'lg'}
            >
              {message.type === 'ai' ? (
                <Box
                  fontSize="sm"
                  lineHeight="tall"
                  sx={{
                    '& p': { marginBottom: '0.75rem', lineHeight: 1.6 },
                    '& p:last-child': { marginBottom: 0 },
                    '& ul, & ol': { paddingLeft: '1.25rem', marginBottom: '0.75rem' },
                    '& li': { marginBottom: '0.25rem' },
                    '& h1, & h2, & h3': { marginTop: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 },
                    '& strong': { fontWeight: 600 },
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </Box>
              ) : (
                <Text fontSize="sm" whiteSpace="pre-line">{message.content}</Text>
              )}
            </Box>

            {message.type === 'ai' && (primary.length > 0 || secondary.length > 0) && (
              <VStack spacing={2} align="start" w="100%">
                {primary.length > 0 && (
                  <Flex wrap="wrap" gap={2}>
                    {primary.map((suggestion, index) => (
                      <Button
                        key={`primary-${message.id}-${index}`}
                        size="sm"
                        colorScheme="teal"
                        variant="solid"
                        onClick={() => onSuggestionClick(suggestion)}
                        _hover={{ opacity: 0.9 }}
                        transition="opacity 0.2s"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </Flex>
                )}
                {secondary.length > 0 && (
                  <Flex wrap="wrap" gap={2} align="center">
                    <Text fontSize="xs" color={subTextColor} mr={1}>More:</Text>
                    {secondary.map((suggestion, index) => (
                      <Badge
                        key={`secondary-${message.id}-${index}`}
                        colorScheme="gray"
                        variant="outline"
                        cursor="pointer"
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="xs"
                        onClick={() => onSuggestionClick(suggestion)}
                        _hover={{ bg: secondaryHoverBg }}
                        transition="background 0.2s"
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </Flex>
                )}
              </VStack>
            )}

            <Text fontSize="xs" color={subTextColor}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </VStack>
        </HStack>
      </Flex>
    </MotionBox>
  );
});

export default ChatMessage;
