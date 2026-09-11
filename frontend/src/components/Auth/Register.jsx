import { useState } from 'react';
import {
  Box,
  Container,
  Alert,
  AlertDescription,
  AlertIcon,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link as ChakraLink,
  SimpleGrid,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register } from '../../services/api';
import {
  AuthActionButton,
  AuthIconBox,
  PreAuthCard,
  PreAuthIntroPanel,
  PreAuthShell,
  getAuthInputStyles,
  usePreAuthPalette,
} from '../Marketing/PreAuthSurface';

const MotionBox = motion(Box);

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const palette = usePreAuthPalette();

  const inputStyles = getAuthInputStyles(palette);
  const refinedInputStyles = {
    ...inputStyles,
    transition: 'all 180ms ease',
    _focusVisible: {
      borderColor: palette.accent,
      boxShadow: `0 0 0 1px ${palette.accent}, 0 0 0 4px rgba(45, 212, 191, 0.14)`,
      transform: 'translateY(-1px)',
    },
  };

  const updateConfirmPassword = (value) => {
    setFormData((prev) => ({ ...prev, confirmPassword: value }));
    const hasMismatch = formData.password && value && formData.password !== value;
    setConfirmPasswordError(hasMismatch ? 'Passwords must match before you can continue.' : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Passwords must match before you can continue.');
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both password fields match.',
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
        password: formData.password,
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
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      setFormError(message);
      toast({
        title: 'Error creating account',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PreAuthShell>
      <Container maxW="6xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 18, xl: 24 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 14 }} alignItems="center">
          <MotionBox initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <PreAuthIntroPanel
              eyebrow="Create account"
              title="Start with a clean workflow from day one."
              description="Set up your NutriFlow profile to keep coaching, tracking, and planning inside one calm, modern workspace."
              bullets={[
                'Get a dashboard that feels coordinated from the start.',
                'Log meals and workouts with less overhead.',
                'Use the same dark, teal-led visual language as the app.',
              ]}
            />
          </MotionBox>

          <MotionBox initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
            <PreAuthCard p={{ base: 5, md: 8 }} position="relative" overflow="hidden">
              <Box
                position="absolute"
                inset="0"
                bgGradient={`radial(circle at top right, rgba(45, 212, 191, 0.12), transparent 42%), radial(circle at bottom left, rgba(56, 189, 248, 0.08), transparent 34%)`}
                pointerEvents="none"
              />
              <VStack spacing={6} align="stretch" position="relative">
                <Box textAlign="center">
                  <HStack justify="center" mb={3}>
                    <Box
                      px={3}
                      py={1}
                      borderRadius="full"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      bg="whiteAlpha.100"
                      color={palette.accent}
                      fontSize="xs"
                      fontWeight="700"
                      letterSpacing="0.12em"
                      textTransform="uppercase"
                    >
                      Create your profile
                    </Box>
                  </HStack>
                  <Heading as="h2" size="xl" color={palette.headingColor} letterSpacing="-0.03em">
                    Sign up
                  </Heading>
                  <Text mt={2} color={palette.shellText}>
                    Create your NutriFlow account and start logging right away.
                  </Text>
                </Box>

                <form onSubmit={handleSubmit}>
                  <VStack spacing={4} align="stretch">
                    {formError ? (
                      <Alert status="error" borderRadius="xl" variant="left-accent" bg="whiteAlpha.50">
                        <AlertIcon />
                        <AlertDescription>{formError}</AlertDescription>
                      </Alert>
                    ) : null}

                    <FormControl isRequired>
                      <FormLabel color={palette.headingColor} fontSize="sm" fontWeight="600">
                        Username
                      </FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement h="full" pl={3} pointerEvents="none">
                          <AuthIconBox>
                            <Icon as={FaUser} boxSize={4} />
                          </AuthIconBox>
                        </InputLeftElement>
                        <Input
                          {...refinedInputStyles}
                          type="text"
                          placeholder="Choose a username"
                          value={formData.username}
                          autoComplete="username"
                          onChange={(e) => {
                            setFormError('');
                            setFormData((prev) => ({ ...prev, username: e.target.value }));
                          }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={palette.headingColor} fontSize="sm" fontWeight="600">
                        Email
                      </FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement h="full" pl={3} pointerEvents="none">
                          <AuthIconBox>
                            <Icon as={FaEnvelope} boxSize={4} />
                          </AuthIconBox>
                        </InputLeftElement>
                        <Input
                          {...refinedInputStyles}
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          autoComplete="email"
                          spellCheck={false}
                          onChange={(e) => {
                            setFormError('');
                            setFormData((prev) => ({ ...prev, email: e.target.value }));
                          }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={palette.headingColor} fontSize="sm" fontWeight="600">
                        Password
                      </FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement h="full" pl={3} pointerEvents="none">
                          <AuthIconBox>
                            <Icon as={FaLock} boxSize={4} />
                          </AuthIconBox>
                        </InputLeftElement>
                        <Input
                          {...refinedInputStyles}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={formData.password}
                          autoComplete="new-password"
                          onChange={(e) => {
                            setFormError('');
                            const password = e.target.value;
                            setFormData((prev) => {
                              const next = { ...prev, password };
                              if (next.confirmPassword && password !== next.confirmPassword) {
                                setConfirmPasswordError('Passwords must match before you can continue.');
                              } else {
                                setConfirmPasswordError('');
                              }
                              return next;
                            });
                          }}
                        />
                        <InputRightElement h="full" pr={2}>
                          <IconButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            borderRadius="full"
                            onClick={() => setShowPassword((prev) => !prev)}
                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            color={palette.shellText}
                            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired isInvalid={Boolean(confirmPasswordError)}>
                      <FormLabel color={palette.headingColor} fontSize="sm" fontWeight="600">
                        Confirm Password
                      </FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement h="full" pl={3} pointerEvents="none">
                          <AuthIconBox>
                            <Icon as={FaLock} boxSize={4} />
                          </AuthIconBox>
                        </InputLeftElement>
                        <Input
                          {...refinedInputStyles}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          autoComplete="new-password"
                          onChange={(e) => {
                            setFormError('');
                            updateConfirmPassword(e.target.value);
                          }}
                        />
                        <InputRightElement h="full" pr={2}>
                          <IconButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            borderRadius="full"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            color={palette.shellText}
                            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage color="red.300">{confirmPasswordError}</FormErrorMessage>
                    </FormControl>

                    <AuthActionButton type="submit" isLoading={isLoading} loadingText="Creating account">
                      Register
                    </AuthActionButton>
                  </VStack>
                </form>

                <HStack justify="center" spacing={2} flexWrap="wrap">
                  <Text fontSize="sm" color={palette.shellText}>
                    Already have an account?
                  </Text>
                  <ChakraLink
                    as={RouterLink}
                    to="/login"
                    color={palette.accent}
                    fontWeight="700"
                    _hover={{ color: palette.accentStrong, textDecoration: 'underline' }}
                  >
                    Login here
                  </ChakraLink>
                </HStack>
              </VStack>
            </PreAuthCard>
          </MotionBox>
        </SimpleGrid>
      </Container>
    </PreAuthShell>
  );
}

export default Register;
