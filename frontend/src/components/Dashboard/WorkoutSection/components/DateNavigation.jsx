import React from 'react';
import {
  HStack,
  Text,
  IconButton,
  Button,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { formatDate } from '../utils/workoutUtils';

const DateNavigation = ({ selectedDate, onPreviousDay, onNextDay, onToday }) => {
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('gray.50', 'whiteAlpha.50');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const formattedDate = formatDate(selectedDate);

  return (
    <HStack
      justify="space-between"
      align={{ base: 'start', md: 'center' }}
      flexWrap="wrap"
      gap={3}
      p={3}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      bg={bgColor}
    >
      <HStack spacing={3} align="center">
        <IconButton
          icon={<ChevronLeftIcon />}
          size="sm"
          variant="ghost"
          colorScheme="blue"
          onClick={onPreviousDay}
          aria-label="Previous day"
          _hover={{ bg: hoverBg }}
        />

        <Box minW="140px">
          <Text fontSize="xs" color={subTextColor} fontWeight="700" textTransform="uppercase" letterSpacing="wide">
            Viewing Date
          </Text>
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            {formattedDate.full}
          </Text>
          <Text fontSize="xs" color={subTextColor}>
            {formattedDate.year}
          </Text>
        </Box>

        <IconButton
          icon={<ChevronRightIcon />}
          size="sm"
          variant="ghost"
          colorScheme="blue"
          onClick={onNextDay}
          aria-label="Next day"
          _hover={{ bg: hoverBg }}
        />
      </HStack>

      <Button
        size="sm"
        variant="outline"
        colorScheme="blue"
        onClick={onToday}
        borderRadius="full"
      >
        Today
      </Button>
    </HStack>
  );
};

export default DateNavigation;
