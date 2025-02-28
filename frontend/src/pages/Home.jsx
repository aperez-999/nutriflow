import React from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  SimpleGrid,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useInView } from 'framer-motion';

const MotionBox = motion(Box);

function Home() {
  const navigate = useNavigate();
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const boxShadow = useColorModeValue('lg', 'dark-lg');

  // Add this ref for the journey section
  const journeyRef = React.useRef(null);
  const isInView = useInView(journeyRef, { once: true, margin: "-100px" });

  return (
    <Box bg={bgColor} minH="100vh" transition="background 0.2s ease">
      <Container maxW="container.xl" py={20}>
        <VStack spacing={16}>
          {/* Hero Section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
            w="full"
          >
            <Heading
              as="h1"
              size="2xl"
              mb={6}
              bgGradient="linear(to-r, teal.400, blue.500)"
              bgClip="text"
              letterSpacing="tight"
              fontWeight="extrabold"
            >
              Welcome to NutriFlow!
            </Heading>
            <Text 
              fontSize="xl" 
              color={textColor} 
              maxW="2xl" 
              mx="auto"
              mb={12}
              lineHeight="tall"
            >
              Your personal companion for tracking nutrition and fitness goals. 
              Start your journey to a healthier lifestyle today.
            </Text>
            <Stack 
              direction={{ base: 'column', sm: 'row' }}
              spacing={4} 
              justify="center"
              w="full"
              maxW="md" 
              mx="auto"
            >
              <Button
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                size="lg"
                colorScheme="teal"
                onClick={() => navigate('/register')}
                px={8}
                fontSize="md"
                fontWeight="bold"
                h={14}
              >
                Get Started
              </Button>
              <Button
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                size="lg"
                variant="outline"
                colorScheme="teal"
                onClick={() => navigate('/login')}
                px={8}
                fontSize="md"
                fontWeight="bold"
                h={14}
              >
                Login
              </Button>
            </Stack>
          </MotionBox>

          {/* Features Section */}
          <Box w="full" py={10}>
            <Heading
              textAlign="center"
              size="xl"
              mb={12}
              color={headingColor}
            >
              Features
            </Heading>
            <SimpleGrid 
              columns={{ base: 1, md: 3 }} 
              spacing={{ base: 8, lg: 12 }}
              w="full"
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FeatureCard
                title="Track Your Diet"
                description="Log your daily meals and monitor your nutritional intake with ease."
                imageSrc="/images/trackingdiet-bg.jpeg"
                cardBg={cardBg}
                textColor={textColor}
                headingColor={headingColor}
                borderColor={borderColor}
                boxShadow={boxShadow}
              />
              <FeatureCard
                title="Monitor Workouts"
                description="Keep track of your exercises and calories burned during workouts."
                imageSrc="/images/monitor-bg.webp"
                cardBg={cardBg}
                textColor={textColor}
                headingColor={headingColor}
                borderColor={borderColor}
                boxShadow={boxShadow}
              />
              <FeatureCard
                title="View Progress"
                description="Visualize your progress with detailed charts and statistics."
                imageSrc="/images/charts-bg.jpg"
                cardBg={cardBg}
                textColor={textColor}
                headingColor={headingColor}
                borderColor={borderColor}
                boxShadow={boxShadow}
              />
            </SimpleGrid>
          </Box>

          {/* Updated Call-to-Action Section */}
          <Box 
            ref={journeyRef}
            as={motion.div}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            w="full" 
            py={16} 
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="2xl"
            px={8}
          >
            <VStack spacing={6}>
              <Heading 
                size="lg" 
                textAlign="center"
                color={headingColor}
              >
                Ready to Start Your Journey?
              </Heading>
              <Text
                fontSize="lg"
                textAlign="center"
                maxW="2xl"
                color={textColor}
              >
                Join thousands of users who have transformed their lifestyle with NutriFlow.
                Start tracking your progress today.
              </Text>
              <Button
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                size="lg"
                colorScheme="teal"
                onClick={() => navigate('/register')}
                px={8}
                fontSize="md"
                fontWeight="bold"
                h={14}
              >
                Start here today!
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

function FeatureCard({ 
  title, 
  description, 
  imageSrc,
  cardBg,
  textColor,
  headingColor,
  borderColor,
  boxShadow
}) {
  return (
    <MotionBox
      whileHover={{ y: -5 }}
      position="relative"
      height="300px"
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s ease"
    >
      {/* Background Image */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgImage={`url(${imageSrc})`}
        bgSize="cover"
        bgPosition="center"
        _after={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1
        }}
      />

      {/* Content */}
      <Box
        position="relative"
        zIndex={2}
        height="100%"
        p={6}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
      >
        <Heading 
          size="lg" 
          mb={4} 
          color="white"
          fontWeight="bold"
        >
          {title}
        </Heading>
        <Text 
          color="gray.100"
          fontSize="lg"
          maxW="sm"
        >
          {description}
        </Text>
      </Box>
    </MotionBox>
  );
}

export default Home;