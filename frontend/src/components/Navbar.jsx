import { useContext, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  DarkMode,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { DURATION, EASE_OUT } from './Motion/tokens';
import { AuthContext } from '../context/AuthContext';
import Logo from './Global/Logo';

// Labels match the mobile tab bar so the app reads the same on every screen size.
const NAV_ITEMS = [
  { label: 'Today', path: '/dashboard' },
  { label: 'Coach', path: '/fitness-hub' },
];

const getAccount = (user) => user?.user || user?.result || user || {};

const MotionBox = motion(Box);

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > threshold);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const account = getAccount(user);

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/reset-password/');
  const isLoggedIn = Boolean(user);
  const scrolled = useScrolled();
  // On the public landing page the bar floats over the dark hero until you scroll.
  const overHero = !isLoggedIn && location.pathname === '/' && !scrolled;

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({ title: 'Logged out', status: 'success', duration: 2500, isClosable: true });
  };

  const bar = (
    <Box
      as="header"
      position={!isLoggedIn && location.pathname === '/' ? 'fixed' : 'sticky'}
      top={0}
      insetX={0}
      zIndex="sticky"
      bg={overHero ? 'transparent' : 'bg.surface'}
      borderBottomWidth="1px"
      borderColor={overHero ? 'transparent' : 'border'}
      pt="env(safe-area-inset-top)"
      transition={`background-color ${DURATION.base}s ease, border-color ${DURATION.base}s ease`}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <Flex h="56px" align="center" justify="space-between" gap={4}>
          <HStack spacing={8} h="100%">
            <Box as={RouterLink} to={isLoggedIn ? '/dashboard' : '/'} aria-label="NutriFlow home">
              <Logo />
            </Box>

            {!isAuthPage && isLoggedIn && (
              <HStack as="nav" aria-label="Main" spacing={1} h="100%" display={{ base: 'none', md: 'flex' }}>
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Flex
                      key={item.path}
                      as={RouterLink}
                      to={item.path}
                      aria-current={isActive ? 'page' : undefined}
                      h="100%"
                      align="center"
                      px={3}
                      fontSize="sm"
                      fontWeight={600}
                      position="relative"
                      color={isActive ? 'fg' : 'fg.muted'}
                      transition={`color ${DURATION.fast}s ease`}
                      _hover={{ color: 'fg' }}
                    >
                      {item.label}
                      {isActive && (
                        <MotionBox
                          layoutId="nav-active"
                          position="absolute"
                          insetX={3}
                          bottom="-1px"
                          h="2px"
                          bg="border.strong"
                          transition={{ duration: DURATION.base, ease: EASE_OUT }}
                        />
                      )}
                    </Flex>
                  );
                })}
              </HStack>
            )}
          </HStack>

          <HStack spacing={1}>
            {!isLoggedIn && !isAuthPage && (
              <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                <Button as={RouterLink} to="/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button as={RouterLink} to="/register" size="sm">
                  Create account
                </Button>
              </HStack>
            )}

            <IconButton
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
            />

            {isLoggedIn && !isAuthPage && (
              <Menu placement="bottom-end">
                <MenuButton
                  as={Button}
                  variant="ghost"
                  size="sm"
                  px={1}
                  aria-label="Account menu"
                >
                  <Avatar size="xs" name={account.username || 'User'} bg="fg" color="bg.surface" />
                </MenuButton>
                <MenuList>
                  <Box px={3} py={2} maxW="240px">
                    <Text fontSize="sm" fontWeight="700" noOfLines={1}>{account.username || 'Your account'}</Text>
                    <Text fontSize="xs" color="fg.muted" noOfLines={1}>{account.email}</Text>
                  </Box>
                  <MenuDivider />
                  <MenuItem icon={<FiUser />} onClick={() => navigate('/settings')}>
                    Profile and settings
                  </MenuItem>
                  <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                    Log out
                  </MenuItem>
                </MenuList>
              </Menu>
            )}

            {!isLoggedIn && !isAuthPage && (
              <Menu placement="bottom-end">
                <MenuButton
                  as={IconButton}
                  icon={<FiMenu />}
                  variant="ghost"
                  size="sm"
                  aria-label="Navigation menu"
                  display={{ base: 'inline-flex', md: 'none' }}
                />
                <MenuList>
                  <MenuItem as={RouterLink} to="/login">Log in</MenuItem>
                  <MenuItem as={RouterLink} to="/register">Create account</MenuItem>
                </MenuList>
              </Menu>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );

  return overHero ? <DarkMode>{bar}</DarkMode> : bar;
}

export default Navbar;