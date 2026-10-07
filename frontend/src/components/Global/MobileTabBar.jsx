import { useContext } from 'react';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiActivity, FiCoffee, FiMessageCircle, FiSun, FiUser } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';

export const TAB_BAR_HEIGHT = '64px';

const TABS = [
  { label: 'Today', icon: FiSun, to: '/dashboard', isActive: (path, hash) => path === '/dashboard' && !hash.startsWith('#log') },
  { label: 'Fuel', flow: 'fuel', icon: FiCoffee, to: '/dashboard#log-fuel', isActive: (path, hash) => path === '/dashboard' && hash === '#log-fuel' },
  { label: 'Train', icon: FiActivity, to: '/dashboard#log-train', isActive: (path, hash) => path === '/dashboard' && hash === '#log-train' },
  { label: 'Coach', icon: FiMessageCircle, to: '/fitness-hub', isActive: (path) => path === '/fitness-hub' },
  { label: 'Me', icon: FiUser, to: '/settings', isActive: (path) => path === '/settings' },
];

/**
 * App-style bottom navigation for signed-in users on small screens.
 * Mirrors the iOS tab bar pattern so the Capacitor build feels native.
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
      sx={{ backdropFilter: 'saturate(180%) blur(12px)' }}
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
              flex="1"
              direction="column"
              align="center"
              justify="center"
              gap={1}
              color={active ? `${tab.flow || 'train'}.fg` : 'fg.muted'}
              transition="color 0.15s ease"
              _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '-4px', borderRadius: 'md' }}
            >
              <Icon as={tab.icon} boxSize={5} strokeWidth={active ? 2.5 : 2} />
              <Text fontSize="11px" fontWeight={active ? 700 : 500}>{tab.label}</Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
}
