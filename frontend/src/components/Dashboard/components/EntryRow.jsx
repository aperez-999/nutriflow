import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverTrigger,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

/** Delete with a one-step confirmation so a stray tap cannot lose a log. */
function ConfirmDeleteButton({ label, onConfirm }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement="bottom-end" isLazy>
      <PopoverTrigger>
        <IconButton size="sm" variant="ghost" aria-label={`Delete ${label}`} icon={<FiTrash2 />} color="fg.muted" />
      </PopoverTrigger>
      <PopoverContent w="240px" bg="bg.surface" borderColor="border" boxShadow="overlay">
        <PopoverArrow bg="bg.surface" />
        <PopoverBody fontSize="sm">Delete “{label}”? This can’t be undone.</PopoverBody>
        <PopoverFooter display="flex" justifyContent="flex-end" gap={2} borderColor="border">
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="red" onClick={() => { onClose(); onConfirm(); }}>Delete</Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

/**
 * One logged meal or session: name and context on the left, the numbers that
 * matter on the right, then edit / delete.
 */
function EntryRow({ title, meta, primary, secondary, notes, onEdit, onDelete }) {
  return (
    <Flex gap={4} py={3} align="flex-start" borderBottomWidth="1px" borderColor="border" _last={{ borderBottomWidth: 0 }}>
      <Box flex="1" minW={0}>
        <Text fontWeight="700" noOfLines={1}>{title}</Text>
        <Text fontSize="sm" color="fg.muted" noOfLines={1}>{meta}</Text>
        {notes && <Text fontSize="sm" color="fg.muted" mt={1} noOfLines={2}>{notes}</Text>}
      </Box>
      <Box textAlign="right" flexShrink={0}>
        <Text fontWeight="700" sx={{ fontVariantNumeric: 'tabular-nums' }}>{primary}</Text>
        {secondary && <Text fontSize="sm" color="fg.muted" sx={{ fontVariantNumeric: 'tabular-nums' }}>{secondary}</Text>}
      </Box>
      <HStack spacing={0} flexShrink={0}>
        <IconButton size="sm" variant="ghost" aria-label={`Edit ${title}`} icon={<FiEdit2 />} color="fg.muted" onClick={onEdit} />
        <ConfirmDeleteButton label={title} onConfirm={onDelete} />
      </HStack>
    </Flex>
  );
}

export default EntryRow;
