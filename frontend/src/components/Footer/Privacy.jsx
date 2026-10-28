import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import PageBand from '../Global/PageBand';

function Privacy() {
  return (
    <Box>
      <PageBand maxW="4xl" title="Privacy Policy" description="What NutriFlow collects, why, and how it is kept safe." />
      <Container maxW="4xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 10 }}>
        <VStack spacing={8} align="start">
          
          <VStack spacing={6} align="start" width="100%">
            <Box>
              <Heading size="lg" mb={4}>Information We Collect</Heading>
              <Text>
                We collect information you provide directly to us when you create an account,
                including your name, email address, and password. We also collect data about
                the workouts, meals and check-ins you log, so your verdict, targets and coach
                answers are based on your own days.
              </Text>
            </Box>

            <Box>
              <Heading size="lg" mb={4}>How We Use Your Information</Heading>
              <Text>
                We use the information we collect to:
              </Text>
              <VStack align="start" pl={5} mt={2} spacing={2}>
                <Text>• Provide, maintain, and improve our services</Text>
                <Text>• Process your transactions and send you related information</Text>
                <Text>• Send you technical notices, updates, and support messages</Text>
                <Text>• Respond to your comments and questions</Text>
              </VStack>
            </Box>

            <Box>
              <Heading size="lg" mb={4}>Data Security</Heading>
              <Text>
                We implement appropriate security measures to protect your personal information.
                However, no method of transmission over the Internet is 100% secure, and we
                cannot guarantee absolute security.
              </Text>
            </Box>

            <Box>
              <Heading size="lg" mb={4}>Your Data, Your Choice</Heading>
              <Text>
                You can download everything NutriFlow stores about you, or delete your account and all of
                its data, at any time from Settings, under Your data. Deletion is immediate and permanent.
              </Text>
            </Box>

            <Box>
              <Heading size="lg" mb={4}>Updates to This Policy</Heading>
              <Text>
                We may update this privacy policy from time to time. We will notify you of
                any changes by posting the new privacy policy on this page and updating the
                effective date.
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

export default Privacy; 