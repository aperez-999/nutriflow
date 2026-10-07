import { useState } from 'react';
import { Alert, AlertDescription, Button, FormControl, FormLabel, Input, Link, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import AuthLayout from './AuthLayout';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSentTo(email);
    } catch (err) {
      setError(err.response?.data?.message || 'We couldn’t send the email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      description="We’ll email you a link to choose a new one."
      footer={<Link as={RouterLink} to="/login" color="fg" fontWeight="600" textDecoration="underline">Back to log in</Link>}
    >
      {sentTo ? (
        <Text>
          If an account exists for <Text as="span" fontWeight="700">{sentTo}</Text>, a reset link is on its way. Check your inbox and spam folder.
        </Text>
      ) : (
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            {error && (
              <Alert status="error" borderRadius="control" fontSize="sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <Button type="submit" isLoading={isLoading} w="100%">Send reset link</Button>
          </VStack>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;
