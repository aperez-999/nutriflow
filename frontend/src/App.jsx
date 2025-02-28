import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import AppRoutes from './routes'
import Footer from './components/Footer'

function App() {
  return (
    <Flex flexDirection="column" minH="100vh">
      <Navbar />
      <Box flex="1">
        <AppRoutes />
      </Box>
      <Footer />
    </Flex>
  )
}

export default App