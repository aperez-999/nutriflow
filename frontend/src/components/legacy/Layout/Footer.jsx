import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box as="footer" p={4} textAlign="center">
      <Text>&copy; {new Date().getFullYear()} Caloric Tracker App. All rights reserved.</Text>
    </Box>
  );
};

export default Footer;