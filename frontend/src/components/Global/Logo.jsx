import { Box, HStack, Text } from '@chakra-ui/react';

/**
 * The NutriFlow mark: one day in the rhythm map, three stacked bars for
 * fuel, train and recover. The same shape is used for the app icon.
 */
export function LogoMark({ size = 22 }) {
  return (
    <Box as="svg" viewBox="0 0 24 24" w={`${size}px`} h={`${size}px`} flexShrink={0} aria-hidden="true">
      <rect x="2" y="3" width="20" height="5" rx="1.5" fill="var(--chakra-colors-fuel-solid)" />
      <rect x="2" y="9.5" width="14" height="5" rx="1.5" fill="var(--chakra-colors-train-solid)" />
      <rect x="2" y="16" width="17" height="5" rx="1.5" fill="var(--chakra-colors-recover-solid)" />
    </Box>
  );
}

export default function Logo() {
  return (
    <HStack spacing={2} align="center">
      <LogoMark />
      <Text as="span" fontWeight="800" fontSize="lg" letterSpacing="-0.02em" lineHeight="1" color="fg">
        NutriFlow
      </Text>
    </HStack>
  );
}
