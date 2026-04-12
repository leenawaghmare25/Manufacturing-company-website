// Import React Router components for client-side navigation
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import the JobProvider context which provides global job state to all pages
import { JobProvider } from './context/JobContext';

// Import all page components — each represents a different screen in the app
import Login from './pages/Login';                       // Login page for authentication
import ManagerDashboard from './pages/ManagerDashboard'; // Job Manager's main dashboard
import WorkerDashboard from './pages/WorkerDashboard';   // Production Staff's personal dashboard
import WorkerTaskPanel from './pages/WorkerTaskPanel';   // Detailed task view for a specific job
import CreateJob from './pages/CreateJob';               // Form to create a new manufacturing job
import JobTracking from './pages/JobTracking';           // Detailed view of a specific job's progress
import QualityCheck from './pages/QualityCheck';         // Quality check inspection page
import Rework from './pages/Rework';                     // Rework order submission page
import EditJob from './pages/EditJob';                   // Form to edit an existing job
import ManageTeams from './pages/ManageTeams';           // Team and worker management page

// --- INVENTORY APP ---
import InventoryApp from './inventory/InventoryApp';

// --- UNIFIED NAVBAR ---
import UnifiedNavbar from './components/UnifiedNavbar';

// Main App component — defines the application's routing structure
function App() {
  return (
    // JobProvider wraps everything so all pages can access shared job data
    <JobProvider>
      {/* Router enables client-side navigation without full page reloads */}
      <Router>
        {/* Global Unified Navbar */}
        <UnifiedNavbar />

        {/* Routes container — only one Route matches at a time based on the current URL */}
        <Routes>
          {/* Public route — Login page */}
          <Route path="/login" element={<Login />} />
          
          {/* Job Manager routes */}
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />  {/* Manager's main dashboard */}
          <Route path="/manage-teams" element={<ManageTeams />} />            {/* Team management page */}
          <Route path="/create-job" element={<CreateJob />} />                {/* Create new job form */}
          <Route path="/jobs/:id/edit" element={<EditJob />} />               {/* Edit existing job */}
          
          {/* Production Staff routes */}
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />    {/* Worker's personal dashboard */}
          <Route path="/worker" element={<WorkerTaskPanel />} />              {/* Legacy worker task view */}
          
          {/* Shared routes (accessible by both roles) */}
          <Route path="/job/:id" element={<JobTracking />} />                 {/* Job detail/tracking page */}
          <Route path="/job/:id/qc" element={<QualityCheck />} />             {/* Quality check for a job */}
          <Route path="/job/:id/rework" element={<Rework />} />               {/* Rework order for a job */}
          <Route path="/job/:id/tasks" element={<WorkerTaskPanel />} />       {/* Task panel for a specific job */}
          
          {/* === INVENTORY & ORDER APP PORTALS === */}
          <Route path="/inventory/*" element={<InventoryApp />} />
          <Route path="/orders/*" element={<Navigate to="/inventory/orders" replace />} />

          {/* Default route — redirect to login if no path matches */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </JobProvider>
  );
}

export default App;
