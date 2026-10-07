import { Box, Container, Flex, HStack, Icon, Link, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaInstagram, FaTwitter } from 'react-icons/fa';
import Logo from './Global/Logo';

const socialLinks = [
  { label: 'GitHub', icon: FaGithub, href: 'https://github.com/aperez-999' },
  { label: 'LinkedIn', icon: FaLinkedin, href: 'https://linkedin.com/in/alejandroperezrivero' },
  { label: 'Instagram', icon: FaInstagram, href: 'https://instagram.com/aperezzz' },
  { label: 'Twitter', icon: FaTwitter, href: 'https://twitter.com/aperez_999' },
];

const legalLinks = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Contact', to: '/contact' },
];

function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border" bg="bg.surface" mt={{ base: 10, md: 16 }}>
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={6}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} justify="space-between" align={{ base: 'flex-start', md: 'center' }}>
          <HStack spacing={4}>
            <Logo />
            <Text fontSize="sm" color="fg.muted">© {new Date().getFullYear()} PerezDev</Text>
          </HStack>
          <HStack spacing={5} flexWrap="wrap">
            {legalLinks.map((link) => (
              <Link key={link.to} as={RouterLink} to={link.to} fontSize="sm" color="fg.muted" _hover={{ color: 'fg' }}>
                {link.label}
              </Link>
            ))}
            <HStack spacing={3} pl={{ md: 2 }}>
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  isExternal
                  aria-label={social.label}
                  color="fg.muted"
                  _hover={{ color: 'fg' }}
                  display="inline-flex"
                >
                  <Icon as={social.icon} boxSize={4} />
                </Link>
              ))}
            </HStack>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

export default Footer;
