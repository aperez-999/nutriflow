import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';

const Header = () => {
  return (
    <Flex as="header" p={4} justifyContent="space-between" alignItems="center">
      <Heading as={Link} to="/">Caloric Tracker</Heading>
      <Box>
        <Button as={Link} to="/login" mr={4}>Login</Button>
        <Button as={Link} to="/register">Register</Button>
      </Box>
    </Flex>
  );
};

export default Header;
