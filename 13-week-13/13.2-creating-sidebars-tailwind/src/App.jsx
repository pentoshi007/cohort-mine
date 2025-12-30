/*
  ===========================================
  App.jsx - Main Application Component
  ===========================================
  
  This is the root component of our React application.
  It combines the Sidebar and MainContent to create the full dashboard layout.
  
  KEY CONCEPTS COVERED:
  1. Component composition - combining smaller components
  2. Flexbox layout for sidebar + main content
  3. CSS imports
*/

import './App.css'

// Import our custom components
import { Sidebar } from './components/Sidebar'
import { Sidebar1 } from './components/Sidebar1' // Your previous learning example
import { MainContent } from './components/MainContent'

/*
  ===========================================
  APP COMPONENT
  ===========================================
  
  The main layout structure:
  - A flex container that takes the full viewport width
  - Sidebar on the left (fixed width)
  - MainContent on the right (flex-1, takes remaining space)
*/
function App() {
  return (
    /*
      ===========================================
      ROOT CONTAINER
      ===========================================
      
      - flex: enables flexbox layout
      - min-h-screen: minimum height of 100vh (full viewport height)
      
      Children (Sidebar + MainContent) will be placed side by side.
    */
    <div className="flex min-h-screen">
      {/* 
        Sidebar Component
        - Contains navigation and theme toggle
        - Has its own width/responsive behavior
      */}
      <Sidebar />

      {/* 
        Main Content Component
        - Contains the dashboard content
        - flex-1 makes it take remaining space
      */}
      <MainContent />
    </div>
  )
}

export default App
