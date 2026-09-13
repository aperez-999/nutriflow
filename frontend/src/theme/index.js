import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

/**
 * NutriFlow identity: every day is three flows.
 *   Fuel (amber)   – what you eat
 *   Train (teal)   – how you move (the existing `brand` scale)
 *   Recover (violet) – how you rest and feel
 * Use the semantic tokens below in components instead of ad-hoc gray values.
 */
const theme = extendTheme({
  config,
  fonts: {
    heading: `'Bricolage Grotesque', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`,
    body: `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif`,
  },
  // Semantic tokens for consistent, professional layout (dashboard, FitnessHub, future screens).
  space: {
    section: '8',
    card: '6',
    block: '4',
  },
  radii: {
    card: '2xl',
    panel: 'xl',
    input: 'md',
  },
  zIndices: {
    tabBar: 1150,
  },
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#38B2AC',
      500: '#319795',
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#1D4044',
    },
    fuel: {
      50: '#FFF6E8',
      100: '#FFE6C2',
      200: '#FFD08A',
      300: '#FDB654',
      400: '#F59E2A',
      500: '#E07F0F',
      600: '#B9630A',
      700: '#8F4B0B',
      800: '#6B390E',
      900: '#4A280C',
    },
    recover: {
      50: '#F4F1FF',
      100: '#E6DEFF',
      200: '#CDBEFF',
      300: '#AF97FB',
      400: '#9474F2',
      500: '#7A55E0',
      600: '#6341C0',
      700: '#4E3398',
      800: '#3B2873',
      900: '#291C50',
    },
  },
  semanticTokens: {
    colors: {
      'bg.canvas': { default: '#F4F7F7', _dark: '#0D1413' },
      'bg.surface': { default: 'white', _dark: '#141D1C' },
      'bg.subtle': { default: '#EEF3F2', _dark: '#1B2625' },
      'border.subtle': { default: '#DDE5E4', _dark: '#25312F' },
      'text.primary': { default: '#13201E', _dark: '#EAF2F1' },
      'text.muted': { default: '#4A5856', _dark: '#A3B3B1' },
      'train.fg': { default: 'brand.600', _dark: 'brand.300' },
      'train.bg': { default: 'brand.50', _dark: 'rgba(56, 178, 172, 0.14)' },
      'fuel.fg': { default: 'fuel.600', _dark: 'fuel.300' },
      'fuel.bg': { default: 'fuel.50', _dark: 'rgba(245, 158, 42, 0.14)' },
      'recover.fg': { default: 'recover.600', _dark: 'recover.300' },
      'recover.bg': { default: 'recover.50', _dark: 'rgba(148, 116, 242, 0.16)' },
      // Chart marks. Validated with the dataviz palette checker (CVD ΔE ≥ 13, ≥ 3:1 vs surface).
      'data.fuel': { default: '#C96A06', _dark: '#D27605' },
      'data.train': { default: '#0A9E8F', _dark: '#0E9F8F' },
      'data.recover': { default: '#7A55E0', _dark: '#8C68EE' },
      'data.empty': { default: '#E3EAE9', _dark: '#222E2C' },
    },
    shadows: {
      card: {
        default: '0 1px 2px rgba(16, 40, 38, 0.06), 0 4px 16px rgba(16, 40, 38, 0.05)',
        _dark: '0 1px 2px rgba(0, 0, 0, 0.4)',
      },
      cardHover: {
        default: '0 2px 4px rgba(16, 40, 38, 0.08), 0 12px 28px rgba(16, 40, 38, 0.10)',
        _dark: '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'bg.canvas',
        color: 'text.primary',
        WebkitTapHighlightColor: 'transparent',
      },
      'h1, h2, h3': {
        textWrap: 'balance',
      },
      '@media (prefers-reduced-motion: reduce)': {
        '*, *::before, *::after': {
          animationDuration: '0.01ms !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    },
  },
  components: {
    Heading: {
      baseStyle: {
        letterSpacing: '-0.02em',
        fontWeight: 700,
      },
    },
    Button: {
      baseStyle: {
        _hover: {
          transform: 'translateY(-1px)',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: 'bg.surface',
            color: 'text.primary',
            borderColor: 'border.subtle',
            _hover: {
              borderColor: 'brand.300',
            },
            _focusVisible: {
              borderColor: 'brand.500',
              boxShadow: `0 0 0 1px var(--chakra-colors-brand-500)`,
            },
          },
        },
      },
    },
    Form: {
      variants: {
        floating: (props) => ({
          container: {
            _focusWithin: {
              label: {
                color: props.colorMode === 'dark' ? 'teal.300' : 'teal.500',
              },
            },
            'input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label': {
              color: props.colorMode === 'dark' ? 'gray.300' : 'gray.600',
            },
            label: {
              color: props.colorMode === 'dark' ? 'gray.400' : 'gray.600',
            },
          },
        }),
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'bg.surface',
          color: 'text.primary',
          borderWidth: '1px',
          borderColor: 'border.subtle',
          boxShadow: 'card',
          transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease',
          borderRadius: '2xl',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'cardHover',
          },
        },
      },
      variants: {
        flat: {
          container: {
            _hover: { transform: 'none', boxShadow: 'card' },
          },
        },
      },
      defaultProps: {
        variant: null,
      },
    },
  },
});

export default theme;
