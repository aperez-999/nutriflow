import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  Text,
  Flex,
  Button,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { DURATION, EASE_OUT } from '../../../Motion/tokens';
import remarkGfm from 'remark-gfm';
import { QUICK_ACTIONS, PRIMARY_SUGGESTIONS, CHAT_ACTION_BUTTON_PROPS, QUICK_ACTION_LABELS } from '../constants';


function splitSuggestions(suggestions) {
  if (!Array.isArray(suggestions)) return { primary: [], secondary: [] };
  const primary = suggestions.filter((s) => PRIMARY_SUGGESTIONS.includes(s) && !QUICK_ACTIONS.includes(s));
  const secondary = suggestions.filter((s) => !PRIMARY_SUGGESTIONS.includes(s) && !QUICK_ACTIONS.includes(s));
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

function MarkdownBlock({ content }) {
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
          background: 'var(--chakra-colors-bg-muted)',
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
  const isUser = message.type === 'user';
  const suggestions = useMemo(() => {
    const { primary, secondary } = splitSuggestions(message.suggestions);
    return [...primary, ...secondary];
  }, [message.suggestions]);
  const structuredContent = useMemo(
    () => (message.type === 'ai' ? parseStructuredSections(message.content) : null),
    [message.content, message.type]
  );
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const enter = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.base, ease: EASE_OUT },
  };

  if (isUser) {
    return (
      <Flex as={motion.div} {...enter} justify="flex-end">
        <Box maxW={{ base: '88%', md: '75%' }}>
          <Box bg="bg.muted" px={4} py={2.5} borderRadius="panel" borderBottomRightRadius="4px">
            <Text fontSize="sm" lineHeight="1.6" whiteSpace="pre-line" overflowWrap="anywhere">{message.content}</Text>
          </Box>
          <Text fontSize="xs" color="fg.muted" mt={1} textAlign="right">{time}</Text>
        </Box>
      </Flex>
    );
  }

  return (
    <Box as={motion.div} {...enter} maxW={{ base: '100%', md: '92%' }}>
      <Text fontSize="xs" fontWeight="700" mb={1}>Coach <Text as="span" color="fg.muted" fontWeight="400">{time}</Text></Text>
      {structuredContent ? (
        <VStack align="stretch" spacing={3}>
          {structuredContent.intro ? <MarkdownBlock content={structuredContent.intro} /> : null}
          {structuredContent.sections.map((section, index) => (
            <Box key={`${section.title}-${index}`} borderTopWidth="1px" borderColor="border" pt={3}>
              <Text fontSize="sm" fontWeight="700" mb={1}>{section.title}</Text>
              <MarkdownBlock content={section.content} />
            </Box>
          ))}
        </VStack>
      ) : (
        <MarkdownBlock content={message.content} />
      )}

      {suggestions.length > 0 && (
        <Wrap spacing={2} mt={3}>
          {suggestions.map((suggestion, index) => (
            <WrapItem key={`${message.id}-suggestion-${index}`}>
              <Button variant="outline" {...CHAT_ACTION_BUTTON_PROPS} onClick={() => onSuggestionClick(suggestion)}>
                {QUICK_ACTION_LABELS[suggestion] || suggestion}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </Box>
  );
});

export default ChatMessage;
