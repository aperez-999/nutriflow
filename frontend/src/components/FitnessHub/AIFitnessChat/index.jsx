import React, { useState, useRef, useEffect, useContext, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  VStack,
  HStack,
  Card,
  CardBody,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { AuthContext } from '../../../context/AuthContext';
import { aiChat, saveChatHistory, loadChatHistory, clearChatHistory } from '../../../services/api';
import { ChatHeader, ChatInput, ChatMessage } from './components';
import { WELCOME_MESSAGE, CLEAR_MESSAGE } from './constants';
import {
  parseAIRecommendations,
  createUserMessage,
  createAIMessage,
  createErrorMessage,
  createSuccessMessage,
} from './utils';

const AIFitnessChat = forwardRef(({ userWorkouts = [], userDiets = [] }, ref) => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const didInitRef = useRef(false);
  const suppressSaveRef = useRef(false);
  
  const { user } = useContext(AuthContext);

  const bgColor = useColorModeValue('white', 'gray.800');
  const aiBubbleColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    setIsAtBottom(atBottom);
  };

  // Hook up AI Recommendations button
  useEffect(() => {
    const handler = () => {
      const prompt = `Can you generate a personalized weekly fitness plan for me based on my recent activity and fitness level? [[RETURN_JSON_WORKOUT_PLAN]]`;
      sendMessage(prompt);
    };
    window.addEventListener('nf-ai-recommendations', handler);
    return () => window.removeEventListener('nf-ai-recommendations', handler);
  }, [userWorkouts]);

  // Load persisted history on mount
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    
    (async () => {
      try {
        const serverHistory = await loadChatHistory(40);
        suppressSaveRef.current = true;
        
        if (Array.isArray(serverHistory) && serverHistory.length) {
          const hydrated = serverHistory.map((m, idx) => ({
            id: `server-${idx + 1}`,
            type: m.role === 'user' ? 'user' : 'ai',
            content: m.content,
            timestamp: new Date(m.createdAt || Date.now()),
          }));
          
          setMessages(prev => {
            const base = prev.length && prev[0]?.id?.startsWith('welcome') ? [prev[0]] : [];
            return [...base, ...hydrated];
          });
        } else {
          setMessages([WELCOME_MESSAGE]);
        }
      } catch {
        setMessages([WELCOME_MESSAGE]);
      } finally {
        suppressSaveRef.current = false;
      }
    })();
  }, []);

  // Persist history after each AI reply
  useEffect(() => {
    if (suppressSaveRef.current) return;
    
    const nonEmpty = messages.filter(m => (m.type === 'user' || m.type === 'ai') && m.content?.trim());
    if (nonEmpty.length === 0) return;
    
    const onlyWelcome = nonEmpty.length === 1 && nonEmpty[0].id?.startsWith('welcome');
    if (onlyWelcome) return;
    
    const toSave = nonEmpty.map(m => ({ type: m.type, content: m.content }));
    saveChatHistory(toSave).catch(() => {});
  }, [messages]);

  const generateAIResponse = async (userMessage) => {
    setIsLoading(true);
    
    try {
      const userContext = {
        recentWorkouts: userWorkouts.slice(-5),
        recentDiets: userDiets.slice(-5),
        userName: user?.result?.username || user?.username || 'there',
      };
      
      const history = messages.map(m => ({ type: m.type, content: m.content }));
      const data = await aiChat(userMessage, userContext, history);
      
      const isRecommendationRequest = /\[\[RETURN_JSON_WORKOUT_PLAN\]\]/i.test(userMessage);
      if (isRecommendationRequest) {
        const workouts = parseAIRecommendations(data.content);
        if (workouts) {
          window.dispatchEvent(new CustomEvent('ai-recommendations-updated', { detail: workouts }));
          setMessages(prev => [...prev, createSuccessMessage()]);
          return { content: data.content, suggestions: data.suggestions, parsedRecommendations: true };
        }
      }
      
      return { content: data.content, suggestions: data.suggestions, parsedRecommendations: false };
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = createUserMessage(text);
    setMessages(prev => [...prev, userMessage]);

    try {
      const aiResponse = await generateAIResponse(text);
      if (!aiResponse.parsedRecommendations) {
        const aiMessage = createAIMessage(aiResponse.content, aiResponse.suggestions);
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      setMessages(prev => [...prev, createErrorMessage()]);
    }
  };

  const clearChat = async () => {
    setMessages([CLEAR_MESSAGE]);
    try { 
      await clearChatHistory(); 
      window.dispatchEvent(new CustomEvent('ai-recommendations-updated', { detail: [] }));
    } catch {}
  };

  useImperativeHandle(ref, () => ({
    send: sendMessage,
    clear: clearChat,
  }));

  return (
    <Card bg={bgColor} height="600px" display="flex" flexDirection="column">
      <CardBody p={0} display="flex" flexDirection="column" height="100%">
        <ChatHeader
          onClear={clearChat}
          autoScroll={autoScroll}
          onAutoScrollChange={setAutoScroll}
        />

        <Box 
          flex="1" 
          overflowY="auto" 
          p={4} 
          position="relative" 
          ref={messagesContainerRef} 
          onScroll={handleScroll}
        >
          <VStack spacing={4} align="stretch">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSuggestionClick={sendMessage}
              />
            ))}

            {isLoading && (
              <HStack spacing={3} alignSelf="flex-start">
                <Box bg={aiBubbleColor} px={4} py={3} borderRadius="lg" borderBottomLeftRadius="sm">
                  <HStack spacing={2}>
                    <Spinner size="sm" />
                    <Box fontSize="sm" color={textColor}>AI is thinking...</Box>
                  </HStack>
                </Box>
              </HStack>
            )}

            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={async () => {
            const text = inputMessage;
            setInputMessage('');
            await sendMessage(text);
          }}
          isLoading={isLoading}
        />
      </CardBody>
    </Card>
  );
});

export default AIFitnessChat;
