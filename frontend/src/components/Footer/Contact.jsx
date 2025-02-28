import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';

const MotionBox = motion(Box);

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post('/api/contact', formData);
      
      toast({
        title: 'Message sent!',
        description: "We'll get back to you as soon as possible.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast({
        title: 'Error sending message',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box
      minH="100vh"
      bg={useColorModeValue('gray.50', 'gray.900')}
      pt={20}
      pb={10}
    >
      <Container maxW="4xl">
        <VStack spacing={8} align="start">
          <Heading size="2xl">Contact Us</Heading>
          
          <Text fontSize="lg">
            Have questions or feedback? We'd love to hear from you. Send us a
            message and we'll respond as soon as possible.
          </Text>

          <MotionBox
            as="form"
            onSubmit={handleSubmit}
            width="100%"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={6} align="start" width="100%">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  bg={useColorModeValue('white', 'gray.700')}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  bg={useColorModeValue('white', 'gray.700')}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  bg={useColorModeValue('white', 'gray.700')}
                  rows={6}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                width="full"
                isLoading={isLoading}
                loadingText="Sending..."
                as={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Message
              </Button>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
}

export default Contact; 