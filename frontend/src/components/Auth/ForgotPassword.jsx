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
  Icon,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { FaEnvelope } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forgotPassword } from '../../services/api';

const MotionBox = motion(Box);

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting forgot password request for:', email);
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      toast({
        title: 'Reset link sent',
        description: 'Check your email for password reset instructions',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        title: 'Error',
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
                  Enter your email to receive reset instructions
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    size="lg"
                    width="full"
                    isLoading={isLoading}
                    loadingText="Sending..."
                    as={motion.button}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Reset Link
                  </Button>
                </VStack>
              </form>

              <ChakraLink
                as={RouterLink}
                to="/login"
                color="teal.500"
                fontSize="sm"
                _hover={{ 
                  color: 'teal.600',
                  textDecoration: 'underline' 
                }}
              >
                Back to Login
              </ChakraLink>
            </VStack>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default ForgotPassword; 