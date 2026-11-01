import { useContext, useState } from 'react';
import {
  Alert,
  AlertDescription,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { googleRegister } from '../../services/api';
import AuthLayout from './AuthLayout';
import { RegisterPanel } from './AuthPanels';

/**
 * After Continue with Google for an email NutriFlow doesn't know: a new account is made only
 * here, once the person has seen it and chosen their name. It's linked to Google, so there's
 * no password to pick.
 */
function GoogleSignUp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const signUp = location.state?.signUp;
  const [username, setUsername] = useState(signUp?.name || '');
  const [nameError, setNameError] = useState('');
  const [formError, setFormError] = useState('');
  const [emailTaken, setEmailTaken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Opened directly, or after a reload: there's no Google account to finish with.
  if (!signUp?.token) return <Navigate to="/register" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError('');
    setFormError('');
    setEmailTaken(false);
    setIsLoading(true);
    try {
      const response = await googleRegister({ signUpToken: signUp.token, username, invite: location.state?.invite });
      login(response);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error?.message || 'Something went wrong. Please try again.';
      if (/name is taken/i.test(message)) setNameError(message);
      else if (/already exists/i.test(message)) setEmailTaken(true);
      else setFormError(message);
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      panel={<RegisterPanel />}
      title="Finish creating your account"
      description="There’s no NutriFlow account for this Google account yet. Choose your name and it’s ready."
      footer={<>Not the right Google account? <Link as={RouterLink} to="/register" color="fg" fontWeight="600" textDecoration="underline">Start over</Link></>}
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          {formError && (
            <Alert status="error" borderRadius="control" fontSize="sm">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {emailTaken && (
            <Alert status="info" borderRadius="control" fontSize="sm">
              <AlertDescription>
                That email already has an account.{' '}
                <Link as={RouterLink} to="/login" state={{ email: signUp.email }} fontWeight="600" textDecoration="underline">
                  Log in instead
                </Link>
              </AlertDescription>
            </Alert>
          )}
          <Flex direction="column" gap={1} borderWidth="1px" borderColor="border" borderRadius="control" px={4} py={3}>
            <Text fontSize="sm" color="fg.muted">Signing up with Google as</Text>
            <Text fontWeight="600" data-testid="google-email">{signUp.email}</Text>
          </Flex>
          <FormControl isRequired isInvalid={Boolean(nameError)}>
            <FormLabel>Name</FormLabel>
            <Input name="username" autoComplete="nickname" value={username} onChange={(e) => { setUsername(e.target.value); setNameError(''); }} autoFocus />
            <FormErrorMessage>{nameError}</FormErrorMessage>
          </FormControl>
          <Button type="submit" isLoading={isLoading} isDisabled={!username.trim()} w="100%" mt={2}>Create account</Button>
        </VStack>
      </form>
    </AuthLayout>
  );
}

export default GoogleSignUp;
