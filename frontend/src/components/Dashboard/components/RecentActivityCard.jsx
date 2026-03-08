import React from 'react';
import { Box, VStack, Text, HStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { FiClock, FiCoffee, FiActivity } from 'react-icons/fi';

/**
 * List of recent diet and workout entries (mixed, by date).
 */
export default function RecentActivityCard({ items }) {
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const dividerColor = useColorModeValue('gray.100', 'gray.600');
  const iconMuted = useColorModeValue('gray.500', 'gray.400');

  const formatTime = (date) => {
    const d = new Date(date);
    const today = new Date().toISOString().split('T')[0];
    const dateStr = d.toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (!items || items.length === 0) {
    return (
      <Box
        p={5}
        bg={bg}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
        height="100%"
        display="flex"
        flexDirection="column"
        _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
        transition="all 0.2s ease"
      >
        <HStack spacing={2} mb={3}>
          <Icon as={FiClock} boxSize={4} color={iconMuted} />
          <Text fontSize="sm" fontWeight="600" color={textColor}>Recent activity</Text>
        </HStack>
        <Text fontSize="sm" color={subColor}>No recent entries. Log a meal or workout to see them here.</Text>
      </Box>
    );
  }

  return (
    <Box
      p={5}
      bg={bg}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      height="100%"
      display="flex"
      flexDirection="column"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
      transition="all 0.2s ease"
    >
      <HStack spacing={2} mb={3}>
        <Icon as={FiClock} boxSize={4} color={iconMuted} />
        <Text fontSize="sm" fontWeight="600" color={textColor}>Recent activity</Text>
      </HStack>
      <VStack align="stretch" spacing={0} flex="1">
        {items.map((item) => (
          <HStack
            key={`${item.type}-${item.id}`}
            justify="space-between"
            align="center"
            fontSize="sm"
            py={3}
            borderBottomWidth="1px"
            borderColor={dividerColor}
            _last={{ borderBottom: 'none' }}
            minW={0}
          >
            <HStack spacing={3} minW={0} align="center" flex="1">
              <Icon
                as={item.type === 'diet' ? FiCoffee : FiActivity}
                boxSize={4}
                color={item.type === 'diet' ? 'orange.400' : 'blue.400'}
                flexShrink={0}
              />
              <Box minW={0} flex="1">
                <Text noOfLines={1} color={textColor} fontWeight="500">{item.label}</Text>
                <Text fontSize="xs" color={subColor}>
                  {item.sub}
                  {item.value ? (
                    <>
                      {' · '}
                      <Text as="span" fontWeight="600" color={textColor}>{item.value}</Text>
                    </>
                  ) : null}
                </Text>
              </Box>
            </HStack>
            <Text fontSize="xs" color={subColor} flexShrink={0} ml={2}>{formatTime(item.date)}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
