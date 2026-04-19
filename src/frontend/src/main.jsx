// Import StrictMode from React to enable additional development checks and warnings
import { StrictMode } from 'react'
// Import createRoot from React DOM — this is the modern way to render React apps (React 18+)
import { createRoot } from 'react-dom/client'
// Import global CSS styles that apply to the entire application
import './index.css'
// Import the root App component which contains all routes and pages
import App from './App.jsx'

import { Toaster } from 'react-hot-toast';

// Find the HTML element with id="root" in index.html and render the React app into it
// StrictMode wraps the app to highlight potential problems during development
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
  </StrictMode>,
)
