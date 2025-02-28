import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Flex as="header" p={4} justifyContent="space-between" alignItems="center">
      <Heading as={Link} to="/">Caloric Tracker</Heading>
      <Box>
        {user ? (
          <>
            <Button as={Link} to="/dashboard" mr={4}>Dashboard</Button>
            <Button onClick={logout}>Logout</Button>
          </>
        ) : (
          <>
            <Button as={Link} to="/login" mr={4}>Login</Button>
            <Button as={Link} to="/register">Register</Button>
          </>
        )}
      </Box>
    </Flex>
  );
};

export default Header;