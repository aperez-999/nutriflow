import React from 'react';
import {
  Flex,
  HStack,
  VStack,
  Text,
  Avatar,
  IconButton,
  Tooltip,
  Switch,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCpu, FiRefreshCw } from 'react-icons/fi';

const ChatHeader = ({ onClear, autoScroll, onAutoScrollChange }) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Flex p={4} borderBottom="1px" borderColor={borderColor} align="center" justify="space-between">
      <HStack spacing={3}>
        <Avatar size="sm" bg="blue.500" icon={<FiCpu />} />
        <VStack spacing={0} align="start">
          <Text fontWeight="bold" color={textColor}>AI Fitness Coach</Text>
          <Text fontSize="xs" color={subTextColor}>Always here to help! 🤖</Text>
        </VStack>
      </HStack>
      <HStack spacing={4}>
        <HStack spacing={2} align="center">
          <Text fontSize="xs" color={subTextColor}>Auto-scroll</Text>
          <Switch 
            size="sm" 
            isChecked={autoScroll} 
            onChange={(e) => onAutoScrollChange(e.target.checked)} 
          />
        </HStack>
        <Tooltip label="Clear chat">
          <IconButton
            icon={<FiRefreshCw />}
            size="sm"
            variant="ghost"
            onClick={onClear}
            aria-label="Clear chat"
          />
        </Tooltip>
      </HStack>
    </Flex>
  );
};

export default ChatHeader;
