import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import AppRoutes from './routes'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import FloatingAICoachButton from './components/Global/FloatingAICoachButton'

function App() {
  return (
    <Flex flexDirection="column" minH="100vh">
      <Navbar />
      <Box flex="1">
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </Box>
      <Footer />
      <FloatingAICoachButton />
    </Flex>
  )
}

export default App