import { useState, useRef, useEffect, useContext, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  Flex,
  Card,
  CardBody,
  Grid,
  Text,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  useToast,
} from '@chakra-ui/react';
import { FiMoreHorizontal, FiPlus } from 'react-icons/fi';
import { AuthContext } from '../../../context/AuthContext';
import {
  aiChat,
  loadChatHistory,
  normalizeChatMessage,
  sanitizeChatMessages,
  getConversations,
  saveConversation,
  deleteConversation,
} from '../../../services/api';
import { mergeWithServer } from '../../../utils/serverSync';
import useServerSync from '../../../utils/useServerSync';
import { ChatEmptyState, ChatInput, ChatMessage, ConversationList, TypingIndicator } from './components';
import { WELCOME_MESSAGE, CLEAR_MESSAGE, QUICK_ACTION_LABELS, TYPING_INDICATOR_TEXT } from './constants';
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
  const text = firstUserMessage.content.trim();
  if (text.length <= 40) return text;
  // Cut at a word boundary so titles never end mid-word.
  const cut = text.slice(0, 40);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 20 ? cut.lastIndexOf(' ') : 40).trimEnd()}…`;
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

const MAX_SYNCED_MESSAGES = 100;
const isWelcome = (message) => Boolean(message?.id?.startsWith('welcome'));
const byLatest = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);

/**
 * What the server stores for a conversation: its real messages (never the built-in welcome),
 * trimmed and capped exactly as the server does, so an unchanged conversation compares equal.
 */
const toWireConversation = (conversation) => ({
  title: conversation.title,
  updatedAt: conversation.updatedAt,
  messages: conversation.messages
    .filter((message) => !isWelcome(message) && String(message.content || '').trim())
    .slice(-MAX_SYNCED_MESSAGES)
    .map((message) => {
      const suggestions = (message.suggestions || [])
        .filter((suggestion) => typeof suggestion === 'string' && suggestion.trim())
        .map((suggestion) => suggestion.trim().slice(0, 120))
        .slice(0, 8);
      return {
        role: message.type === 'user' ? 'user' : 'assistant',
        content: String(message.content).trim().slice(0, 4000),
        ...(suggestions.length && { suggestions }),
        createdAt: new Date(message.timestamp || Date.now()).toISOString(),
      };
    }),
});

const fromServerConversation = (conversation) => ({
  id: conversation.id,
  title: conversation.title,
  updatedAt: conversation.updatedAt,
  messages: [
    WELCOME_MESSAGE,
    ...conversation.messages.map((message, index) => ({
      id: `${conversation.id}-m${index}`,
      type: message.role === 'user' ? 'user' : 'ai',
      content: message.content,
      suggestions: message.suggestions || [],
      timestamp: new Date(message.createdAt),
    })),
  ],
});

/** Both devices have the conversation: keep the copy with the latest message. */
const newerConversation = (server, local) => (new Date(local.updatedAt) >= new Date(server.updatedAt) ? local : server);

const readStoredThreads = (storageUserId) => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(`${CHAT_THREADS_STORAGE_KEY}.${storageUserId}`) || 'null');
    return {
      conversations: normalizeStoredConversations(parsed?.conversations, storageUserId),
      activeConversationId: parsed?.activeConversationId || null,
      syncedIds: Array.isArray(parsed?.syncedIds) ? parsed.syncedIds : [],
    };
  } catch {
    return { conversations: [], activeConversationId: null, syncedIds: [] };
  }
};

/** The single saved conversation older versions kept on the server, as one conversation. */
const conversationFromLegacyHistory = (history) => {
  if (!Array.isArray(history) || history.length === 0) return null;
  const messages = history.reduce((acc, message, index) => {
    const normalized = normalizeChatMessage(message, 'type');
    if (normalized) {
      acc.push({
        id: `server-${index + 1}`,
        type: normalized.type === 'assistant' ? 'ai' : 'user',
        content: normalized.content,
        timestamp: new Date(message?.createdAt || Date.now()),
        suggestions: [],
      });
    }
    return acc;
  }, []);
  return messages.length ? createConversation(getConversationTitle(messages, 'Earlier chat'), [WELCOME_MESSAGE, ...messages]) : null;
};

const AIFitnessChat = forwardRef(({ userWorkouts = [], userDiets = [], readiness, initialPrompt, onPromptConsumed }, ref) => {
  const [conversations, setConversations] = useState([createConversation()]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  // Server sync (see utils/useServerSync): what the server last confirmed, whether the
  // first load finished, and the ids this browser had synced before this visit.
  const syncedRef = useRef(new Map());
  const storedSyncedIdsRef = useRef([]);
  const [serverReady, setServerReady] = useState(false);
  const handledPromptRef = useRef(null);
  const pendingPromptRef = useRef(null);

  const { user } = useContext(AuthContext);
  const toast = useToast();
  const storageUserId = user?.user?._id || user?._id || user?.result?._id || 'anonymous';


  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || conversations[0],
    [activeConversationId, conversations]
  );
  const messages = useMemo(
    () => activeConversation?.messages || [WELCOME_MESSAGE],
    [activeConversation?.messages]
  );
  const isFresh = messages.every((message) => message?.id?.startsWith('welcome'));

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
    // A fresh conversation shows the prompt cards from the top.
    if (isFresh && !isLoading) {
      messagesContainerRef.current?.scrollTo({ top: 0 });
      return undefined;
    }
    const behavior = messages.length <= 1 ? 'auto' : 'smooth';
    const last = messages[messages.length - 1];
    const frame = window.requestAnimationFrame(() => {
      // A new coach reply is shown from its first line, so a long answer reads top-down
      // instead of landing on its last paragraph. Sent messages and "thinking" go to the bottom.
      const reply = !isLoading && last?.type === 'ai' && messagesContainerRef.current
        ?.querySelector(`[data-message-id="${last.id}"]`);
      if (reply) {
        messagesContainerRef.current.scrollTo({ top: Math.max(reply.offsetTop - 12, 0), behavior });
      } else {
        scrollToBottom(behavior);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeConversationId, isFresh, isLoading, messages, scrollToBottom]);

  // Show this browser's conversations at once, then merge in the account's. Runs again in
  // StrictMode development; the cancelled flag ignores the first run's late result.
  useEffect(() => {
    let cancelled = false;
    const local = readStoredThreads(storageUserId);
    storedSyncedIdsRef.current = local.syncedIds;
    const starter = local.conversations.length ? null : createConversation();
    setConversations(local.conversations.length ? local.conversations : [starter]);
    setActiveConversationId(
      local.conversations.some((conversation) => conversation.id === local.activeConversationId)
        ? local.activeConversationId
        : (local.conversations[0] || starter).id
    );

    const loadAccount = async () => {
      try {
        const { conversations: serverConversations = [] } = await getConversations();
        if (cancelled) return;
        const fromServer = serverConversations.map(fromServerConversation);
        fromServer.forEach((conversation) => syncedRef.current.set(conversation.id, JSON.stringify(toWireConversation(conversation))));

        // An account from before conversations were synced: bring its one saved chat over.
        const hasLocalChats = local.conversations.some((conversation) => conversation.messages.some((m) => !isWelcome(m)));
        const legacy = !fromServer.length && !hasLocalChats
          ? conversationFromLegacyHistory(await loadChatHistory(40).catch(() => []))
          : null;
        if (cancelled) return;

        const fromAccount = legacy ? [...fromServer, legacy] : fromServer;
        setConversations((current) => {
          // An untouched starter chat gives way to the account's conversations, so the most
          // recent one opens (the active-conversation effect below picks it).
          const untouchedStarter = current.length === 1 && current[0].messages.every(isWelcome);
          const base = untouchedStarter && fromAccount.length ? [] : current;
          const merged = mergeWithServer(fromAccount, base, local.syncedIds, newerConversation).sort(byLatest);
          return merged.length ? merged : [createConversation()];
        });
        setServerReady(true);
      } catch {
        // Offline or the server failed: keep working from this browser's copy.
      }
    };
    loadAccount();

    return () => {
      cancelled = true;
    };
  }, [storageUserId]);

  // The active conversation may have been dropped by the merge (deleted on another device).
  useEffect(() => {
    if (conversations.length && !conversations.some((conversation) => conversation.id === activeConversationId)) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations]);

  // Save changed conversations to the account; empty ones (only the welcome) are not kept.
  const syncEntries = useMemo(
    () => conversations
      .filter((conversation) => conversation.messages.some((message) => !isWelcome(message)))
      .map((conversation) => ({ id: conversation.id, wire: toWireConversation(conversation) })),
    [conversations]
  );
  const syncVersion = useServerSync({
    ready: serverReady,
    entries: syncEntries,
    syncedRef,
    save: saveConversation,
    remove: deleteConversation,
  });

  useEffect(() => {
    if (!activeConversationId) return;
    try {
      window.localStorage.setItem(
        `${CHAT_THREADS_STORAGE_KEY}.${storageUserId}`,
        JSON.stringify({
          conversations,
          activeConversationId,
          syncedIds: serverReady ? [...syncedRef.current.keys()] : storedSyncedIdsRef.current,
        })
      );
    } catch {
      // Storage full or unavailable: the account still has the conversations.
    }
  }, [activeConversationId, conversations, serverReady, storageUserId, syncVersion]);

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
        // So the coach counts "today" on this person's calendar and talks about the verdict on screen.
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(readiness && { verdict: { level: readiness.level, score: readiness.score } }),
      };

      const history = sanitizeChatMessages(historyMessages, 'type');
      const data = await aiChat(userMessage, userContext, history);
      const offline = data?.source === 'fallback';

      if (isPlanRequest) {
        const workouts = parseAIRecommendations(data.content) || fallbackParseWorkoutPlan(data.content);
        if (workouts) {
          window.dispatchEvent(new CustomEvent('ai-recommendations-updated', { detail: workouts }));
          return {
            content: createSuccessMessage(workouts).content,
            suggestions: data.suggestions,
            parsedRecommendations: true,
            offline,
          };
        }
        return {
          content: data.content || createPlanFormattingMessage().content,
          suggestions: data.suggestions,
          parsedRecommendations: false,
          offline,
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

      if (offline || isGenericBackendFallback(data.content)) {
        const fallbackResponse = buildConversationalFallbackResponse(userMessage, userContext);
        return {
          content: fallbackResponse.content,
          suggestions: fallbackResponse.suggestions,
          parsedRecommendations: false,
          offline: true,
        };
      }

      if (data.remembered) {
        toast({
          title: 'Your coach will remember this',
          description: `${data.remembered}. See or remove it in Settings, under Your coach.`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
      return { content: data.content, suggestions: data.suggestions, parsedRecommendations: false };
    } finally {
      setIsLoading(false);
    }
  }, [userWorkouts, userDiets, user, readiness, toast]);

  const sendMessage = useCallback(async (promptText, displayText = promptText) => {
    if (!promptText.trim() || !activeConversationId) return;

    const sourceConversationId = activeConversationId;
    const userMessage = createUserMessage(displayText);
    const nextMessages = [...messages, userMessage];
    updateActiveConversation(nextMessages);
    setInputMessage('');

    try {
      const aiResponse = await generateAIResponse(promptText, nextMessages);
      const aiMessage = createAIMessage(aiResponse.content, aiResponse.suggestions, aiResponse.offline);
      updateConversationById(sourceConversationId, (currentMessages) => [...currentMessages, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      window.dispatchEvent(new CustomEvent('ai-recommendations-updated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('ai-meal-plan-updated', { detail: null }));
      updateConversationById(sourceConversationId, (currentMessages) => [...currentMessages, createErrorMessage()]);
    }
  }, [activeConversationId, generateAIResponse, messages, updateActiveConversation, updateConversationById]);

  const handleActionClick = useCallback((label) => {
    sendMessage(resolveAssistantActionPrompt(label), QUICK_ACTION_LABELS[label] || label);
  }, [sendMessage]);

  const startNewConversation = useCallback(() => {
    const newConversation = createConversation();
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setInputMessage('');
  }, []);

  // An emptied conversation has nothing to keep, so the sync removes it from the account.
  const clearCurrentConversation = useCallback(() => {
    updateActiveConversation([CLEAR_MESSAGE]);
  }, [updateActiveConversation]);

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

  // A question handed over from another page (e.g. "Ask Coach about this" in the Library)
  // opens its own conversation once the stored ones have loaded. The ref keeps
  // StrictMode's second effect run from sending it twice.
  useEffect(() => {
    if (!initialPrompt || !activeConversationId || handledPromptRef.current === initialPrompt) return;
    handledPromptRef.current = initialPrompt;
    const conversation = createConversation();
    pendingPromptRef.current = { text: initialPrompt, conversationId: conversation.id };
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
    onPromptConsumed?.();
  }, [activeConversationId, initialPrompt, onPromptConsumed]);

  // Sends the handed-over question once its new conversation is the active one.
  useEffect(() => {
    const pending = pendingPromptRef.current;
    if (!pending || pending.conversationId !== activeConversationId) return;
    pendingPromptRef.current = null;
    sendMessage(pending.text);
  }, [activeConversationId, sendMessage]);

  useImperativeHandle(ref, () => ({
    // Ignored mid-answer, like the in-chat quick actions.
    send: (text) => { if (!isLoading) sendMessage(text); },
    clear: clearCurrentConversation,
  }));

  return (
    <Card w="100%" maxW="100%" h={{ base: '74vh', md: '720px' }} minH="500px" overflow="hidden">
      <Grid as={CardBody} p={0} h="100%" minH={0} templateColumns={{ base: 'minmax(0, 1fr)', lg: '232px minmax(0, 1fr)' }}>
        <Box display={{ base: 'none', lg: 'block' }} borderRightWidth="1px" borderColor="border" bg="bg.canvas" minH={0}>
          <ConversationList
            conversations={conversations}
            activeId={activeConversation?.id}
            onSelect={setActiveConversationId}
            onNew={startNewConversation}
          />
        </Box>

        <Flex direction="column" minH={0} minW={0}>
          <Flex px={{ base: 3, md: 4 }} py={3} gap={2} align="center" borderBottomWidth="1px" borderColor="border">
            {/* Phones and tablets pick conversations here; desktop uses the sidebar. */}
            <Select
              display={{ base: 'block', lg: 'none' }}
              value={activeConversation?.id || ''}
              onChange={(e) => setActiveConversationId(e.target.value)}
              size="sm"
              aria-label="Conversation"
            >
              {conversations.map((conversation) => (
                <option key={conversation.id} value={conversation.id}>
                  {conversation.title}
                </option>
              ))}
            </Select>
            <Button display={{ base: 'inline-flex', lg: 'none' }} size="sm" leftIcon={<FiPlus />} variant="outline" onClick={startNewConversation} flexShrink={0}>
              New
            </Button>
            {/* noOfLines sets its own display, so the responsive hide lives on a wrapper. */}
            <Box display={{ base: 'none', lg: 'block' }} flex="1" minW={0}>
              <Text fontWeight="700" noOfLines={1}>{activeConversation?.title || 'New chat'}</Text>
            </Box>
            <Menu placement="bottom-end">
              <MenuButton as={IconButton} size="sm" variant="ghost" icon={<FiMoreHorizontal />} aria-label="Conversation options" ml="auto" flexShrink={0} />
              <MenuList fontSize="sm">
                <MenuItem onClick={clearCurrentConversation}>Clear messages</MenuItem>
                <MenuItem onClick={deleteCurrentConversation} color="danger.fg">Delete conversation</MenuItem>
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
            {isFresh && !isLoading ? (
              <ChatEmptyState intro={messages[0]?.content} onPick={handleActionClick} isDisabled={isLoading} />
            ) : (
              <VStack spacing={6} align="stretch" maxW="760px" mx="auto">
                {messages.map((message, index) => (
                  <Box key={message.id} data-message-id={message.id}>
                    <ChatMessage
                      message={message}
                      onSuggestionClick={handleActionClick}
                      showSuggestions={index === messages.length - 1 && !isLoading}
                    />
                  </Box>
                ))}
                {isLoading && <TypingIndicator label={TYPING_INDICATOR_TEXT} />}
              </VStack>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <ChatInput
            value={inputMessage}
            onChange={setInputMessage}
            onSend={() => sendMessage(inputMessage)}
            isLoading={isLoading}
          />
        </Flex>
      </Grid>
    </Card>
  );
});

AIFitnessChat.displayName = 'AIFitnessChat';

export default AIFitnessChat;
