import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import PageBand from '../Global/PageBand';

function Terms() {
  return (
    <Box>
      <PageBand maxW="4xl" title="Terms of Service" description="The rules for using NutriFlow." />
      <Container maxW="4xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 10 }}>
        <VStack spacing={8} align="start">
          
          <VStack spacing={6} align="start" width="100%">
            <Box>
              <Heading size="lg" mb={4}>1. Terms</Heading>
              <Text>
                By accessing NutriFlow, you agree to be bound by these terms of service.
                If you disagree with any part of the terms, you may not access the service.
              </Text>
            </Box>

            <Box>
              <Heading size="lg" mb={4}>2. Use License</Heading>
              <Text>
                Permission is granted to temporarily access NutriFlow for personal,
                non-commercial use. This is the grant of a license, not a transfer of title.
              </Text>
            </Box>

            <Box>
              <Heading size="lg" mb={4}>3. User Account</Heading>
              <Text>
                You are responsible for maintaining the confidentiality of your account
                and password. You agree to accept responsibility for all activities that
                occur under your account.
              </Text>
            </Box>

            <Box>
              <Heading size="lg" mb={4}>4. Service Modifications</Heading>
              <Text>
                NutriFlow reserves the right to modify or discontinue, temporarily or
                permanently, the service with or without notice. We shall not be liable
                to you or any third party for any modification, suspension, or discontinuance
                of the service.
              </Text>
            </Box>

            <Box>
              <Heading size="lg" mb={4}>5. Governing Law</Heading>
              <Text>
                These terms shall be governed by and construed in accordance with the
                laws of the United States, without regard to its conflict of law provisions.
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

export default Terms; 