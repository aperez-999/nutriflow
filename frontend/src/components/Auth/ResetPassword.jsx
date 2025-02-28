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
  useToast,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaLock } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/api';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
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
      await resetPassword(token, password);
      toast({
        title: 'Password reset successful',
        description: 'You can now login with your new password',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error resetting password',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
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
                <Heading size="xl" mb={2}>Reset Password</Heading>
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  Enter your new password
                </Text>
              </Box>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>New Password</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaLock} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    loadingText="Resetting..."
                    as={motion.button}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    mt={2}
                  >
                    Reset Password
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default ResetPassword; 