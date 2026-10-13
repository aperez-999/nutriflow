import { Box, Container, Grid, Heading, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import FlowBand from '../Global/FlowBand';
import { DURATION, EASE_OUT } from '../Motion/tokens';

const MotionBox = motion(Box);

/**
 * Split frame for sign-in, sign-up and password pages: a brand panel on large
 * screens (`panel`, different for each kind of visit), and the form on its own on phones.
 */
export default function AuthLayout({ title, description, children, footer, panel }) {
  return (
    <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} minH={{ lg: 'calc(100vh - 57px)' }}>
      {/* Brand panel follows light/dark mode; the verdicts carry the color. */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        flexDirection="column"
        justifyContent="space-between"
        bg="bg.surface"
        borderRightWidth="1px"
        borderColor="border"
        px={{ lg: 12, xl: 16 }}
        py={16}
      >
        {panel}
      </Box>

      <Box>
        <Box display={{ base: 'block', lg: 'none' }} px={4} pt={6}>
          <FlowBand barHeight="6px" gap={1} delay={0.05} />
        </Box>
        <Container maxW="420px" px={4} py={{ base: 8, md: 16, lg: 24 }}>
          <MotionBox
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: 0.1 }}
          >
            <Heading as="h1" size="xl">{title}</Heading>
            {description && <Text color="fg.muted" mt={3}>{description}</Text>}
            <Box mt={8}>{children}</Box>
            {footer && <Text fontSize="sm" color="fg.muted" mt={6}>{footer}</Text>}
          </MotionBox>
        </Container>
      </Box>
    </Grid>
  );
}
