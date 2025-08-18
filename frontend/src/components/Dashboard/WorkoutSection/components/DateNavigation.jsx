import React from 'react';
import {
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { formatDate } from '../utils/workoutUtils';

const DateNavigation = ({ selectedDate, onPreviousDay, onNextDay, onToday }) => {
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'white');
  const formattedDate = formatDate(selectedDate);

  return (
    <VStack spacing={3}>
      <Text fontSize="sm" color={subTextColor} fontWeight="medium">
        Viewing Date
      </Text>
      <HStack spacing={4} align="center">
        <IconButton
          icon={<ChevronLeftIcon />}
          size="sm"
          variant="ghost"
          colorScheme="blue"
          onClick={onPreviousDay}
          aria-label="Previous day"
          _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
        />
        
        <VStack spacing={1} minW="120px">
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            {formattedDate.full}
          </Text>
          <Text fontSize="xs" color={subTextColor}>
            {formattedDate.year}
          </Text>
        </VStack>

        <IconButton
          icon={<ChevronRightIcon />}
          size="sm"
          variant="ghost"
          colorScheme="blue"
          onClick={onNextDay}
          aria-label="Next day"
          _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
        />
      </HStack>
      
      <Button
        size="xs"
        variant="ghost"
        colorScheme="blue"
        onClick={onToday}
        fontSize="xs"
        _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
      >
        Today
      </Button>
    </VStack>
  );
};

export default DateNavigation;
