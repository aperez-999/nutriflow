import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { MotionConfig } from 'framer-motion'
import '@fontsource-variable/big-shoulders/opsz.css'
import '@fontsource-variable/schibsted-grotesk/index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import theme from './theme'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        {/* Framer Motion skips transform/layout animation when the OS asks for reduced motion. */}
        <MotionConfig reducedMotion="user">
          <AuthProvider>
            <App />
          </AuthProvider>
        </MotionConfig>
      </ChakraProvider>
    </Router>
  </React.StrictMode>
)