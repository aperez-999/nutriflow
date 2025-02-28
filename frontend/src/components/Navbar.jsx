import React, { useContext } from 'react';
import {
  Box,
  Flex,
  Button,
  Heading,
  Spacer,
  useToast,
  useColorMode,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Image,
  HStack
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SunIcon, MoonIcon, HamburgerIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { FaChartBar, FaDumbbell } from 'react-icons/fa';

const MotionBox = motion(Box);

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    try {
      logout();
      navigate('/login');
      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error logging out',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Prevent showing nav options on login/register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <MotionBox
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        bg={bgColor}
        px={4}
        py={3}
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex="sticky"
        boxShadow="sm"
      >
        <Flex alignItems="center" maxW="container.xl" mx="auto">
          <Image
            src="public/images/nutriflowlogo.webp"
            alt="NutriFlow Logo"
            height="32px"
            mr={2}
          />
          <Heading
            size="md"
            cursor="pointer"
            onClick={() => user ? navigate('/dashboard') : navigate('/')}
            _hover={{ transform: 'scale(1.05)' }}
            transition="all 0.2s"
          >
            NutriFlow
          </Heading>
          
          <Spacer />

          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            mr={2}
          />

          {!isAuthPage && (
            <Box display={{ base: 'none', md: 'block' }}>
              <HStack spacing={4}>
                <Button
                  as={RouterLink}
                  to="/dashboard"
                  variant="ghost"
                  leftIcon={<FaChartBar />}
                >
                  Dashboard
                </Button>
                <Button
                  as={RouterLink}
                  to="/fitness-hub"
                  variant="ghost"
                  leftIcon={<FaDumbbell />}
                >
                  Fitness Hub
                </Button>
                <Button
                  as={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  colorScheme="red"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </HStack>
            </Box>
          )}

          {/* Mobile Menu */}
          <Box display={{ base: 'block', md: 'none' }}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                variant="outline"
                aria-label="Options"
              />
              <MenuList>
                {user ? (
                  <>
                    <MenuItem onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/fitness-hub')}>
                      Fitness Hub
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem onClick={() => navigate('/login')}>Login</MenuItem>
                    <MenuItem onClick={() => navigate('/register')}>
                      Register
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          </Box>
        </Flex>
      </Box>
    </MotionBox>
  );
}

export default Navbar; 