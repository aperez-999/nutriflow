import React from 'react';
import {
  Flex,
  HStack,
  VStack,
  Text,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCpu, FiRefreshCw } from 'react-icons/fi';

const ChatHeader = ({ onClear }) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('white', 'gray.700');
  const statusBg = useColorModeValue('green.50', 'green.900');

  return (
    <Flex
      px={{ base: 4, md: 5 }}
      py={4}
      borderBottom="1px"
      borderColor={borderColor}
      align={{ base: 'flex-start', md: 'center' }}
      justify="space-between"
      direction={{ base: 'column', md: 'row' }}
      gap={3}
      bg={headerBg}
      borderTopRadius="xl"
    >
      <HStack spacing={3} align="start">
        <Avatar size="sm" bg="teal.500" color="white" icon={<FiCpu size={14} />} />
        <VStack spacing={0} align="start">
          <HStack spacing={2} flexWrap="wrap">
            <Text fontWeight="600" fontSize="sm" color={textColor}>AI Fitness Coach</Text>
            <Badge colorScheme="green" variant="subtle" borderRadius="full">
              Live
            </Badge>
          </HStack>
          <Text fontSize="xs" color={subTextColor}>
            Ask for plans, recovery ideas, nutrition support, or progress reviews
          </Text>
        </VStack>
      </HStack>
      <HStack
        spacing={3}
        w={{ base: '100%', md: 'auto' }}
        justify={{ base: 'space-between', md: 'flex-end' }}
        flexShrink={0}
      >
        <Badge
          display={{ base: 'none', md: 'inline-flex' }}
          variant="subtle"
          colorScheme="green"
          borderRadius="full"
          px={3}
          py={1}
          bg={statusBg}
        >
          Auto-scroll on
        </Badge>
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
