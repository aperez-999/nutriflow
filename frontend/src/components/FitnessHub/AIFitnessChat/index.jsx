import { useState, useRef, useEffect, useContext, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Flex,
  Card,
  CardBody,
  Text,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
} from '@chakra-ui/react';
import { FiMoreHorizontal, FiPlus } from 'react-icons/fi';
import { AuthContext } from '../../../context/AuthContext';
import { aiChat, saveChatHistory, loadChatHistory, clearChatHistory, normalizeChatMessage, sanitizeChatMessages } from '../../../services/api';
import { ChatInput, ChatMessage, TypingDots } from './components';
import { WELCOME_MESSAGE, CLEAR_MESSAGE, QUICK_ACTIONS, QUICK_ACTION_LABELS, CHAT_ACTION_BUTTON_PROPS, TYPING_INDICATOR_TEXT } from './constants';
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

const normalizeStoredMessages = (messages = [], conversationKey = 'conversation') => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.reduce((acc, message, index) => {
    const normalized = normalizeChatMessage(message, 'type');
    if (!normalized) {
      return acc;
    }

    acc.push({
      id: typeof message?.id === 'string' && message.id.trim() ? message.id : `${conversationKey}-message-${index + 1}`,
      type: normalized.type === 'assistant' ? 'ai' : 'user',
      content: normalized.content,
      timestamp: message?.timestamp ? new Date(message.timestamp) : new Date(),
      suggestions: Array.isArray(message?.suggestions)
        ? message.suggestions.filter((suggestion) => typeof suggestion === 'string' && suggestion.trim()).slice(0, 8)
        : [],
    });
    return acc;
  }, []);
};

const normalizeStoredConversations = (conversations = [], userKey = 'anonymous') => {
  if (!Array.isArray(conversations)) {
    return [];
  }

  return conversations.reduce((acc, conversation, index) => {
    const normalizedMessages = normalizeStoredMessages(conversation?.messages, `${userKey}-${index + 1}`);
    if (normalizedMessages.length === 0) {
      return acc;
    }

    acc.push({
      id: typeof conversation?.id === 'string' && conversation.id.trim()
        ? conversation.id
        : `conversation-${userKey}-${index + 1}`,
      title: typeof conversation?.title === 'string' && conversation.title.trim()
        ? conversation.title.trim()
        : getConversationTitle(normalizedMessages, 'New chat'),
      updatedAt: typeof conversation?.updatedAt === 'string' && conversation.updatedAt.trim()
        ? conversation.updatedAt
        : new Date().toISOString(),
      messages: normalizedMessages,
    });
    return acc;
  }, []);
};

const processChatHistoryQueue = async (state, toast) => {
  if (state.inFlight) return;

  state.inFlight = true;
  try {
    while (state.queued) {
      const payload = state.queued;
      state.queued = null;

      try {
        await saveChatHistory(payload);
      } catch (err) {
        handleApiError(err, 'saving chat history', toast);
      }
    }
  } finally {
    state.inFlight = false;
    if (state.queued) {
      void processChatHistoryQueue(state, toast);
    }
  }
};

const AIFitnessChat = forwardRef(({ userWorkouts = [], userDiets = [], toast }, ref) => {
  const [conversations, setConversations] = useState([createConversation()]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const suppressSaveRef = useRef(false);
  const chatHistorySaveRef = useRef({ inFlight: false, queued: null });

  const { user } = useContext(AuthContext);
  const storageUserId = user?.user?._id || user?._id || user?.result?._id || 'anonymous';


  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || conversations[0],
    [activeConversationId, conversations]
  );
  const messages = useMemo(
    () => activeConversation?.messages || [WELCOME_MESSAGE],
    [activeConversation?.messages]
  );

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

  const updateConversationById = useCallback((conversationId, updater) => {
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;
        const nextMessages = typeof updater === 'function' ? updater(conversation.messages) : updater;
        return {
          ...conversation,
          messages: nextMessages,
          updatedAt: new Date().toISOString(),
          title: getConversationTitle(nextMessages, conversation.title),
        };
      })
    );
  }, []);

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

  // Runs again in StrictMode development; the cancelled flag (not a run-once ref) keeps
  // the second run from being skipped while the first run's late result is ignored.
  useEffect(() => {
    let cancelled = false;

    const loadInitialState = async () => {
      try {
        const localRaw = window.localStorage.getItem(`${CHAT_THREADS_STORAGE_KEY}.${storageUserId}`);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed?.conversations) && parsed.conversations.length > 0) {
            const normalizedConversations = normalizeStoredConversations(parsed.conversations, storageUserId);
            if (cancelled) return;
            if (normalizedConversations.length > 0) {
              setConversations(normalizedConversations);
              setActiveConversationId(
                normalizedConversations.some((conversation) => conversation.id === parsed.activeConversationId)
                  ? parsed.activeConversationId
                  : normalizedConversations[0].id
              );
              return;
            }
          }
        }

        const serverHistory = await loadChatHistory(40);
        if (cancelled) return;
        suppressSaveRef.current = true;

        if (Array.isArray(serverHistory) && serverHistory.length) {
          const hydrated = serverHistory.reduce((acc, message, index) => {
            const normalized = normalizeChatMessage(message, 'type');
            if (!normalized) {
              return acc;
            }

            acc.push({
              id: `server-${index + 1}`,
              type: normalized.type === 'assistant' ? 'ai' : 'user',
              content: normalized.content,
              timestamp: new Date(message?.createdAt || Date.now()),
              suggestions: Array.isArray(message?.suggestions)
                ? message.suggestions.filter((suggestion) => typeof suggestion === 'string' && suggestion.trim()).slice(0, 8)
                : [],
            });
            return acc;
          }, []);
          const importedConversation = createConversation('Imported chat', hydrated);
          setConversations([importedConversation]);
          setActiveConversationId(importedConversation.id);
        } else {
          const starterConversation = createConversation();
          setConversations([starterConversation]);
          setActiveConversationId(starterConversation.id);
        }
      } catch (err) {
        if (cancelled) return;
        handleApiError(err, 'loading chat history', toast);
        const starterConversation = createConversation();
        setConversations([starterConversation]);
        setActiveConversationId(starterConversation.id);
      } finally {
        if (!cancelled) {
          suppressSaveRef.current = false;
        }
      }
    };

    loadInitialState();

    return () => {
      cancelled = true;
    };
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

  const queueChatHistorySave = useCallback((payload) => {
    chatHistorySaveRef.current.queued = payload;
    void processChatHistoryQueue(chatHistorySaveRef.current, toast);
  }, [toast]);

  useEffect(() => {
    if (suppressSaveRef.current || !activeConversationId) return;

    const onlyWelcome = messages.length === 1 && messages[0]?.id?.startsWith('welcome');
    if (onlyWelcome) return;

    const toSave = sanitizeChatMessages(messages, 'role');
    if (toSave.length === 0) return;
    queueChatHistorySave(toSave);
  }, [activeConversationId, messages, queueChatHistorySave]);

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

      const history = sanitizeChatMessages(historyMessages, 'type');
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

    const sourceConversationId = activeConversationId;
    const userMessage = createUserMessage(displayText);
    const nextMessages = [...messages, userMessage];
    updateActiveConversation(nextMessages);
    setInputMessage('');

    try {
      const aiResponse = await generateAIResponse(promptText, nextMessages);
      const aiMessage = createAIMessage(aiResponse.content, aiResponse.suggestions);
      updateConversationById(sourceConversationId, (currentMessages) => [...currentMessages, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      window.dispatchEvent(new CustomEvent('ai-recommendations-updated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('ai-meal-plan-updated', { detail: null }));
      updateConversationById(sourceConversationId, (currentMessages) => [...currentMessages, createErrorMessage()]);
    }
  }, [activeConversationId, generateAIResponse, messages, updateActiveConversation, updateConversationById]);

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
    <Card w="100%" maxW="100%" h={{ base: '72vh', md: '680px' }} minH="480px" display="flex" flexDirection="column" overflow="hidden">
      <CardBody p={0} display="flex" flexDirection="column" height="100%">
        <Flex px={{ base: 3, md: 4 }} py={3} gap={2} align="center" borderBottomWidth="1px" borderColor="border">
          <Select
            value={activeConversationId || ''}
            onChange={(e) => setActiveConversationId(e.target.value)}
            size="sm"
            maxW={{ base: '100%', md: '320px' }}
            aria-label="Conversation"
          >
            {conversations.map((conversation) => (
              <option key={conversation.id} value={conversation.id}>
                {conversation.title}
              </option>
            ))}
          </Select>
          <Button size="sm" leftIcon={<FiPlus />} variant="outline" onClick={startNewConversation} flexShrink={0}>
            New chat
          </Button>
          <Menu placement="bottom-end">
            <MenuButton as={IconButton} size="sm" variant="ghost" icon={<FiMoreHorizontal />} aria-label="Conversation options" ml="auto" />
            <MenuList fontSize="sm">
              <MenuItem onClick={clearCurrentConversation}>Clear messages</MenuItem>
              <MenuItem onClick={deleteCurrentConversation} color="red.500">Delete conversation</MenuItem>
            </MenuList>
          </Menu>
        </Flex>

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
          aria-live="polite"
        >
          <VStack spacing={5} align="stretch">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSuggestionClick={handleActionClick}
              />
            ))}

            {isLoading && (
              <HStack spacing={2} color="fg.muted" fontSize="sm">
                <Text>{TYPING_INDICATOR_TEXT}</Text>
                <TypingDots />
              </HStack>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        {/* Side-scrolls on phones, wraps on wider screens so no suggestion is cut off. */}
        <Flex
          gap={2}
          px={{ base: 3, md: 4 }}
          pb={2}
          flexWrap={{ base: 'nowrap', md: 'wrap' }}
          overflowX={{ base: 'auto', md: 'visible' }}
          sx={{ scrollbarWidth: 'none' }}
        >
          {QUICK_ACTIONS.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              flexShrink={0}
              {...CHAT_ACTION_BUTTON_PROPS}
              onClick={() => handleActionClick(suggestion)}
              isDisabled={isLoading}
            >
              {QUICK_ACTION_LABELS[suggestion] || suggestion}
            </Button>
          ))}
        </Flex>

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

AIFitnessChat.displayName = 'AIFitnessChat';

export default AIFitnessChat;
