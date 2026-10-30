import { useContext, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, Button, Spinner, VStack } from '@chakra-ui/react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { verifyEmail } from '../../services/api';
import AuthLayout from './AuthLayout';
import { PasswordPanel } from './AuthPanels';

/** The link from the confirmation email: confirms the address as soon as it opens. */
function VerifyEmail() {
  const { token } = useParams();
  const { user, updateUser } = useContext(AuthContext);
  const [state, setState] = useState({ status: 'checking' });
  // Strict mode runs effects twice in development; the token only works once.
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    verifyEmail(token)
      .then(({ email }) => {
        setState({ status: 'done', email });
        const account = user?.user;
        if (account && account.email === email) updateUser({ ...user, user: { ...account, emailVerified: true } });
      })
      .catch((error) => setState({ status: 'failed', message: error?.message }));
  }, [token, updateUser, user]);

  return (
    <AuthLayout
      panel={<PasswordPanel />}
      title={state.status === 'done' ? 'Email confirmed' : 'Confirming your email'}
      description={state.status === 'done' ? `${state.email} is confirmed. You can always get back into your account with it.` : 'One moment.'}
    >
      <VStack spacing={4} align="stretch">
        {state.status === 'checking' && <Spinner alignSelf="center" />}
        {state.status === 'failed' && (
          <Alert status="error" borderRadius="control" fontSize="sm">
            <AlertDescription>{state.message || 'This link didn’t work. Send a new one from Settings.'}</AlertDescription>
          </Alert>
        )}
        {state.status !== 'checking' && (
          <Button as={RouterLink} to={user ? (state.status === 'failed' ? '/settings#account' : '/dashboard') : '/login'}>
            {user ? (state.status === 'failed' ? 'Go to Settings' : 'Go to Today') : 'Log in'}
          </Button>
        )}
      </VStack>
    </AuthLayout>
  );
}

export default VerifyEmail;
