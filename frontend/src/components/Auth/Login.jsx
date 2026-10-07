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
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { login as loginApi } from '../../services/api';
import AuthLayout from './AuthLayout';
import PasswordInput from './PasswordInput';

function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
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
      navigate('/dashboard');
    } catch (error) {
      setFormError(error?.message || error.response?.data?.message || 'That email and password don’t match. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      description="Pick up where you left off."
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
            <Input type="email" name="email" autoComplete="email" value={credentials.email} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <Flex justify="space-between" align="baseline">
              <FormLabel>Password</FormLabel>
              <Link as={RouterLink} to="/forgot-password" fontSize="sm" color="fg.muted" _hover={{ color: 'fg' }}>
                Forgot password?
              </Link>
            </Flex>
            <PasswordInput name="password" autoComplete="current-password" value={credentials.password} onChange={handleChange} />
          </FormControl>
          <Button type="submit" isLoading={isLoading} w="100%" mt={2}>Log in</Button>
        </VStack>
      </form>
    </AuthLayout>
  );
}

export default Login;
