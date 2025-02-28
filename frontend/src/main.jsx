import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import theme from './theme'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ChakraProvider>
    </Router>
  </React.StrictMode>
)