import { useContext } from 'react';
import { Box, Button, Container, Heading, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FlowBand from '../components/Global/FlowBand';

/** Any address the app does not know: say so plainly and offer the way back. */
function NotFound() {
  const { user } = useContext(AuthContext);
  const { pathname } = useLocation();
  const links = user
    ? [['/dashboard', 'Go to Today'], ['/fitness-hub', 'Ask your coach'], ['/library', 'Open your Library']]
    : [['/', 'Go to the home page'], ['/login', 'Log in']];

  return (
    <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 12, md: 20 }}>
      <Box maxW="640px">
        <Text textStyle="figure" fontSize={{ base: '6xl', md: '8xl' }} color="recover.fg" lineHeight="1">404</Text>
        <Heading as="h1" fontSize={{ base: '5xl', md: '7xl' }} lineHeight="0.9" mt={2}>This page is taking a rest day.</Heading>
        <Text color="fg.muted" fontSize={{ base: 'md', md: 'lg' }} mt={4}>
          There is nothing at <Text as="span" fontWeight="600" color="fg" wordBreak="break-all">{pathname}</Text>. It may have moved, or the link has a typo.
        </Text>
        <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} mt={8}>
          {links.map(([to, label], i) => (
            <Button key={to} as={RouterLink} to={to} variant={i === 0 ? 'solid' : 'outline'}>{label}</Button>
          ))}
        </Stack>
      </Box>
      <Box mt={{ base: 12, md: 16 }}>
        <FlowBand barHeight={{ base: '10px', md: '14px' }} />
      </Box>
    </Container>
  );
}

export default NotFound;
