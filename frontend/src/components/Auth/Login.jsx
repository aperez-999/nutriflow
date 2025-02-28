import React, { useState, useContext } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Link,
  Link as ChakraLink,
  useColorModeValue,
  Image,
  InputGroup,
  InputLeftElement,
  IconButton,
  InputRightElement,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { login as loginApi } from '../../services/api';
import { motion } from 'framer-motion';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { Icon } from '@chakra-ui/react';

const MotionBox = motion(Box);

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginApi(credentials);
      login(response);
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error logging in',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box
      minH="100vh"
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgImage="url('/images/fitness-bg.jpg')"
      bgSize="cover"
      bgPosition="center"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: "blackAlpha.600",
        zIndex: 0
      }}
    >
      <Container maxW="md" position="relative" zIndex={1}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            p={8}
            borderRadius="xl"
            boxShadow="2xl"
          >
            <VStack spacing={6}>
              <Box textAlign="center">
                <Heading size="xl" mb={2}>Welcome Back</Heading>
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  Track your nutrition and fitness journey
                </Text>
              </Box>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaEnvelope} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({
                          ...credentials,
                          email: e.target.value
                        })}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaLock} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({
                          ...credentials,
                          password: e.target.value
                        })}
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    size="lg"
                    width="full"
                    mt={2}
                  >
                    Login
                  </Button>
                </VStack>
              </form>

              <HStack justify="space-between" width="full" pt={4}>
                <Box>
                  <ChakraLink
                    as={RouterLink}
                    to="/forgot-password"
                    color="teal.500"
                    fontSize="sm"
                    _hover={{ 
                      color: 'teal.600',
                      textDecoration: 'underline' 
                    }}
                  >
                    Forgot Password?
                  </ChakraLink>
                </Box>
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Don't have an account?{' '}
                  <ChakraLink
                    as={RouterLink}
                    to="/register"
                    color="teal.500"
                    fontWeight="semibold"
                    _hover={{ 
                      color: 'teal.600',
                      textDecoration: 'underline' 
                    }}
                    ml={1}
                  >
                    Register here
                  </ChakraLink>
                </Text>
              </HStack>
            </VStack>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default Login;