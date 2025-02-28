import React from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  IconButton,
  Divider,
  useColorModeValue,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaInstagram, FaTwitter } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

function Footer() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const iconHoverColor = useColorModeValue('teal.500', 'teal.300');
  const year = new Date().getFullYear();

  const socialLinks = [
    {
      label: 'GitHub',
      icon: <FaGithub size="20px" />,
      href: 'https://github.com/aperez-999',
    },
    {
      label: 'LinkedIn',
      icon: <FaLinkedin size="20px" />,
      href: 'https://linkedin.com/in/alejandroperezrivero',
    },
    {
      label: 'Instagram',
      icon: <FaInstagram size="20px" />,
      href: 'https://instagram.com/aperezzz',
    },
    {
      label: 'Twitter',
      icon: <FaTwitter size="20px" />,
      href: 'https://twitter.com/aperez_999',
    },
  ];

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      as="footer"
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      py={8}
      mt="auto"
    >
      <Container maxW="container.xl">
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify="space-between"
          align="center"
          mb={8}
        >
          <Text
            fontSize="lg"
            fontWeight="semibold"
            bgGradient="linear(to-r, teal.400, blue.500)"
            bgClip="text"
          >
            NutriFlow
          </Text>
          <Stack direction="row" spacing={4}>
            {socialLinks.map((social) => (
              <IconButton
                key={social.label}
                as={ChakraLink}
                href={social.href}
                target="_blank"
                aria-label={social.label}
                icon={social.icon}
                variant="ghost"
                color={iconColor}
                _hover={{
                  bg: useColorModeValue('teal.50', 'teal.900'),
                  color: iconHoverColor,
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.2s"
              />
            ))}
          </Stack>
        </Stack>

        <Divider mb={8} borderColor={borderColor} />

        <Stack
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          fontSize="sm"
          color={textColor}
        >
          <Text>
            © {year} PerezDev. All rights reserved.
          </Text>
          <Stack direction="row" spacing={6}>
            <ChakraLink
              as={RouterLink}
              to="/privacy"
              color={textColor}
              _hover={{ color: iconHoverColor }}
            >
              Privacy Policy
            </ChakraLink>
            <ChakraLink
              as={RouterLink}
              to="/terms"
              color={textColor}
              _hover={{ color: iconHoverColor }}
            >
              Terms of Service
            </ChakraLink>
            <ChakraLink
              as={RouterLink}
              to="/contact"
              color={textColor}
              _hover={{ color: iconHoverColor }}
            >
              Contact
            </ChakraLink>
          </Stack>
        </Stack>
      </Container>
    </MotionBox>
  );
}

export default Footer; 