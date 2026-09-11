import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  Icon,
  IconButton,
  Link as ChakraLink,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaInstagram, FaTwitter } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const MotionBox = motion(Box);

const socialLinks = [
  {
    label: 'GitHub',
    icon: FaGithub,
    href: 'https://github.com/aperez-999',
  },
  {
    label: 'LinkedIn',
    icon: FaLinkedin,
    href: 'https://linkedin.com/in/alejandroperezrivero',
  },
  {
    label: 'Instagram',
    icon: FaInstagram,
    href: 'https://instagram.com/aperezzz',
  },
  {
    label: 'Twitter',
    icon: FaTwitter,
    href: 'https://twitter.com/aperez_999',
  },
];

function Footer() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(user);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const surfaceColor = useColorModeValue('white', 'whiteAlpha.50');
  const surfaceBorderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const iconColor = useColorModeValue('gray.600', 'gray.300');
  const iconHoverColor = useColorModeValue('teal.600', 'teal.200');
  const socialHoverBg = useColorModeValue('teal.50', 'whiteAlpha.100');
  const linkHoverColor = useColorModeValue('teal.600', 'teal.200');
  const panelShadow = useColorModeValue('0 20px 50px rgba(15, 23, 42, 0.08)', '0 20px 50px rgba(2, 6, 23, 0.24)');
  const panelHoverShadow = useColorModeValue('0 24px 60px rgba(15, 23, 42, 0.12)', '0 24px 60px rgba(2, 6, 23, 0.28)');
  const year = new Date().getFullYear();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const footerGroups = isLoggedIn
    ? [
        {
          title: 'Product',
          links: [
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Fitness Hub', to: '/fitness-hub' },
          ],
        },
        {
          title: 'Support',
          links: [
            { label: 'Profile & Settings', to: '/settings' },
            { label: 'Logout', onClick: handleLogout },
            { label: 'Contact', to: '/contact' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Service', to: '/terms' },
          ],
        },
      ]
    : [
        {
          title: 'Product',
          links: [
            { label: 'Get Started', to: '/register' },
            { label: 'Login', to: '/login' },
          ],
        },
        {
          title: 'Support',
          links: [
            { label: 'Contact', to: '/contact' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Service', to: '/terms' },
          ],
        },
      ];

  const primaryActions = isLoggedIn
    ? [
        { label: 'Dashboard', to: '/dashboard', variant: 'solid' },
        { label: 'Fitness Hub', to: '/fitness-hub', variant: 'outline' },
        { label: 'Logout', onClick: handleLogout, variant: 'ghost', icon: FiLogOut },
      ]
    : [
        { label: 'Get Started', to: '/register', variant: 'solid' },
        { label: 'Login', to: '/login', variant: 'outline' },
      ];

  return (
    <MotionBox
      as="footer"
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      mt="auto"
      py={{ base: 10, md: 12 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Container maxW="container.xl">
        <Box
          mb={8}
          p={{ base: 5, md: 6 }}
          bg={surfaceColor}
          borderWidth="1px"
          borderColor={surfaceBorderColor}
          borderRadius="2xl"
          boxShadow={panelShadow}
          backdropFilter="blur(16px)"
          transition="all 0.2s ease"
          _hover={{ boxShadow: panelHoverShadow }}
        >
          <SimpleGrid columns={{ base: 1, md: 2, xl: 5 }} spacing={{ base: 8, lg: 10 }}>
            <Box gridColumn={{ xl: 'span 2' }}>
              <Text
                mb={3}
                fontSize="sm"
                fontWeight="700"
                letterSpacing="wider"
                textTransform="uppercase"
                color={mutedTextColor}
              >
                NutriFlow
              </Text>
              <Heading as="h2" size="md" color={headingColor} maxW="sm" lineHeight="1.2">
                A clearer way to plan meals, track training, and stay ready for the day.
              </Heading>
              <Text mt={3} maxW="md" color={textColor} lineHeight="tall">
                Built for the same clean workflow you see across the dashboard, with fast access to the tools people actually use.
              </Text>

              <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} mt={5}>
                {primaryActions.map((action) => (
                  action.to ? (
                    <Button
                      key={action.label}
                      as={RouterLink}
                      to={action.to}
                      leftIcon={action.icon ? <Icon as={action.icon} boxSize={4} /> : undefined}
                      colorScheme="teal"
                      variant={action.variant}
                      borderRadius="full"
                      size="md"
                      _hover={{ transform: 'translateY(-1px)' }}
                    >
                      {action.label}
                    </Button>
                  ) : (
                    <Button
                      key={action.label}
                      onClick={action.onClick}
                      leftIcon={action.icon ? <Icon as={action.icon} boxSize={4} /> : undefined}
                      colorScheme="teal"
                      variant={action.variant}
                      borderRadius="full"
                      size="md"
                      _hover={{ transform: 'translateY(-1px)' }}
                    >
                      {action.label}
                    </Button>
                  )
                ))}
              </Stack>
            </Box>

            {footerGroups.map((group) => (
              <VStack key={group.title} align="start" spacing={3}>
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  letterSpacing="wider"
                  color={headingColor}
                  textTransform="uppercase"
                >
                  {group.title}
                </Text>
                <VStack align="start" spacing={2}>
                  {group.links.map((link) => (
                    link.onClick ? (
                      <Button
                        key={link.label}
                        variant="link"
                        color={textColor}
                        fontSize="sm"
                        fontWeight="500"
                        justifyContent="flex-start"
                        h="auto"
                        p={0}
                        onClick={link.onClick}
                        transition="color 0.2s ease"
                        _hover={{ color: linkHoverColor, textDecoration: 'none' }}
                      >
                        {link.label}
                      </Button>
                    ) : (
                      <ChakraLink
                        key={link.label}
                        as={RouterLink}
                        to={link.to}
                        color={textColor}
                        fontSize="sm"
                        fontWeight="500"
                        transition="color 0.2s ease"
                        _hover={{ color: linkHoverColor, textDecoration: 'none' }}
                      >
                        {link.label}
                      </ChakraLink>
                    )
                  ))}
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Box>

        <Stack
          spacing={{ base: 6, lg: 4 }}
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          align={{ base: 'start', lg: 'center' }}
        >
          <Stack spacing={2}>
            <Text fontSize="sm" fontWeight="600" color={headingColor}>
              NutriFlow
            </Text>
            <Text fontSize="sm" color={textColor}>
              © {year} PerezDev. All rights reserved.
            </Text>
          </Stack>

          <HStack spacing={2} flexWrap="wrap">
            {socialLinks.map((social) => (
              <IconButton
                key={social.label}
                as="a"
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                icon={<Icon as={social.icon} boxSize={5} />}
                variant="ghost"
                color={iconColor}
                borderRadius="full"
                transition="all 0.2s ease"
                _hover={{
                  bg: socialHoverBg,
                  color: iconHoverColor,
                  transform: 'translateY(-2px)',
                }}
              />
            ))}
          </HStack>
        </Stack>

        <Divider my={8} borderColor={borderColor} />

        <Stack
          spacing={3}
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'start', md: 'center' }}
          fontSize="xs"
          color={textColor}
        >
          <Text>Designed to feel consistent whether you are signed in or browsing the public site.</Text>
          <Text>Fast, clean, and lightweight interactions with a dashboard-first layout.</Text>
        </Stack>
      </Container>
    </MotionBox>
  );
}

export default Footer;
