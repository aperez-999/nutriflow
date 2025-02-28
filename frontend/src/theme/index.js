import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.2s ease-in-out',
      },
    },
    Input: {
      variants: {
        outline: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
            color: props.colorMode === 'dark' ? 'white' : 'gray.800',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.300',
            },
            _focus: {
              borderColor: 'teal.500',
              boxShadow: `0 0 0 1px var(--chakra-colors-teal-500)`,
            },
          },
        }),
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
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
          color: props.colorMode === 'dark' ? 'white' : 'gray.800',
          transition: 'all 0.2s ease-in-out',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: 'xl',
          },
        },
      }),
    },
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
  },
});

export default theme; 