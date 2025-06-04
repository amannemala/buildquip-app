import { useState, useEffect } from 'react'
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Submittals from './components/Submittals'
import Procurement from './components/Procurement'
import Projects from './components/Projects'
import Landing from './components/Landing'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
})

function AppContent() {
  const location = useLocation()
  const getSectionFromPath = (pathname) => {
    if (pathname === '/') return 'landing'
    if (pathname.startsWith('/dashboard')) return 'dashboard'
    if (pathname.startsWith('/submittals')) return 'submittals'
    if (pathname.startsWith('/procurement')) return 'procurement'
    if (pathname.startsWith('/projects')) return 'projects'
    return 'landing'
  }
  const [activeSection, setActiveSection] = useState(getSectionFromPath(location.pathname))
  useEffect(() => {
    setActiveSection(getSectionFromPath(location.pathname))
  }, [location.pathname])
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { md: '220px', xs: 0 },
          '@media (max-width: 768px)': {
            ml: 0,
          },
        }}
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submittals" element={<Submittals />} />
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </Box>
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App
