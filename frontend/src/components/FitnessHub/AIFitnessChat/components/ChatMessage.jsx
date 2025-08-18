import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Flex,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUser, FiCpu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MotionBox = motion(Box);

const ChatMessage = ({ message, onSuggestionClick }) => {
  const userBubbleColor = useColorModeValue('blue.500', 'blue.400');
  const aiBubbleColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

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
          <VStack spacing={2} align={message.type === 'user' ? 'end' : 'start'}>
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
                <Box fontSize="sm" sx={{
                  '& p': { marginBottom: '0.5rem', lineHeight: 1.5 },
                  '& ul': { paddingLeft: '1.25rem', marginBottom: '0.5rem' },
                  '& ol': { paddingLeft: '1.25rem', marginBottom: '0.5rem' },
                  '& h1, & h2, & h3': { marginTop: '0.5rem', marginBottom: '0.5rem' }
                }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </Box>
              ) : (
                <Text fontSize="sm" whiteSpace="pre-line">{message.content}</Text>
              )}
            </Box>

            {/* AI Suggestions */}
            {message.type === 'ai' && message.suggestions && (
              <VStack spacing={2} align="start" w="100%">
                <Text fontSize="xs" color={subTextColor}>Quick actions:</Text>
                <Flex wrap="wrap" gap={2}>
                  {message.suggestions.map((suggestion, index) => (
                    <Badge
                      key={`suggestion-${message.id}-${index}`}
                      colorScheme="blue"
                      variant="outline"
                      cursor="pointer"
                      px={2}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      onClick={() => onSuggestionClick(suggestion)}
                      _hover={{ bg: 'blue.50' }}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </Flex>
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
};

export default ChatMessage;
