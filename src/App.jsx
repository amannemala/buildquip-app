import { useState } from 'react'
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Submittals from './components/Submittals'
import Procurement from './components/Procurement'
import Projects from './components/Projects'

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
    },
    secondary: {
      main: '#28a745',
    },
  },
})

function App() {
  const [activeSection, setActiveSection] = useState('projects')

  const renderSection = (arg) => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />
      case 'submittals':
        return <Submittals />
      case 'procurement':
        return <Procurement />
      case 'projects':
        return <Projects />
      default:
        return <Procurement />
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} setCurrentView={setActiveSection} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            ml: '220px',
            '@media (max-width: 768px)': {
              ml: 0,
            },
          }}
        >
          {renderSection()}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
