import { useContext, useState } from 'react';
import {
  Alert,
  AlertDescription,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { login as loginApi } from '../../services/api';
import AuthLayout from './AuthLayout';
import { LoginPanel } from './AuthPanels';
import PasswordInput from './PasswordInput';
import { forgetRememberedUser, readRememberedUser, safeReturnPath } from './rememberedUser';

// Names for "Log in to continue to …" when a signed-out visitor followed a link into the app.
const DESTINATIONS = { '/dashboard': 'Today', '/fitness-hub': 'Coach', '/library': 'your Library', '/profile': 'your profile', '/settings': 'Settings' };

function Login() {
  const location = useLocation();
  const from = safeReturnPath(location.state?.from);
  const [remembered, setRemembered] = useState(readRememberedUser);
  // An email handed over from sign-up ("already has an account") wins over the remembered one.
  const [credentials, setCredentials] = useState(() => ({ email: location.state?.email || remembered?.email || '', password: '' }));
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsLoading(true);
    try {
      const response = await loginApi(credentials);
      login(response);
      navigate(from || '/dashboard', { replace: true });
    } catch (error) {
      setFormError(error?.message || error.response?.data?.message || 'That email and password don’t match. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchAccount = () => {
    forgetRememberedUser();
    setRemembered(null);
    setCredentials({ email: '', password: '' });
  };

  const destination = from && DESTINATIONS[from.split(/[?#]/)[0]];
  const prefilled = Boolean(credentials.email);

  return (
    <AuthLayout
      panel={<LoginPanel />}
      title={remembered?.name ? `Welcome back, ${remembered.name}.` : 'Welcome back.'}
      description={from ? `Log in to continue to ${destination || 'where you were'}.` : 'Today’s verdict is waiting. Log in to see it.'}
      footer={<>New to NutriFlow? <Link as={RouterLink} to="/register" color="fg" fontWeight="600" textDecoration="underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          {formError && (
            <Alert status="error" borderRadius="control" fontSize="sm">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" autoComplete="email" value={credentials.email} onChange={handleChange} autoFocus={!prefilled} />
          </FormControl>
          <FormControl isRequired>
            <Flex justify="space-between" align="baseline">
              <FormLabel>Password</FormLabel>
              <Link as={RouterLink} to="/forgot-password" fontSize="sm" color="fg.muted" _hover={{ color: 'fg' }}>
                Forgot password?
              </Link>
            </Flex>
            <PasswordInput name="password" autoComplete="current-password" value={credentials.password} onChange={handleChange} autoFocus={prefilled} />
          </FormControl>
          <Button type="submit" isLoading={isLoading} w="100%" mt={2}>Log in</Button>
          {remembered && (
            <Text fontSize="sm" color="fg.muted" textAlign="center">
              Not {remembered.name || remembered.email}?{' '}
              <Link as="button" type="button" onClick={switchAccount} color="fg" fontWeight="600" textDecoration="underline">
                Use another account
              </Link>
            </Text>
          )}
        </VStack>
      </form>
    </AuthLayout>
  );
}

export default Login;
