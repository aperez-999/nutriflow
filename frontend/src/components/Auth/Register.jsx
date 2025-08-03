import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Link as ChakraLink,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register } from '../../services/api';

const MotionBox = motion(Box);

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      toast({
        title: 'Account created successfully',
        description: 'You can now login with your new account',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error creating account',
        description: error.response?.data?.message || error.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
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
                <Heading size="xl" mb={2}>Create Account</Heading>
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  Start your health and fitness journey today
                </Text>
              </Box>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaUser} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaEnvelope} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
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

                  <FormControl isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaLock} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    size="lg"
                    width="full"
                    isLoading={isLoading}
                    loadingText="Creating Account..."
                    mt={2}
                  >
                    Register
                  </Button>
                </VStack>
              </form>

              <Text fontSize="sm">
                Already have an account?{' '}
                <ChakraLink
                  as={RouterLink}
                  to="/login"
                  color="teal.500"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Login here
                </ChakraLink>
              </Text>
            </VStack>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default Register;