import { useContext } from 'react';
import {
  Avatar,
  Box,
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
  useColorModeValue,
  useToast,
  VStack,
  Image,
} from '@chakra-ui/react';
import { HamburgerIcon, MoonIcon, SettingsIcon, SunIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiLogOut, FiUser, FiZap } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { usePreAuthPalette } from './Marketing/PreAuthSurface';

const MotionBox = motion(Box);

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: FiGrid },
  { label: 'Fitness Hub', path: '/fitness-hub', icon: FiZap },
];

const getAccount = (user) => user?.user || user?.result || user || {};

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const account = getAccount(user);
  const preAuthPalette = usePreAuthPalette();

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/reset-password/');
  const isLoggedIn = Boolean(user);
  const loggedInBgColor = useColorModeValue('rgba(255,255,255,0.88)', 'rgba(26,32,44,0.88)');
  const loggedInBorderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const loggedInMutedColor = useColorModeValue('gray.600', 'gray.400');
  const loggedInLogoBg = useColorModeValue('teal.50', 'whiteAlpha.100');
  const publicBgColor = preAuthPalette.surfaceBg;
  const publicBorderColor = preAuthPalette.surfaceBorder;
  const publicMutedColor = preAuthPalette.shellText;
  const publicLogoBg = preAuthPalette.mutedSurface;
  const bgColor = isLoggedIn ? loggedInBgColor : publicBgColor;
  const borderColor = isLoggedIn ? loggedInBorderColor : publicBorderColor;
  const mutedColor = isLoggedIn ? loggedInMutedColor : publicMutedColor;
  const activeBg = useColorModeValue('teal.50', 'whiteAlpha.100');
  const activeColor = useColorModeValue('teal.700', 'teal.200');
  const ghostHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const logoBg = isLoggedIn ? loggedInLogoBg : publicLogoBg;
  const navTextColor = isLoggedIn ? undefined : preAuthPalette.headingColor;

  const handleLogout = () => {
    try {
      logout();
      navigate('/login');
      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error logging out',
        status: 'error',
        duration: 2500,
        isClosable: true,
      });
    }
  };

  const renderNavButton = (item) => {
    const isActive = location.pathname === item.path;
    return (
      <Button
        key={item.path}
        as={RouterLink}
        to={item.path}
        variant="ghost"
        leftIcon={<item.icon />}
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : undefined}
        borderRadius="full"
        _hover={{ bg: isActive ? activeBg : ghostHoverBg }}
      >
        {item.label}
      </Button>
    );
  };

  return (
    <MotionBox initial={{ y: -48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
      <Box
        position="sticky"
        top={0}
        zIndex="sticky"
        backdropFilter="blur(16px)"
        bg={bgColor}
        borderBottom="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        transition="background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease"
      >
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={3}>
          <Flex align="center" justify="space-between" gap={4}>
            <HStack
              spacing={3}
              cursor="pointer"
              onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}
              minW={0}
            >
              <Box
                p={2}
                borderRadius="xl"
                bg={logoBg}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Image src="/images/nutriflowlogo.webp" alt="NutriFlow Logo" height="28px" />
              </Box>
              <VStack spacing={0} align="start">
                <Text fontSize="lg" fontWeight="800" lineHeight="1" color={navTextColor}>
                  NutriFlow
                </Text>
                <Text fontSize="xs" color={mutedColor} letterSpacing="widest" textTransform="uppercase">
                  Fitness Workspace
                </Text>
              </VStack>
            </HStack>

            {!isAuthPage && isLoggedIn && (
              <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                {NAV_ITEMS.map(renderNavButton)}
              </HStack>
            )}

            <HStack spacing={2}>
              {!isLoggedIn && !isAuthPage && (
                <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                  <Button as={RouterLink} to="/login" variant="ghost" borderRadius="full" color={navTextColor}>
                    Login
                  </Button>
                  <Button as={RouterLink} to="/register" colorScheme="teal" borderRadius="full">
                    Get Started
                  </Button>
                </HStack>
              )}

              <IconButton
                aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                borderRadius="full"
                color={navTextColor}
              />

              {isLoggedIn && !isAuthPage ? (
                <>
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      borderRadius="full"
                      px={2}
                      display={{ base: 'none', md: 'inline-flex' }}
                    >
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={account.username || 'User'}
                          bg="teal.500"
                          color="white"
                        />
                        <Box textAlign="left" maxW="150px">
                          <Text fontSize="sm" fontWeight="700" noOfLines={1}>
                            {account.username || 'Your profile'}
                          </Text>
                          <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                            {account.email || 'Manage account'}
                          </Text>
                        </Box>
                      </HStack>
                    </MenuButton>
                    <MenuList borderRadius="xl">
                      <MenuItem icon={<FiUser />} onClick={() => navigate('/settings')}>
                        Profile & Settings
                      </MenuItem>
                      <MenuItem icon={<FiGrid />} onClick={() => navigate('/dashboard')}>
                        Dashboard
                      </MenuItem>
                      <MenuItem icon={<FiZap />} onClick={() => navigate('/fitness-hub')}>
                        Fitness Hub
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                        Logout
                      </MenuItem>
                    </MenuList>
                  </Menu>

                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<HamburgerIcon />}
                      variant="outline"
                      borderRadius="full"
                      aria-label="Navigation menu"
                      display={{ base: 'inline-flex', md: 'none' }}
                    />
                    <MenuList borderRadius="xl">
                      <Box px={3} py={2}>
                        <HStack spacing={3}>
                          <Avatar size="sm" name={account.username || 'User'} bg="teal.500" color="white" />
                          <Box minW={0}>
                            <Text fontSize="sm" fontWeight="700" noOfLines={1}>
                              {account.username || 'User'}
                            </Text>
                            <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                              {account.email || 'Signed in'}
                            </Text>
                          </Box>
                        </HStack>
                      </Box>
                      <MenuDivider />
                      {NAV_ITEMS.map((item) => (
                        <MenuItem key={item.path} icon={<item.icon />} onClick={() => navigate(item.path)}>
                          {item.label}
                        </MenuItem>
                      ))}
                      <MenuItem icon={<SettingsIcon />} onClick={() => navigate('/settings')}>
                        Profile & Settings
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                        Logout
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </>
              ) : (
                !isAuthPage && (
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<HamburgerIcon />}
                      variant="outline"
                      borderRadius="full"
                      aria-label="Navigation menu"
                      display={{ base: 'inline-flex', md: 'none' }}
                    />
                    <MenuList borderRadius="xl">
                      <MenuItem onClick={() => navigate('/login')}>Login</MenuItem>
                      <MenuItem onClick={() => navigate('/register')}>Get Started</MenuItem>
                    </MenuList>
                  </Menu>
                )
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>
    </MotionBox>
  );
}

export default Navbar;
