import { useState } from 'react';
import {
  Alert,
  AlertDescription,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../../services/api';
import AuthLayout from './AuthLayout';
import { PasswordPanel } from './AuthPanels';
import PasswordInput from './PasswordInput';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const mismatch = Boolean(confirmPassword) && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('The two passwords don’t match.');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(token, password);
      toast({ title: 'Password updated. Log in with your new password.', status: 'success', duration: 4000, isClosable: true });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'This link may have expired. Request a new one and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout panel={<PasswordPanel />} title="Choose a new password" description="Pick something you haven’t used here before.">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          {error && (
            <Alert status="error" borderRadius="control" fontSize="sm">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FormControl isRequired>
            <FormLabel>New password</FormLabel>
            <PasswordInput autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <FormControl isRequired isInvalid={mismatch}>
            <FormLabel>Confirm new password</FormLabel>
            <PasswordInput autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <FormErrorMessage>The passwords don’t match.</FormErrorMessage>
          </FormControl>
          <Button type="submit" isLoading={isLoading} isDisabled={mismatch} w="100%">Update password</Button>
        </VStack>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
