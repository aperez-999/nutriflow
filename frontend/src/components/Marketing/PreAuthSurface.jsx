/* eslint-disable react-refresh/only-export-components */
import {
  AspectRatio,
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const hoverMotion = {
  y: -4,
  scale: 1.01,
  transition: { duration: 0.22, ease: 'easeOut' },
};

export function usePreAuthPalette() {
  const shellBg = useColorModeValue('gray.50', '#020617');
  const shellText = useColorModeValue('gray.700', 'gray.300');
  const headingColor = useColorModeValue('gray.900', 'white');
  const surfaceBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(15, 23, 42, 0.82)');
  const surfaceBorder = useColorModeValue('gray.200', 'whiteAlpha.100');
  const mutedSurface = useColorModeValue('rgba(15, 23, 42, 0.03)', 'rgba(255, 255, 255, 0.04)');
  const accent = useColorModeValue('teal.600', 'teal.300');
  const accentStrong = useColorModeValue('cyan.600', 'cyan.300');
  const subtleBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputBg = useColorModeValue('white', 'rgba(15, 23, 42, 0.92)');
  const inputBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputFocus = useColorModeValue('teal.500', 'teal.300');
  const inputText = useColorModeValue('gray.800', 'white');
  const placeholder = useColorModeValue('gray.500', 'gray.400');
  const iconBg = useColorModeValue('teal.50', 'whiteAlpha.100');
  const iconColor = useColorModeValue('teal.600', 'teal.200');

  return {
    shellBg,
    shellText,
    headingColor,
    surfaceBg,
    surfaceBorder,
    mutedSurface,
    accent,
    accentStrong,
    subtleBorder,
    inputBg,
    inputBorder,
    inputFocus,
    inputText,
    placeholder,
    iconBg,
    iconColor,
  };
}

export function PreAuthShell({ children }) {
  const { shellBg, shellText } = usePreAuthPalette();
  const heroGradient = useColorModeValue(
    'linear(to-br, #f8fafc, #eef6f8 48%, #dffcf7 100%)',
    'linear(to-br, #020617, #0f172a 44%, #052e2b 100%)'
  );
  const gridOpacity = useColorModeValue(0.14, 0.22);
  const gridLineColor = useColorModeValue('rgba(15, 23, 42, 0.06)', 'rgba(255, 255, 255, 0.04)');
  const topGlow = useColorModeValue('teal.200', 'teal.400');
  const bottomGlow = useColorModeValue('cyan.200', 'cyan.500');
  const radialOverlay = useColorModeValue(
    'radial-gradient(circle at top left, rgba(20, 184, 166, 0.12), transparent 26%), radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 22%), radial-gradient(circle at bottom center, rgba(45, 212, 191, 0.08), transparent 26%)',
    'radial-gradient(circle at top left, rgba(45, 212, 191, 0.22), transparent 26%), radial-gradient(circle at top right, rgba(34, 211, 238, 0.16), transparent 22%), radial-gradient(circle at bottom center, rgba(15, 118, 110, 0.2), transparent 26%)'
  );

  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      bg={shellBg}
      color={shellText}
    >
      <Box
        position="absolute"
        inset={0}
        bgGradient={heroGradient}
        opacity={0.98}
      />
      <Box
        position="absolute"
        inset={0}
        bgImage={radialOverlay}
      />
      <Box
        position="absolute"
        top="-6rem"
        right="-6rem"
        boxSize="22rem"
        bg={topGlow}
        filter="blur(140px)"
        opacity={0.12}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-8rem"
        left="-8rem"
        boxSize="24rem"
        bg={bottomGlow}
        filter="blur(160px)"
        opacity={0.08}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        inset={0}
        bgImage={`linear-gradient(${gridLineColor} 1px, transparent 1px), linear-gradient(90deg, ${gridLineColor} 1px, transparent 1px)`}
        bgSize="72px 72px"
        sx={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent 88%)' }}
        opacity={gridOpacity}
      />
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </Box>
  );
}

export function PreAuthCard({ children, ...props }) {
  const { surfaceBg, surfaceBorder } = usePreAuthPalette();
  const cardShadow = useColorModeValue('0 20px 60px rgba(15, 23, 42, 0.10)', '0 20px 60px rgba(2, 6, 23, 0.35)');

  return (
    <Box
      position="relative"
      overflow="hidden"
      bg={surfaceBg}
      borderWidth="1px"
      borderColor={surfaceBorder}
      borderRadius="2xl"
      boxShadow={cardShadow}
      backdropFilter="blur(20px)"
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        pointerEvents: 'none',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

// Transform-only reveal: content is never hidden, so it still renders for print,
// link previews, headless capture, or if the in-view observer never fires.
export function Reveal({ children, delay = 0, ...props }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <MotionBox
      initial={reducedMotion ? false : { y: 24 }}
      whileInView={reducedMotion ? undefined : { y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      {...props}
    >
      {children}
    </MotionBox>
  );
}

export function SectionEyebrow({ children }) {
  const { accent, shellText, headingColor, surfaceBorder, mutedSurface } = usePreAuthPalette();

  return (
    <HStack
      spacing={2}
      align="center"
      px={3}
      py={1.5}
      borderRadius="full"
      borderWidth="1px"
      borderColor={surfaceBorder}
      bg={mutedSurface}
      backdropFilter="blur(10px)"
      color={headingColor}
      fontSize="xs"
      fontWeight="700"
      letterSpacing="0.18em"
      textTransform="uppercase"
      w="fit-content"
    >
      <Box boxSize={2} borderRadius="full" bg={accent} />
      <Text color={shellText}>{children}</Text>
    </HStack>
  );
}

export function MarketingMetric({ label, value, detail }) {
  const { surfaceBorder, mutedSurface, headingColor, shellText } = usePreAuthPalette();
  const metricHoverBorder = useColorModeValue('gray.300', 'whiteAlpha.200');

  return (
    <Box
      p={4}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={surfaceBorder}
      bg={mutedSurface}
      transition="transform 0.2s ease, border-color 0.2s ease, background 0.2s ease"
      _hover={{ borderColor: metricHoverBorder, transform: 'translateY(-1px)' }}
    >
      <Text fontSize="xs" fontWeight="700" letterSpacing="0.16em" textTransform="uppercase" color={shellText}>
        {label}
      </Text>
      <Heading as="p" size="md" color={headingColor} mt={2}>
        {value}
      </Heading>
      <Text mt={1.5} fontSize="sm" color={shellText}>
        {detail}
      </Text>
    </Box>
  );
}

export function MarketingFeatureCard({ icon, title, description, bullets, accent, media }) {
  const { surfaceBg, surfaceBorder, headingColor, shellText, mutedSurface } = usePreAuthPalette();
  const reducedMotion = usePrefersReducedMotion();
  const imageOverlay = useColorModeValue(
    'linear(to-t, rgba(2, 6, 23, 0.48), transparent 56%)',
    'linear(to-t, rgba(2, 6, 23, 0.72), transparent 56%)'
  );

  return (
    <MotionBox
      whileHover={reducedMotion ? undefined : hoverMotion}
      h="full"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={surfaceBorder}
      bg={surfaceBg}
      boxShadow="lg"
      overflow="hidden"
      transition="all 0.22s ease"
      _before={{
        content: '""',
        display: 'block',
        height: '4px',
        bgGradient: `linear(to-r, ${accent || 'teal.400'}, cyan.400)`,
      }}
    >
      {media ? (
        <AspectRatio ratio={16 / 9}>
          <Box position="relative" overflow="hidden" borderBottomWidth="1px" borderBottomColor={surfaceBorder}>
            <Image
              src={media.src}
              alt={media.alt}
              w="full"
              h="full"
              objectFit="cover"
              objectPosition={media.objectPosition || 'center'}
              loading={media.loading || 'lazy'}
              decoding="async"
              draggable={false}
            />
            <Box
              position="absolute"
              inset={0}
              bgGradient={imageOverlay}
            />
            <Box
              position="absolute"
              inset={0}
              bgImage="radial-gradient(circle at top left, rgba(45, 212, 191, 0.18), transparent 30%)"
            />
          </Box>
        </AspectRatio>
      ) : null}

      <Box p={6} h="full">
        <VStack align="start" spacing={4} h="full">
          <HStack spacing={3}>
            <Box
              p={3}
              borderRadius="xl"
              bg={mutedSurface}
              color={accent || 'teal.400'}
              borderWidth="1px"
              borderColor={surfaceBorder}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box as={icon} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.16em" textTransform="uppercase" color={shellText}>
                Smart workflow
              </Text>
              <Heading as="h3" size="md" color={headingColor} mt={1}>
                {title}
              </Heading>
            </Box>
          </HStack>

          <Text color={shellText} lineHeight="tall">
            {description}
          </Text>

          <Stack spacing={2} w="full" mt="auto">
            {bullets.map((bullet) => (
              <HStack key={bullet} spacing={3} align="start">
                <Box boxSize={2.5} borderRadius="full" bg={accent || 'teal.400'} mt={2} flexShrink={0} />
                <Text fontSize="sm" color={shellText}>
                  {bullet}
                </Text>
              </HStack>
            ))}
          </Stack>
        </VStack>
      </Box>
    </MotionBox>
  );
}

export function MarketingStepCard({ step, title, description, media, accent }) {
  const { surfaceBg, surfaceBorder, headingColor, shellText } = usePreAuthPalette();
  const reducedMotion = usePrefersReducedMotion();
  const stepTagBg = useColorModeValue('whiteAlpha.800', 'blackAlpha.600');
  const stepTagColor = useColorModeValue('gray.900', 'white');
  const stepOverlayGradient = useColorModeValue(
    'linear(to-t, rgba(2, 6, 23, 0.52), transparent 60%)',
    'linear(to-t, rgba(2, 6, 23, 0.76), transparent 60%)'
  );

  return (
    <MotionBox
      whileHover={reducedMotion ? undefined : hoverMotion}
      h="full"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={surfaceBorder}
      bg={surfaceBg}
      boxShadow="lg"
      overflow="hidden"
      transition="all 0.22s ease"
    >
      <AspectRatio ratio={16 / 10}>
        <Box position="relative" overflow="hidden">
          <Image
            src={media.src}
            alt={media.alt}
            w="full"
            h="full"
            objectFit="cover"
            objectPosition={media.objectPosition || 'center'}
            loading={media.loading || 'lazy'}
            decoding="async"
            draggable={false}
          />
          <Box position="absolute" inset={0} bgGradient={stepOverlayGradient} />
          <Box
            position="absolute"
            top={4}
            left={4}
            px={3}
            py={1.5}
            borderRadius="full"
            bg={stepTagBg}
            color={stepTagColor}
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.16em"
            textTransform="uppercase"
          >
            Step {step}
          </Box>
          <Box
            position="absolute"
            right={4}
            bottom={4}
            px={3}
            py={1.5}
            borderRadius="full"
            bg={accent || 'teal.400'}
            color="#020617"
            fontSize="xs"
            fontWeight="800"
          >
            {title}
          </Box>
        </Box>
      </AspectRatio>
      <Box p={6}>
        <VStack align="start" spacing={3}>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.16em" textTransform="uppercase" color={shellText}>
            How it works
          </Text>
          <Heading as="h3" size="md" color={headingColor} letterSpacing="-0.02em">
            {title}
          </Heading>
          <Text color={shellText} lineHeight="tall">
            {description}
          </Text>
        </VStack>
      </Box>
    </MotionBox>
  );
}

export function PreAuthIntroPanel({ eyebrow, title, description, bullets }) {
  const { headingColor, shellText, surfaceBorder, mutedSurface, accent } = usePreAuthPalette();

  return (
    <VStack align="stretch" spacing={5} h="full" justify="center">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <Box maxW="xl">
        <Heading as="h1" size={{ base: '2xl', md: '3xl' }} lineHeight="0.98" color={headingColor} letterSpacing="-0.04em">
          {title}
        </Heading>
      </Box>
      <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="tall" color={shellText} maxW="xl">
        {description}
      </Text>

      <VStack spacing={3} align="stretch">
        {bullets.map((bullet) => (
          <HStack
            key={bullet}
            spacing={3}
            p={3.5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={surfaceBorder}
            bg={mutedSurface}
            align="start"
          >
            <Box boxSize={2.5} borderRadius="full" bg={accent} mt={2} flexShrink={0} />
            <Text color={shellText}>{bullet}</Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

export function getAuthInputStyles(palette) {
  return {
    size: 'lg',
    h: 14,
    borderRadius: 'xl',
    pl: 14,
    pr: 14,
    bg: palette.inputBg,
    borderColor: palette.inputBorder,
    color: palette.inputText,
    _placeholder: { color: palette.placeholder },
    _hover: { borderColor: 'teal.300' },
    _focusVisible: {
      borderColor: palette.inputFocus,
      boxShadow: `0 0 0 1px ${palette.inputFocus}`,
    },
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  };
}

export function AuthIconBox({ children }) {
  const { iconBg, iconColor, inputBorder } = usePreAuthPalette();

  return (
    <Box
      w="2.25rem"
      h="2.25rem"
      borderRadius="lg"
      bg={iconBg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      color={iconColor}
      borderWidth="1px"
      borderColor={inputBorder}
    >
      {children}
    </Box>
  );
}

export function AuthActionButton({ children, ...props }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Button
      size="lg"
      h={14}
      w="full"
      color="white"
      bgGradient="linear(to-r, teal.400, cyan.400)"
      boxShadow="0 16px 30px rgba(20, 184, 166, 0.24)"
      _hover={{
        bgGradient: 'linear(to-r, teal.300, cyan.300)',
        transform: reducedMotion ? 'none' : 'translateY(-1px)',
        boxShadow: '0 18px 34px rgba(20, 184, 166, 0.3)',
      }}
      _active={{ transform: 'translateY(0)' }}
      transition="transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease"
      {...props}
    >
      {children}
    </Button>
  );
}
