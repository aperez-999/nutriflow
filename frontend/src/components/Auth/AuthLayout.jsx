import { Box, Container, Heading, Text } from '@chakra-ui/react';

/** Centered, single-column frame shared by the sign-in, sign-up and password pages. */
export default function AuthLayout({ title, description, children, footer }) {
  return (
    <Container maxW="420px" px={4} py={{ base: 10, md: 20 }}>
      <Heading as="h1" size="lg">{title}</Heading>
      {description && (
        <Text color="fg.muted" mt={2}>{description}</Text>
      )}
      <Box bg="bg.surface" borderWidth="1px" borderColor="border" borderRadius="panel" p={{ base: 5, md: 6 }} mt={6}>
        {children}
      </Box>
      {footer && (
        <Text fontSize="sm" color="fg.muted" mt={5} textAlign="center">{footer}</Text>
      )}
    </Container>
  );
}
