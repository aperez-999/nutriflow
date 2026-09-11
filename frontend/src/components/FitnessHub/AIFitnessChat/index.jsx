import React, { useState, useRef, useEffect, useContext, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Stack,
  Card,
  CardBody,
  Text,
  Button,
  Avatar,
  Spinner,
  Wrap,
  WrapItem,
  IconButton,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCpu, FiPlus, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AuthContext } from '../../../context/AuthContext';
import { aiChat, saveChatHistory, loadChatHistory, clearChatHistory } from '../../../services/api';
import { ChatHeader, ChatInput, ChatMessage, TypingDots } from './components';
import { WELCOME_MESSAGE, CLEAR_MESSAGE, QUICK_ACTIONS, CHAT_ACTION_BUTTON_PROPS, TYPING_INDICATOR_TEXT } from './constants';
import {
  parseAIRecommendations,
  parseAIMealPlan,
  fallbackParseWorkoutPlan,
  createUserMessage,
  createAIMessage,
  createErrorMessage,
  createSuccessMessage,
  createPlanFormattingMessage,
  resolveAssistantActionPrompt,
  isGenericBackendFallback,
  buildConversationalFallbackResponse,
} from './utils';
import { handleApiError } from '../../../utils/apiErrorHandler';

const CHAT_THREADS_STORAGE_KEY = 'nutriflow.fitnessHub.chatThreads';

const createConversation = (title = 'New chat', messages = [WELCOME_MESSAGE]) => ({
  id: `conversation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title,
  updatedAt: new Date().toISOString(),
  messages,
});

const getConversationTitle = (messages = [], fallback = 'New chat') => {
  const firstUserMessage = messages.find((message) => message.type === 'user' && message.content?.trim());
  if (!firstUserMessage) return fallback;
  return firstUserMessage.content.trim().slice(0, 40) || fallback;
};

const AIFitnessChat = forwardRef(({ userWorkouts = [], userDiets = [], toast }, ref) => {
  const [conversations, setConversations] = useState([createConversation()]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const didInitRef = useRef(false);
  const suppressSaveRef = useRef(false);

  const { user } = useContext(AuthContext);
  const storageUserId = user?.user?._id || user?._id || user?.result?._id || 'anonymous';

  const bgColor = useColorModeValue('white', 'gray.800');
  const aiBubbleColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const railBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const bubbleBorderColor = useColorModeValue('gray.200', 'gray.600');

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || conversations[0],
    [activeConversationId, conversations]
  );
  const messages = activeConversation?.messages || [WELCOME_MESSAGE];

  const updateActiveConversation = useCallback((updater) => {
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== activeConversationId) return conversation;
        const nextMessages = typeof updater === 'function' ? updater(conversation.messages) : updater;
        return {
          ...conversation,
          messages: nextMessages,
          updatedAt: new Date().toISOString(),
          title: getConversationTitle(nextMessages, conversation.title),
        };
      })
    );
  }, [activeConversationId]);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    const behavior = messages.length <= 1 ? 'auto' : 'smooth';
    const frame = window.requestAnimationFrame(() => scrollToBottom(behavior));
    return () => window.cancelAnimationFrame(frame);
  }, [activeConversationId, isLoading, messages, scrollToBottom]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const loadInitialState = async () => {
      try {
        const localRaw = window.localStorage.getItem(`${CHAT_THREADS_STORAGE_KEY}.${storageUserId}`);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed?.conversations) && parsed.conversations.length > 0) {
            setConversations(parsed.conversations);
            setActiveConversationId(parsed.activeConversationId || parsed.conversations[0].id);
            return;
          }
        }

        const serverHistory = await loadChatHistory(40);
        suppressSaveRef.current = true;

        if (Array.isArray(serverHistory) && serverHistory.length) {
          const hydrated = serverHistory.map((m, idx) => ({
            id: `server-${idx + 1}`,
            type: m.role === 'user' ? 'user' : 'ai',
            content: m.content,
            timestamp: new Date(m.createdAt || Date.now()),
            suggestions: m.suggestions,
          }));
          const importedConversation = createConversation('Imported chat', hydrated);
          setConversations([importedConversation]);
          setActiveConversationId(importedConversation.id);
        } else {
          const starterConversation = createConversation();
          setConversations([starterConversation]);
          setActiveConversationId(starterConversation.id);
        }
      } catch (err) {
        handleApiError(err, 'loading chat history', toast);
        const starterConversation = createConversation();
        setConversations([starterConversation]);
        setActiveConversationId(starterConversation.id);
      } finally {
        suppressSaveRef.current = false;
      }
    };

    loadInitialState();
  }, [storageUserId, toast]);

  useEffect(() => {
    if (!activeConversationId) return;
    window.localStorage.setItem(
      `${CHAT_THREADS_STORAGE_KEY}.${storageUserId}`,
      JSON.stringify({
        conversations,
        activeConversationId,
      })
    );
  }, [activeConversationId, conversations, storageUserId]);

  useEffect(() => {
    if (suppressSaveRef.current || !activeConversationId) return;

    const nonEmpty = messages.filter((m) => (m.type === 'user' || m.type === 'ai') && m.content?.trim());
    if (nonEmpty.length === 0) return;

    const onlyWelcome = nonEmpty.length === 1 && nonEmpty[0].id?.startsWith('welcome');
    if (onlyWelcome) return;

    const toSave = nonEmpty.map((m) => ({ type: m.type, content: m.content }));
    saveChatHistory(toSave).catch((err) => handleApiError(err, 'saving chat history', toast));
  }, [activeConversationId, messages, toast]);

  const generateAIResponse = useCallback(async (userMessage, historyMessages) => {
    setIsLoading(true);
    const isPlanRequest = /\[\[RETURN_JSON_WORKOUT_PLAN\]\]/i.test(userMessage);
    const isMealPlanRequest = /meal plan/i.test(userMessage) && !isPlanRequest;
    if (isPlanRequest) {
      window.dispatchEvent(new CustomEvent('ai-recommendations-loading'));
    }
    if (isMealPlanRequest) {
      window.dispatchEvent(new CustomEvent('ai-meal-plan-loading'));
    }

    try {
      const userContext = {
        recentWorkouts: userWorkouts.slice(-5),
        recentDiets: userDiets.slice(-5),
        userName: user?.result?.username || user?.username || 'there',
        ...((user?.user?._id || user?._id) && { userId: user?.user?._id || user._id }),
      };

      const history = historyMessages.map((m) => ({ type: m.type, content: m.content }));
      const data = await aiChat(userMessage, userContext, history);

      if (isPlanRequest) {
        const workouts = parseAIRecommendations(data.content) || fallbackParseWorkoutPlan(data.content);
        if (workouts) {
          window.dispatchEvent(new CustomEvent('ai-recommendations-updated', { detail: workouts }));
          return {
            content: createSuccessMessage(workouts).content,
            suggestions: data.suggestions,
            parsedRecommendations: true,
          };
        }
        return {
          content: data.content || createPlanFormattingMessage().content,
          suggestions: data.suggestions,
          parsedRecommendations: false,
        };
      }

      if (isMealPlanRequest) {
        const mealPlan = parseAIMealPlan(data.content);
        if (mealPlan?.meals?.length) {
          window.dispatchEvent(new CustomEvent('ai-meal-plan-updated', { detail: mealPlan }));
        } else {
          window.dispatchEvent(new CustomEvent('ai-meal-plan-updated', { detail: null }));
        }
      }

      if (data?.source === 'fallback' || isGenericBackendFallback(data.content)) {
        const fallbackResponse = buildConversationalFallbackResponse(userMessage, userContext);
        return {
          content: fallbackResponse.content,
          suggestions: fallbackResponse.suggestions,
          parsedRecommendations: false,
        };
      }

      return { content: data.content, suggestions: data.suggestions, parsedRecommendations: false };
    } finally {
      setIsLoading(false);
    }
  }, [userWorkouts, userDiets, user]);

  const sendMessage = useCallback(async (promptText, displayText = promptText) => {
    if (!promptText.trim() || !activeConversationId) return;

    const userMessage = createUserMessage(displayText);
    const nextMessages = [...messages, userMessage];
    updateActiveConversation(nextMessages);
    setInputMessage('');

    try {
      const aiResponse = await generateAIResponse(promptText, nextMessages);
      const aiMessage = createAIMessage(aiResponse.content, aiResponse.suggestions);
      updateActiveConversation((currentMessages) => [...currentMessages, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      window.dispatchEvent(new CustomEvent('ai-recommendations-updated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('ai-meal-plan-updated', { detail: null }));
      updateActiveConversation((currentMessages) => [...currentMessages, createErrorMessage()]);
    }
  }, [activeConversationId, generateAIResponse, messages, updateActiveConversation]);

  const handleActionClick = useCallback((label) => {
    sendMessage(resolveAssistantActionPrompt(label), label);
  }, [sendMessage]);

  const startNewConversation = useCallback(() => {
    const newConversation = createConversation();
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setInputMessage('');
  }, []);

  const clearCurrentConversation = useCallback(async () => {
    updateActiveConversation([CLEAR_MESSAGE]);
    try {
      await clearChatHistory();
      window.dispatchEvent(new CustomEvent('ai-recommendations-updated', { detail: [] }));
    } catch (err) {
      handleApiError(err, 'clearing chat history', toast);
    }
  }, [toast, updateActiveConversation]);

  const deleteCurrentConversation = useCallback(() => {
    setConversations((prev) => {
      const remaining = prev.filter((conversation) => conversation.id !== activeConversationId);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
        return remaining;
      }
      const fallbackConversation = createConversation();
      setActiveConversationId(fallbackConversation.id);
      return [fallbackConversation];
    });
    setInputMessage('');
  }, [activeConversationId]);

  useImperativeHandle(ref, () => ({
    send: (text) => sendMessage(text),
    clear: clearCurrentConversation,
  }));

  return (
    <Card
      bg={bgColor}
      w="100%"
      maxW="100%"
      h={{ base: '760px', md: '800px', xl: '820px' }}
      display="flex"
      flexDirection="column"
      variant="flat"
      borderWidth="1px"
      borderColor={cardBorderColor}
      borderRadius="xl"
      boxShadow="sm"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
      transition="all 0.2s ease"
      overflow="hidden"
    >
      <CardBody p={0} display="flex" flexDirection="column" height="100%">
        <ChatHeader
          onClear={clearCurrentConversation}
        />

        <Box px={{ base: 4, md: 5 }} py={{ base: 3.5, md: 4 }} borderBottom="1px" borderColor={cardBorderColor} bg={railBg}>
          <VStack align="stretch" spacing={3}>
            <Stack direction={{ base: 'column', lg: 'row' }} justify="space-between" gap={3}>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={3} flex="1" minW={0}>
                <Select
                  value={activeConversationId || ''}
                  onChange={(e) => setActiveConversationId(e.target.value)}
                  size="sm"
                  maxW={{ base: '100%', md: '280px' }}
                  borderColor={cardBorderColor}
                >
                  {conversations.map((conversation) => (
                    <option key={conversation.id} value={conversation.id}>
                      {conversation.title}
                    </option>
                  ))}
                </Select>
                <HStack spacing={2} flexWrap="wrap">
                  <Button size="sm" leftIcon={<FiPlus />} variant="outline" onClick={startNewConversation}>
                    New chat
                  </Button>
                  <Button size="sm" leftIcon={<FiTrash2 />} variant="ghost" onClick={deleteCurrentConversation}>
                    Delete
                  </Button>
                </HStack>
              </Stack>
              <Text fontSize="xs" color={subTextColor} maxW="320px">
                Your chat threads stay saved locally for this user
              </Text>
            </Stack>

            <Wrap spacing={2.5}>
              {QUICK_ACTIONS.map((suggestion) => (
                <WrapItem key={suggestion}>
                  <Button
                    colorScheme="teal"
                    variant={suggestion === 'Generate Weekly Plan' ? 'solid' : 'outline'}
                    {...CHAT_ACTION_BUTTON_PROPS}
                    onClick={() => handleActionClick(suggestion)}
                    isDisabled={isLoading}
                  >
                    {suggestion}
                  </Button>
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
        </Box>

        <Box
          flex="1"
          overflowY="auto"
          overscrollBehaviorY="contain"
          sx={{ WebkitOverflowScrolling: 'touch' }}
          px={{ base: 4, md: 6 }}
          py={{ base: 4, md: 5 }}
          position="relative"
          ref={messagesContainerRef}
          minH={0}
        >
          <VStack spacing={6} align="stretch">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSuggestionClick={handleActionClick}
              />
            ))}

            {isLoading && (
              <HStack spacing={3} align="flex-start" alignSelf="flex-start" maxW={{ base: '100%', md: '90%' }}>
                <Avatar size="sm" bg="blue.500" color="white" icon={<FiCpu />} />
                <Box
                  bg={aiBubbleColor}
                  color={textColor}
                  px={4}
                  py={3.5}
                  borderWidth="1px"
                  borderColor={bubbleBorderColor}
                  borderRadius="xl"
                  borderBottomLeftRadius="sm"
                  minH="48px"
                  display="flex"
                  alignItems="center"
                >
                  <HStack spacing={3} align="center">
                    <Spinner size="sm" thickness="2px" flexShrink={0} />
                    <Text fontSize="sm" color={textColor} lineHeight="1.5">
                      {TYPING_INDICATOR_TEXT}
                    </Text>
                    <TypingDots />
                  </HStack>
                </Box>
              </HStack>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        <Box px={{ base: 4, md: 5 }} py={2.5} borderTop="1px" borderColor={cardBorderColor} bg={railBg}>
          <HStack justify="space-between" align="center" gap={3} flexWrap="wrap">
            <Text fontSize="xs" color={subTextColor}>
              {messages.filter((message) => message.type === 'user').length} prompts in this conversation
            </Text>
            <HStack spacing={1}>
              <IconButton
                aria-label="Older conversation"
                size="xs"
                icon={<FiChevronLeft />}
                variant="ghost"
                isDisabled={conversations.length < 2}
                onClick={() => {
                  const currentIndex = conversations.findIndex((conversation) => conversation.id === activeConversationId);
                  if (currentIndex < conversations.length - 1) {
                    setActiveConversationId(conversations[currentIndex + 1].id);
                  }
                }}
              />
              <IconButton
                aria-label="Newer conversation"
                size="xs"
                icon={<FiChevronRight />}
                variant="ghost"
                isDisabled={conversations.length < 2}
                onClick={() => {
                  const currentIndex = conversations.findIndex((conversation) => conversation.id === activeConversationId);
                  if (currentIndex > 0) {
                    setActiveConversationId(conversations[currentIndex - 1].id);
                  }
                }}
              />
            </HStack>
          </HStack>
        </Box>

        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={() => sendMessage(inputMessage)}
          isLoading={isLoading}
        />
      </CardBody>
    </Card>
  );
});

export default AIFitnessChat;
