import { Box, Container, DarkMode, Heading, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { DURATION, EASE_OUT } from '../Motion/tokens';

const MotionBox = motion(Box);

/** Black header band that opens each app page (same language as the dashboard scoreboard). */
export default function PageBand({ title, description, children }) {
  return (
    <DarkMode>
      <Box as="section" bg="bg.canvas" color="fg">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} pt={{ base: 7, md: 10 }} pb={{ base: 7, md: 10 }}>
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.slow, ease: EASE_OUT }}
          >
            <Heading as="h1" fontSize={{ base: '5xl', md: '7xl' }} lineHeight="0.9">{title}</Heading>
            {description && <Text color="fg.muted" fontSize={{ base: 'md', md: 'lg' }} mt={3} maxW="60ch">{description}</Text>}
            {children}
          </MotionBox>
        </Container>
      </Box>
    </DarkMode>
  );
}
