// Import React and useState hook for form state management
import React, { useState } from 'react';
// Import useNavigate for redirecting after job creation
import { useNavigate } from 'react-router-dom';
// Import the useJobs hook to access the addJob function from JobContext
import { useJobs } from '../context/JobContext';
// Import the back arrow icon for the navigation button
import { ArrowLeft } from 'lucide-react';

// ============================================================
// CREATE JOB PAGE — Form for creating a new manufacturing job
// Job Managers use this page to define new jobs with product details,
// team assignment, priority level, and deadline.
// ============================================================

const CreateJob = () => {
  const navigate = useNavigate();   // Hook for page navigation
  const { addJob } = useJobs();     // Get the addJob function from the shared context

  // Form data state — stores all the fields for a new job
  const [formData, setFormData] = useState({
    product: '',          // Product name (e.g., "Circuit Board A")
    quantity: '',          // Number of units to manufacture
    team: '',              // Assigned team (e.g., "Team Alpha")
    status: 'Created',     // Initial status — always starts as "Created"
    priority: 'Medium',    // Default priority level
    progress: 0,           // Initial progress — starts at 0%
    deadline: ''           // Manufacturing deadline date
  });

  // Handle form submission — creates the job via API and redirects to dashboard
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)
    try {
      await addJob(formData);             // Call the addJob function from JobContext
      navigate('/manager-dashboard');      // Redirect to the manager dashboard on success
    } catch (error) {
      console.error('Error creating job:', error); // Log any errors
    }
  };

  // === RENDER — Job creation form ===
  return (
    <div style={styles.container} className="container">
      {/* Header with back button and page title */}
      <header style={styles.header} className="stack-on-mobile">
        <button onClick={() => navigate('/manager-dashboard')} style={styles.backBtn}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <h1 style={styles.title}>Create New Job</h1>
      </header>

      {/* Form card */}
      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Product name input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Product Name</label>
            <input 
              type="text" 
              placeholder="Enter product name" 
              style={styles.input} 
              value={formData.product}
              onChange={(e) => setFormData({...formData, product: e.target.value})}
              required
            />
          </div>

          {/* Quantity and Team — displayed side by side */}
          <div style={styles.row} className="responsive-grid-2">
            <div style={styles.inputGroup}>
              <label style={styles.label}>Quantity</label>
              <input 
                type="number" 
                placeholder="0" 
                style={styles.input} 
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Team</label>
              <select 
                style={styles.select}
                value={formData.team}
                onChange={(e) => setFormData({...formData, team: e.target.value})}
                required
              >
                <option value="">Select Team</option>
                <option value="Team Alpha">Team Alpha</option>
                <option value="Team Beta">Team Beta</option>
                <option value="Team Gamma">Team Gamma</option>
                <option value="Team Delta">Team Delta</option>
              </select>
            </div>
          </div>

          {/* Priority and Deadline — displayed side by side */}
          <div style={styles.row} className="responsive-grid-2">
            <div style={styles.inputGroup}>
              <label style={styles.label}>Priority</label>
              <select 
                style={styles.select}
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Deadline</label>
              <input 
                type="date" 
                style={styles.input} 
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Action buttons — Cancel and Create Job */}
          <div style={styles.buttonGroup} className="stack-on-mobile">
            {/* Cancel button — navigates back without creating the job */}
            <button type="button" onClick={() => navigate('/manager-dashboard')} style={styles.cancelBtn} className="full-width-on-mobile">Cancel</button>
            {/* Submit button — creates the job */}
            <button type="submit" style={styles.submitBtn} className="full-width-on-mobile">Create Job</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// STYLES — CSS-in-JS style definitions for the Create Job page
// ============================================================
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '40px' },
  header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  title: { fontSize: '24px', fontWeight: '700', color: '#111827' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', maxWidth: '600px', margin: '0 auto' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },   // Two-column layout
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },     // Label + input pair
  label: { fontSize: '14px', fontWeight: '600', color: '#374151' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' },
  select: { padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', backgroundColor: 'white' },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' },
  cancelBtn: { padding: '12px 24px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#4b5563', fontWeight: '600', cursor: 'pointer' },
  submitBtn: { padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: '600', cursor: 'pointer' }
};

// Export the CreateJob component as default
export default CreateJob;
