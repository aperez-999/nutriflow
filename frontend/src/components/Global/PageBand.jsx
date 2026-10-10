import { Box, Container, Heading, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { DURATION, EASE_OUT } from '../Motion/tokens';

const MotionBox = motion(Box);

// Solid flow bands look the same in light and dark mode; text colors chosen for >= 4.5:1.
const BAND = {
  recover: { bg: 'recover.500', color: 'white', muted: 'whiteAlpha.900' },
  fuel: { bg: 'fuel.600', color: 'white', muted: 'whiteAlpha.900' },
  train: { bg: 'train.500', color: 'gray.900', muted: 'blackAlpha.800' },
};

/**
 * Header band that opens an app page. With `flow` it is a solid block of that flow's
 * color; without, it follows the light/dark surface.
 */
export default function PageBand({ title, description, flow, children }) {
  const band = BAND[flow];
  return (
    <Box
      as="section"
      bg={band ? band.bg : 'bg.surface'}
      color={band ? band.color : 'fg'}
      borderBottomWidth={band ? 0 : '1px'}
      borderColor="border"
    >
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 7, md: 10 }}>
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.slow, ease: EASE_OUT }}
        >
          <Heading as="h1" fontSize={{ base: '5xl', md: '7xl' }} lineHeight="0.9" color="inherit">{title}</Heading>
          {description && (
            <Text color={band ? band.muted : 'fg.muted'} fontSize={{ base: 'md', md: 'lg' }} mt={3} maxW="60ch">{description}</Text>
          )}
          {children}
        </MotionBox>
      </Container>
    </Box>
  );
}
