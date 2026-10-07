import {
  HStack,
  Text,
  IconButton,
  Button,
  Box,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { formatDate } from '../utils/dietUtils';

const DateNavigation = ({ selectedDate, onPreviousDay, onNextDay, onToday }) => {
  const subTextColor = 'fg.muted';
  const textColor = 'fg';
  const bgColor = 'bg.muted';
  const borderColor = 'border';
  const hoverBg = 'bg.muted';
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
          colorScheme="teal"
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
          colorScheme="teal"
          onClick={onNextDay}
          aria-label="Next day"
          _hover={{ bg: hoverBg }}
        />
      </HStack>

      <Button
        size="sm"
        variant="outline"
        colorScheme="teal"
        onClick={onToday}
        borderRadius="full"
      >
        Today
      </Button>
    </HStack>
  );
};

export default DateNavigation;
