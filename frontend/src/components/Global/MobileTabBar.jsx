import { useContext } from 'react';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiBookOpen, FiMessageCircle, FiSun, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { DURATION, EASE_OUT } from '../Motion/tokens';

const MotionBox = motion(Box);

export const TAB_BAR_HEIGHT = '64px';

const TABS = [
  { label: 'Today', icon: FiSun, to: '/dashboard', isActive: (path) => path === '/dashboard' },
  { label: 'Coach', icon: FiMessageCircle, to: '/fitness-hub', isActive: (path) => path === '/fitness-hub' },
  { label: 'Library', icon: FiBookOpen, to: '/library', isActive: (path) => path === '/library' },
  { label: 'Me', icon: FiUser, to: '/profile', isActive: (path) => path === '/profile' || path === '/settings' },
];

/**
 * App-style bottom navigation for signed-in users on small screens.
 */
export default function MobileTabBar() {
  const { user } = useContext(AuthContext);
  const { pathname, hash } = useLocation();

  if (!user) return null;

  return (
    <Box
      as="nav"
      aria-label="Primary"
      display={{ base: 'block', md: 'none' }}
      position="fixed"
      insetX={0}
      bottom={0}
      zIndex="tabBar"
      bg="bg.surface"
      borderTopWidth="1px"
      borderColor="border"
      pb="env(safe-area-inset-bottom)"
    >
      <Flex h={TAB_BAR_HEIGHT} align="stretch" justify="space-around" maxW="560px" mx="auto">
        {TABS.map((tab) => {
          const active = tab.isActive(pathname, hash);
          return (
            <Flex
              key={tab.label}
              as={RouterLink}
              to={tab.to}
              aria-current={active ? 'page' : undefined}
              data-guide={tab.to === '/fitness-hub' ? 'coach' : undefined}
              flex="1"
              direction="column"
              align="center"
              justify="center"
              gap={1}
              position="relative"
              color={active ? 'fg' : 'fg.muted'}
              transition="color 0.15s ease"
              _focusVisible={{ outline: '2px solid', outlineColor: 'focus.ring', outlineOffset: '-4px', borderRadius: 'md' }}
            >
              {active && (
                <MotionBox
                  layoutId="tab-active"
                  position="absolute"
                  top={0}
                  w="28px"
                  h="3px"
                  borderBottomRadius="3px"
                  bg="currentColor"
                  transition={{ duration: DURATION.base, ease: EASE_OUT }}
                />
              )}
              <Icon as={tab.icon} boxSize={5} strokeWidth={active ? 2.5 : 2} />
              <Text fontSize="11px" fontWeight={active ? 700 : 500}>{tab.label}</Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
}
