import { useContext, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Container,
  FormControl,
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
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { login as loginApi } from '../../services/api';
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

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useContext(AuthContext);
  const palette = usePreAuthPalette();

  const inputStyles = getAuthInputStyles(palette);
  const refinedInputStyles = {
    ...inputStyles,
    transition: 'all 180ms ease',
    _focusVisible: {
      borderColor: palette.accent,
      boxShadow: `0 0 0 1px ${palette.accent}, 0 0 0 4px rgba(56, 189, 248, 0.14)`,
      transform: 'translateY(-1px)',
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const response = await loginApi(credentials);
      login(response);
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error) {
      const message = error?.message || error.response?.data?.message || 'Invalid email or password, please try again.';
      setFormError(message);
      toast({
        title: 'Error logging in',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <PreAuthShell>
      <Container maxW="6xl" px={{ base: 4, md: 6 }} py={{ base: 14, md: 18, xl: 24 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 14 }} alignItems="center">
          <MotionBox initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <PreAuthIntroPanel
              eyebrow="Welcome back"
              title="Pick up where your progress left off."
              description="Log in to continue tracking workouts, meals, and readiness from the same clean workspace."
              bullets={[
                'Review your latest readiness score and next-step coaching.',
                'Log meals and workouts without leaving the flow.',
                'Stay in sync with the dark, teal-focused app experience.',
              ]}
            />
          </MotionBox>

          <MotionBox initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
            <PreAuthCard p={{ base: 5, md: 8 }} position="relative" overflow="hidden">
              <Box
                position="absolute"
                inset="0"
                bgGradient="radial(circle at top right, rgba(45, 212, 191, 0.12), transparent 42%), radial(circle at bottom left, rgba(56, 189, 248, 0.08), transparent 34%)"
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
                      Secure access
                    </Box>
                  </HStack>
                  <Heading as="h2" size="xl" color={palette.headingColor} letterSpacing="-0.03em">
                    Login
                  </Heading>
                  <Text mt={2} color={palette.shellText}>
                    Use your NutriFlow account to get back into your dashboard.
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
                          value={credentials.email}
                          autoComplete="email"
                          spellCheck={false}
                          onChange={(e) => {
                            setFormError('');
                            setCredentials((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }));
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
                          placeholder="Enter your password"
                          value={credentials.password}
                          autoComplete="current-password"
                          onChange={(e) => {
                            setFormError('');
                            setCredentials((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }));
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

                    <AuthActionButton type="submit">Login</AuthActionButton>
                  </VStack>
                </form>

                <HStack justify="space-between" flexWrap="wrap" spacing={3}>
                  <ChakraLink
                    as={RouterLink}
                    to="/forgot-password"
                    color={palette.accent}
                    fontSize="sm"
                    fontWeight="600"
                    _hover={{ color: palette.accentStrong, textDecoration: 'underline' }}
                  >
                    Forgot Password?
                  </ChakraLink>

                  <Text fontSize="sm" color={palette.shellText}>
                    New here?{' '}
                    <ChakraLink
                      as={RouterLink}
                      to="/register"
                      color={palette.accent}
                      fontWeight="700"
                      _hover={{ color: palette.accentStrong, textDecoration: 'underline' }}
                    >
                      Create account
                    </ChakraLink>
                  </Text>
                </HStack>
              </VStack>
            </PreAuthCard>
          </MotionBox>
        </SimpleGrid>
      </Container>
    </PreAuthShell>
  );
}

export default Login;
