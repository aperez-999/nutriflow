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
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCpu, FiRefreshCw } from 'react-icons/fi';

const ChatHeader = ({ onClear, autoScroll, onAutoScrollChange }) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('white', 'gray.700');

  return (
    <Flex
      px={5}
      py={4}
      borderBottom="1px"
      borderColor={borderColor}
      align="center"
      justify="space-between"
      bg={headerBg}
      borderTopRadius="xl"
    >
      <HStack spacing={3}>
        <Avatar size="sm" bg="teal.500" color="white" icon={<FiCpu size={14} />} />
        <VStack spacing={0} align="start">
          <HStack spacing={2}>
            <Text fontWeight="600" fontSize="sm" color={textColor}>AI Fitness Coach</Text>
            <Badge colorScheme="green" variant="subtle" borderRadius="full">
              Live
            </Badge>
          </HStack>
          <Text fontSize="xs" color={subTextColor}>Ask for plans, recovery ideas, nutrition support, or progress reviews</Text>
        </VStack>
      </HStack>
      <HStack spacing={4}>
        <HStack spacing={2} align="center">
          <Text fontSize="xs" color={subTextColor}>Auto-scroll</Text>
          <Switch
            size="sm"
            isChecked={autoScroll}
            onChange={(e) => onAutoScrollChange(e.target.checked)}
            colorScheme="teal"
          />
        </HStack>
        <Tooltip label="Clear chat" placement="bottom">
          <IconButton
            icon={<FiRefreshCw size={14} />}
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
