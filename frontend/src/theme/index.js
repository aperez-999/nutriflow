import { extendTheme } from '@chakra-ui/react';

/**
 * NutriFlow design system. See /DESIGN.md for the rationale.
 * Chrome is monochrome ink on paper; color only ever means data:
 *   fuel (meals), train (workouts), recover (check-ins, readiness).
 * Components should use the semantic tokens (fg, fg.muted, bg.surface, border, <flow>.fg ...)
 * rather than raw palette steps or useColorModeValue.
 */

// First visit follows the device; after that useAppearance owns the choice
// (light, dark, or follow device), so Chakra must not override it on OS changes.
const config = {
  initialColorMode: 'system',
  useSystemColorMode: false,
};

// Pure neutrals (no blue tint) replace Chakra's default gray everywhere.
const gray = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
};

// "ink" is the action color: solid buttons are black in light mode, near-white in dark mode.
const ink = {
  50: '#FAFAFA',
  100: '#F0F0F0',
  200: '#EDEDED',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#0A0A0A',
  600: '#262626',
  700: '#404040',
  800: '#171717',
  900: '#0A0A0A',
};

const fuel = {
  50: '#E8F6F1', 100: '#C8EBDF', 200: '#93D6BF', 300: '#5CC09F', 400: '#2FA984',
  500: '#14936F', 600: '#0E7A5C', 700: '#0B6049', 800: '#094A39', 900: '#06342A',
};
const train = {
  50: '#FDEFE8', 100: '#FAD7C6', 200: '#F4AE8D', 300: '#EE8656', 400: '#E86D36',
  500: '#E0561F', 600: '#B9441A', 700: '#923616', 800: '#6E2912', 900: '#4A1C0D',
};
const recover = {
  50: '#ECF0FC', 100: '#D2DBF7', 200: '#A7B8EF', 300: '#7B93E8', 400: '#5A76E0',
  500: '#3C5FD9', 600: '#2F4BB3', 700: '#253B8C', 800: '#1C2D69', 900: '#141F48',
};

const flowTokens = (name, solidDark) => ({
  // Data marks (bars, rings, map cells). Validated for CVD and >= 3:1 on the surface.
  [`${name}.solid`]: { default: `${name}.500`, _dark: solidDark },
  // Text-safe variant for labels and numbers (>= 4.5:1).
  [`${name}.fg`]: { default: `${name}.700`, _dark: `${name}.300` },
  // Quiet fill for selected states and chips.
  [`${name}.subtle`]: { default: `${name}.50`, _dark: `color-mix(in srgb, ${solidDark} 18%, transparent)` },
});

const theme = extendTheme({
  config,
  // Big Shoulders (Chicago signage, scoreboard figures) for display and numbers;
  // Schibsted Grotesk (newspaper grotesk) for text and UI. Both self-hosted via Fontsource.
  fonts: {
    heading: `'Big Shoulders Variable', 'Arial Narrow', ui-sans-serif, system-ui, sans-serif`,
    body: `'Schibsted Grotesk Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`,
  },
  colors: {
    gray,
    ink,
    fuel,
    train,
    recover,
  },
  radii: {
    control: '6px',
    panel: '10px',
  },
  zIndices: {
    tabBar: 1150,
  },
  semanticTokens: {
    colors: {
      'bg.canvas': { default: '#F5F5F5', _dark: '#0A0A0A' },
      'bg.surface': { default: '#FFFFFF', _dark: '#141414' },
      'bg.muted': { default: '#EFEFEF', _dark: '#1C1C1C' },
      border: { default: '#E3E3E3', _dark: '#2A2A2A' },
      'border.strong': { default: '#0A0A0A', _dark: '#EDEDED' },
      fg: { default: '#0A0A0A', _dark: '#EDEDED' },
      'fg.muted': { default: '#525252', _dark: '#A3A3A3' },
      'focus.ring': { default: '#3C5FD9', _dark: '#7B93E8' },
      // Text for destructive actions (delete); readable on surfaces in both modes.
      'danger.fg': { default: '#C53030', _dark: '#FC8181' },
      ...flowTokens('fuel', '#17977A'),
      ...flowTokens('train', '#D9561F'),
      ...flowTokens('recover', '#5070E8'),
      'chakra-body-bg': { default: '#F5F5F5', _dark: '#0A0A0A' },
      'chakra-body-text': { default: '#0A0A0A', _dark: '#EDEDED' },
      'chakra-border-color': { default: '#E3E3E3', _dark: '#2A2A2A' },
      'chakra-placeholder-color': { default: '#737373', _dark: '#8A8A8A' },
    },
    shadows: {
      // Only floating layers (menus, modals, toasts) cast a shadow.
      overlay: {
        default: '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.12)',
        _dark: '0 0 0 1px #2A2A2A, 0 8px 24px rgba(0, 0, 0, 0.6)',
      },
      outline: { default: '0 0 0 2px #3C5FD9', _dark: '0 0 0 2px #7B93E8' },
    },
  },
  textStyles: {
    // Condensed tabular numerals: scoreboard / nutrition-label figures.
    figure: {
      fontFamily: 'heading',
      fontWeight: 800,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: 0,
      lineHeight: 0.9,
    },
  },
  styles: {
    global: {
      html: {
        '@media (prefers-reduced-motion: no-preference)': { scrollBehavior: 'smooth' },
      },
      body: {
        bg: 'bg.canvas',
        color: 'fg',
        WebkitFontSmoothing: 'antialiased',
        WebkitTapHighlightColor: 'transparent',
      },
      'h1, h2, h3': {
        textWrap: 'balance',
      },
      '::selection': {
        background: 'recover.100',
        color: 'gray.900',
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
        fontWeight: 800,
        letterSpacing: 0,
        lineHeight: 0.95,
        color: 'fg',
      },
      // Small headings are UI labels, so they use the text face; larger ones use the display face.
      sizes: {
        xs: { fontFamily: 'body', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 },
        sm: { fontFamily: 'body', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3, fontSize: 'md' },
        md: { fontSize: '2xl' },
        lg: { fontSize: '4xl' },
        xl: { fontSize: { base: '4xl', md: '5xl' } },
        '2xl': { fontSize: { base: '5xl', md: '6xl' } },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: 'control',
        fontWeight: 600,
        transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.1s ease',
        // Pressed feedback; scale is disabled with the rest of motion under reduced motion.
        _active: { transform: 'scale(0.97)' },
      },
      variants: {
        // The default (gray) solid button is the ink primary; flow and status schemes keep their color.
        solid: (props) => {
          const scheme = ['ink', 'gray'].includes(props.colorScheme) ? 'ink' : props.colorScheme;
          if (scheme === 'ink') {
            return {
              bg: 'fg',
              color: 'bg.surface',
              _hover: { bg: props.colorMode === 'dark' ? '#FFFFFF' : '#262626', _disabled: { bg: 'fg' } },
              _active: { bg: props.colorMode === 'dark' ? '#D4D4D4' : '#404040' },
            };
          }
          return {
            bg: `${scheme}.600`,
            color: 'white',
            _hover: { bg: `${scheme}.700`, _disabled: { bg: `${scheme}.600` } },
            _active: { bg: `${scheme}.800` },
          };
        },
        outline: {
          bg: 'bg.surface',
          borderColor: 'border',
          color: 'fg',
          _hover: { bg: 'bg.muted' },
          _active: { bg: 'bg.muted' },
        },
        ghost: {
          color: 'fg',
          _hover: { bg: 'bg.muted' },
          _active: { bg: 'bg.muted' },
        },
        link: {
          color: 'fg',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        },
      },
      defaultProps: {
        colorScheme: 'ink',
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: 'bg.surface',
            color: 'fg',
            borderColor: 'border',
            borderRadius: 'control',
            _hover: { borderColor: 'gray.400' },
            _focusVisible: { borderColor: 'border.strong', boxShadow: '0 0 0 1px var(--chakra-colors-border-strong)' },
            _invalid: { borderColor: 'red.500', boxShadow: '0 0 0 1px var(--chakra-colors-red-500)' },
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: 'bg.surface',
            borderColor: 'border',
            borderRadius: 'control',
            _hover: { borderColor: 'gray.400' },
            _focusVisible: { borderColor: 'border.strong', boxShadow: '0 0 0 1px var(--chakra-colors-border-strong)' },
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          bg: 'bg.surface',
          borderColor: 'border',
          borderRadius: 'control',
          _hover: { borderColor: 'gray.400' },
          _focusVisible: { borderColor: 'border.strong', boxShadow: '0 0 0 1px var(--chakra-colors-border-strong)' },
        },
      },
    },
    NumberInput: {
      variants: {
        outline: {
          field: {
            bg: 'bg.surface',
            borderColor: 'border',
            borderRadius: 'control',
            _focusVisible: { borderColor: 'border.strong', boxShadow: '0 0 0 1px var(--chakra-colors-border-strong)' },
          },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: 'sm',
        fontWeight: 600,
        color: 'fg',
        mb: 1.5,
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'bg.surface',
          color: 'fg',
          borderWidth: '1px',
          borderColor: 'border',
          borderRadius: 'panel',
          boxShadow: 'none',
        },
      },
      variants: {
        // Kept so existing `variant="flat"` usages resolve; all panels are flat now.
        flat: {},
      },
      defaultProps: {
        variant: null,
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: '4px',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: 'xs',
        px: 2,
        py: 0.5,
        letterSpacing: 0,
      },
      variants: {
        subtle: (props) => {
          const scheme = ['gray', 'ink'].includes(props.colorScheme) ? null : props.colorScheme;
          if (!scheme) return { bg: 'bg.muted', color: 'fg' };
          if (['fuel', 'train', 'recover'].includes(scheme)) return { bg: `${scheme}.subtle`, color: `${scheme}.fg` };
          return {};
        },
      },
    },
    Tag: {
      baseStyle: {
        container: { borderRadius: '4px', fontWeight: 600 },
      },
    },
    Progress: {
      baseStyle: {
        track: { bg: 'bg.muted' },
      },
    },
    Tabs: {
      variants: {
        line: {
          tablist: { borderColor: 'border' },
          tab: {
            color: 'fg.muted',
            fontWeight: 600,
            _selected: { color: 'fg', borderColor: 'border.strong' },
            _hover: { color: 'fg' },
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        overlay: { bg: 'blackAlpha.600' },
        dialog: { bg: 'bg.surface', borderRadius: 'panel', boxShadow: 'overlay', borderWidth: '1px', borderColor: 'border' },
        header: { fontWeight: 700 },
      },
    },
    Drawer: {
      baseStyle: {
        dialog: { bg: 'bg.surface' },
      },
    },
    Menu: {
      baseStyle: {
        list: { bg: 'bg.surface', borderColor: 'border', boxShadow: 'overlay', borderRadius: 'panel', py: 1 },
        item: { bg: 'transparent', _hover: { bg: 'bg.muted' }, _focus: { bg: 'bg.muted' } },
      },
    },
    Tooltip: {
      baseStyle: {
        bg: 'fg',
        color: 'bg.surface',
        borderRadius: '4px',
        fontWeight: 500,
        px: 2,
        py: 1,
        '--popper-arrow-bg': 'var(--chakra-colors-fg)',
      },
    },
    Divider: {
      baseStyle: {
        borderColor: 'border',
        opacity: 1,
      },
    },
  },
});

export default theme;
