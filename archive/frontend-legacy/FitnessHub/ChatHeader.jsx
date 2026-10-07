import {
  Flex,
  HStack,
  VStack,
  Text,
  Box,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiCpu, FiRefreshCw } from 'react-icons/fi';

const ChatHeader = ({ onClear }) => {
  const textColor = 'fg';
  const subTextColor = 'fg.muted';
  const borderColor = 'border';
  const headerBg = 'bg.surface';

  return (
    <Flex
      px={{ base: 4, md: 5 }}
      py={3.5}
      borderBottom="1px"
      borderColor={borderColor}
      align="center"
      justify="space-between"
      bg={headerBg}
      borderTopRadius="xl"
    >
      <HStack spacing={3} align="center">
        {/* Gradient AI avatar */}
        <Box
          w={9}
          h={9}
          borderRadius="xl"
          bgGradient="linear(135deg, teal.400, blue.500)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          boxShadow="0 2px 8px rgba(56,178,172,0.35)"
        >
          <Box as={FiCpu} color="white" style={{ width: 16, height: 16 }} />
        </Box>

        <VStack spacing={0} align="start">
          <HStack spacing={2}>
            <Text fontWeight="700" fontSize="sm" color={textColor} letterSpacing="tight">
              AI Fitness Coach
            </Text>
            {/* Live pulse dot */}
            <HStack spacing={1} align="center">
              <Box
                w="7px"
                h="7px"
                borderRadius="full"
                bg="green.400"
                boxShadow="0 0 6px rgba(72,187,120,0.8)"
                sx={{
                  animation: 'aiPulse 2s ease-in-out infinite',
                  '@keyframes aiPulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.35 },
                  },
                }}
              />
              <Text fontSize="xs" color="green.400" fontWeight="600">
                Online
              </Text>
            </HStack>
          </HStack>
          <Text fontSize="xs" color={subTextColor} lineHeight="1.4">
            Plans · Recovery · Nutrition · Progress review
          </Text>
        </VStack>
      </HStack>

      <Tooltip label="Clear conversation" placement="bottom">
        <IconButton
          icon={<FiRefreshCw size={14} />}
          size="sm"
          variant="ghost"
          onClick={onClear}
          aria-label="Clear chat"
          borderRadius="lg"
          color={subTextColor}
        />
      </Tooltip>
    </Flex>
  );
};

export default ChatHeader;
