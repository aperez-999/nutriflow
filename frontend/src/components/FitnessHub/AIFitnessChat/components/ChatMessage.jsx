import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Flex,
  Button,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUser, FiCpu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PRIMARY_SUGGESTIONS, CHAT_ACTION_BUTTON_PROPS } from '../constants';

const MotionBox = motion(Box);

function splitSuggestions(suggestions) {
  if (!Array.isArray(suggestions)) return { primary: [], secondary: [] };
  const primary = suggestions.filter((s) => PRIMARY_SUGGESTIONS.includes(s));
  const secondary = suggestions.filter((s) => !PRIMARY_SUGGESTIONS.includes(s));
  return { primary, secondary };
}

function parseStructuredSections(content) {
  if (!content || typeof content !== 'string') return null;

  const lines = content.split('\n');
  const sections = [];
  let current = null;
  let intro = [];

  const headingMatcher = /^(#{1,3}\s+.+|(?:Breakfast|Lunch|Dinner|Snack|Snacks|Overview|Next Steps|Wins|Watchouts|Readiness|Recommendation|Why|Priority Focus|What to Keep|What to Adjust|Setup|Common Mistakes|Coaching Cues|Key exercises|Day\s+\d+|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Upper Body|Lower Body|Full Body|Leg Day|Push Day|Pull Day|Recovery Day|Conditioning)[:\s].*)$/i;

  lines.forEach((line) => {
    const trimmed = line.trim();
    const isHeading = headingMatcher.test(trimmed);

    if (isHeading) {
      if (current) sections.push(current);
      const title = trimmed.replace(/^#{1,3}\s*/, '').replace(/:$/, '');
      current = { title, lines: [] };
      return;
    }

    if (current) {
      current.lines.push(line);
    } else {
      intro.push(line);
    }
  });

  if (current) sections.push(current);
  if (sections.length < 2) return null;

  return {
    intro: intro.join('\n').trim(),
    sections: sections.map((section) => ({
      title: section.title,
      content: section.lines.join('\n').trim(),
    })),
  };
}

function MarkdownBlock({ content, inlineCodeBg }) {
  return (
    <Box
      fontSize="sm"
      lineHeight="1.7"
      sx={{
        '& p': { marginBottom: '0.85rem', lineHeight: 1.7 },
        '& p:last-child': { marginBottom: 0 },
        '& ul, & ol': { paddingLeft: '1.25rem', marginBottom: '0.85rem' },
        '& li': { marginBottom: '0.35rem' },
        '& li > p': { marginBottom: '0.35rem' },
        '& h1, & h2, & h3': { marginTop: '0.85rem', marginBottom: '0.5rem', fontWeight: 600, lineHeight: 1.4 },
        '& strong': { fontWeight: 600 },
        '& code': {
          fontSize: '0.85em',
          background: inlineCodeBg,
          px: '0.2rem',
          py: '0.08rem',
          borderRadius: '0.3rem',
        },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </Box>
  );
}

const ChatMessage = React.memo(function ChatMessage({ message, onSuggestionClick }) {
  const userBubbleColor = useColorModeValue('blue.500', 'blue.400');
  const aiBubbleColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const bubbleBorderColor = useColorModeValue('gray.200', 'gray.600');
  const inlineCodeBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const structuredSectionBg = useColorModeValue('white', 'whiteAlpha.50');

  const { primary, secondary } = useMemo(
    () => splitSuggestions(message.suggestions),
    [message.suggestions]
  );
  const structuredContent = useMemo(
    () => (message.type === 'ai' ? parseStructuredSections(message.content) : null),
    [message.content, message.type]
  );

  return (
    <MotionBox
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <Flex justify={message.type === 'user' ? 'flex-end' : 'flex-start'}>
        <HStack
          spacing={3}
          align="flex-start"
          maxW={{ base: '100%', md: '92%' }}
          flexDirection={message.type === 'user' ? 'row-reverse' : 'row'}
        >
          <Avatar
            size="sm"
            bg={message.type === 'user' ? userBubbleColor : 'blue.500'}
            color="white"
            icon={message.type === 'user' ? <FiUser /> : <FiCpu />}
            mt="2px"
          />

          <VStack spacing={2.5} align={message.type === 'user' ? 'end' : 'start'} maxW="full">
            <Box
              bg={message.type === 'user' ? userBubbleColor : aiBubbleColor}
              color={message.type === 'user' ? 'white' : textColor}
              px={{ base: 4, md: 5 }}
              py={{ base: 3.5, md: 4 }}
              borderWidth={message.type === 'user' ? '0' : '1px'}
              borderColor={bubbleBorderColor}
              borderRadius="xl"
              borderBottomLeftRadius={message.type === 'user' ? 'xl' : 'sm'}
              borderBottomRightRadius={message.type === 'user' ? 'sm' : 'xl'}
              maxW="full"
              overflowWrap="break-word"
              wordBreak="normal"
            >
              {message.type === 'ai' ? (
                structuredContent ? (
                  <VStack align="stretch" spacing={3}>
                    {structuredContent.intro ? (
                      <MarkdownBlock content={structuredContent.intro} inlineCodeBg={inlineCodeBg} />
                    ) : null}
                    {structuredContent.sections.map((section, index) => (
                      <Box
                        key={`${section.title}-${index}`}
                        p={4}
                        bg={structuredSectionBg}
                        borderWidth="1px"
                        borderColor={bubbleBorderColor}
                        borderRadius="lg"
                      >
                        <VStack align="stretch" spacing={2}>
                          <Text fontSize="sm" fontWeight="700" color={textColor}>
                            {section.title}
                          </Text>
                          <MarkdownBlock content={section.content} inlineCodeBg={inlineCodeBg} />
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <MarkdownBlock content={message.content} inlineCodeBg={inlineCodeBg} />
                )
              ) : (
                <Text fontSize="sm" lineHeight="1.7" whiteSpace="pre-line">
                  {message.content}
                </Text>
              )}
            </Box>

            {message.type === 'ai' && (primary.length > 0 || secondary.length > 0) && (
              <VStack spacing={2} align="start" w="100%">
                {primary.length > 0 && (
                  <Wrap spacing={2}>
                    {primary.map((suggestion, index) => (
                      <WrapItem key={`primary-${message.id}-${index}`}>
                        <Button
                          colorScheme="teal"
                          variant="solid"
                          {...CHAT_ACTION_BUTTON_PROPS}
                          onClick={() => onSuggestionClick(suggestion)}
                          _hover={{ opacity: 0.92 }}
                        >
                          {suggestion}
                        </Button>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}

                {secondary.length > 0 && (
                  <Wrap spacing={2} align="center">
                    <WrapItem>
                      <Text fontSize="xs" color={subTextColor}>
                        More:
                      </Text>
                    </WrapItem>
                    {secondary.map((suggestion, index) => (
                      <WrapItem key={`secondary-${message.id}-${index}`}>
                        <Button
                          colorScheme="teal"
                          variant="outline"
                          {...CHAT_ACTION_BUTTON_PROPS}
                          onClick={() => onSuggestionClick(suggestion)}
                          _hover={{ opacity: 0.92 }}
                        >
                          {suggestion}
                        </Button>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </VStack>
            )}

            <Text fontSize="xs" color={subTextColor} px={1}>
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
