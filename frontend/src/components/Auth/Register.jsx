import { useContext, useState } from 'react';
import {
  Alert,
  AlertDescription,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Link,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { register } from '../../services/api';
import AuthLayout from './AuthLayout';
import { RegisterPanel } from './AuthPanels';
import PasswordInput from './PasswordInput';
import { LEVEL_LABEL } from '../Dashboard/components/verdict';

const MIN_PASSWORD_LENGTH = 6;

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [emailTaken, setEmailTaken] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // The landing page's "try it" result, if they came from there.
  const demo = location.state?.demo;
  const triedDemo = Boolean(demo && LEVEL_LABEL[demo.level] && Number.isFinite(demo.score));
  const { login } = useContext(AuthContext);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const passwordsMismatch = Boolean(formData.confirmPassword) && formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setEmailTaken(false);
    if (formData.password !== formData.confirmPassword) {
      setFormError('The two passwords don’t match.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      // Registration returns a session, so go straight to the dashboard.
      login(response);
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
      if (/already exists/i.test(message)) setEmailTaken(true);
      else setFormError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      panel={<RegisterPanel demo={triedDemo ? demo : null} />}
      title="Create your account"
      description={triedDemo ? 'Takes a minute. Tomorrow morning, your first real verdict.' : 'Takes a minute. Your first check-in comes right after.'}
      footer={<>Already have an account? <Link as={RouterLink} to="/login" color="fg" fontWeight="600" textDecoration="underline">Log in</Link></>}
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
                <Link as={RouterLink} to="/login" state={{ email: formData.email }} fontWeight="600" textDecoration="underline">
                  Log in instead
                </Link>
              </AlertDescription>
            </Alert>
          )}
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input name="username" autoComplete="nickname" value={formData.username} onChange={handleChange} autoFocus />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <PasswordInput name="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} value={formData.password} onChange={handleChange} />
            <FormHelperText color="fg.muted">At least {MIN_PASSWORD_LENGTH} characters.</FormHelperText>
          </FormControl>
          <FormControl isRequired isInvalid={passwordsMismatch}>
            <FormLabel>Confirm password</FormLabel>
            <PasswordInput name="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} />
            <FormErrorMessage>The passwords don’t match.</FormErrorMessage>
          </FormControl>
          <Button type="submit" isLoading={isLoading} isDisabled={passwordsMismatch} w="100%" mt={2}>Create account</Button>
        </VStack>
      </form>
    </AuthLayout>
  );
}

export default Register;
