import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';

/**
 * Slide-in panel for quick actions (check in, log a meal or workout):
 * a bottom sheet on phones, a side panel on larger screens.
 */
export default function QuickPanel({ isOpen, onClose, title, description, children }) {
  const placement = useBreakpointValue({ base: 'bottom', md: 'right' }) || 'right';
  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement={placement} size="md" returnFocusOnClose>
      <DrawerOverlay />
      <DrawerContent
        borderTopRadius={{ base: 'panel', md: 0 }}
        maxH={{ base: '92vh', md: '100vh' }}
        pb="env(safe-area-inset-bottom)"
      >
        <DrawerCloseButton top={4} />
        <DrawerHeader pr={12} pb={1}>
          <Text as="span" fontFamily="heading" fontWeight="800" fontSize="3xl" lineHeight="1">{title}</Text>
          {description && <Text fontSize="sm" fontWeight="400" color="fg.muted" mt={2}>{description}</Text>}
        </DrawerHeader>
        <DrawerBody pb={6} pt={4}>{children}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
