import { useContext, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, Box, Divider, Flex, Text, useColorMode } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { googleSignIn } from '../../services/api';

// The web client ID from Google Cloud. Without one the button isn't shown.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT = 'https://accounts.google.com/gsi/client';

let loading;
/** Google's sign-in script, loaded once and only on the pages that show the button. */
function loadScript() {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => { loading = undefined; reject(new Error('Google sign-in didn’t load')); };
    document.head.appendChild(script);
  });
  return loading;
}

/**
 * "Continue with Google", Google's own button, above the email form. Signs in an existing
 * account (or links one with the same Google-verified email); a new one is finished on
 * /register/google, where the user chooses their name.
 */
function GoogleButton({ invite, to = '/dashboard' }) {
  const container = useRef(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const [error, setError] = useState('');
  // The latest handler, so Google's callback never holds a stale one.
  const onCredential = useRef();
  onCredential.current = async (credential) => {
    setError('');
    try {
      const response = await googleSignIn({ credential, invite });
      // No account for this Google account yet: they finish signing up first.
      if (response.needsSignUp) {
        navigate('/register/google', { state: { signUp: response.signUp, invite } });
        return;
      }
      login(response);
      navigate(to, { replace: true });
    } catch (err) {
      setError(err?.message || 'Google sign-in didn’t go through. Try again.');
    }
  };

  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !container.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: ({ credential }) => onCredential.current(credential),
        });
        window.google.accounts.id.renderButton(container.current, {
          theme: colorMode === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          width: Math.min(container.current.offsetWidth || 400, 400),
        });
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => { cancelled = true; };
  }, [colorMode]);

  if (!CLIENT_ID) return null;

  return (
    <Box>
      {error && (
        <Alert status="error" borderRadius="control" fontSize="sm" mb={3}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Google's button is a light page in a frame. Without a matching color scheme, a dark
          page paints the frame an opaque white box. */}
      <Flex ref={container} justify="center" minH="44px" sx={{ colorScheme: 'light' }} />
      <Flex align="center" gap={3} mt={5} mb={1}>
        <Divider />
        <Text fontSize="sm" color="fg.muted" flexShrink={0}>or with email</Text>
        <Divider />
      </Flex>
    </Box>
  );
}

export default GoogleButton;
