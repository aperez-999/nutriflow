import React from 'react';
import { Box, Button, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react';

function ErrorFallback({ onRetry }) {
  const bg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  return (
    <Box p={8} bg={bg} minH="40vh" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={4} textAlign="center" maxW="md">
        <Heading size="md" color={textColor}>Something went wrong</Heading>
        <Text color={subColor} fontSize="sm">
          We hit an error loading this section. You can try again or go back home.
        </Text>
        <VStack spacing={2}>
          <Button colorScheme="teal" onClick={onRetry}>Try again</Button>
          <Button variant="link" colorScheme="teal" onClick={() => window.location.assign('/')}>
            Go to home
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}

/**
 * Catches React errors in the tree and shows a fallback UI instead of a blank screen.
 * Keeps the app usable when a component throws.
 */
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
