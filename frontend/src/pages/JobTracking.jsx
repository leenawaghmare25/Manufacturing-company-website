// Import React and useState hook for state management
import React, { useState } from 'react';
// Import URL parameter and navigation hooks
import { useParams, useNavigate } from 'react-router-dom';
// Import the shared job context for job data
import { useJobs } from '../context/JobContext';
// Import icons used in the tracking page UI
import { 
  ArrowLeft,       // Back button
  Clock,           // Deadline/time icon
  CheckCircle,     // Completed stage indicator
  AlertTriangle,   // Alert/warning icon
  ChevronDown,     // Dropdown arrow
  Info,            // Info note icon
  Calendar,        // Date icon
  Hash             // Job ID icon
} from 'lucide-react';

// ============================================================
// JOB TRACKING PAGE — Detailed view of a single job's progress
// Shows process flow stages, part-wise progress, and job details.
// Managers can change the stage; workers have read-only access.
// ============================================================

const JobTracking = () => {
  const { id } = useParams();                  // Get the job ID from the URL parameter
  const navigate = useNavigate();               // Hook for page navigation
  const { getJobById, updateJob } = useJobs();  // Get job read/update functions from context
  const job = getJobById(id);                   // Look up the specific job by ID
  
  // Check the logged-in user's role to determine edit permissions
  const role = localStorage.getItem('role');
  const isManager = role === 'Job Manager'; // Only managers can change stages

  // If the job doesn't exist, show error message
  if (!job) return <div style={{ padding: '40px' }}>Job not found.</div>;

  // Define the manufacturing process stages in order
  const stages = ['Created', 'Production', 'Assembly', 'Quality Check', 'Completed'];
  
  // Mock part data for the part-wise progress table (placeholder)
  const mockParts = [
    { name: 'Core Processing Unit', required: 100, completed: 45, status: 'In Progress' },
    { name: 'Power Regulation Module', required: 50, completed: 50, status: 'Completed' },
    { name: 'External Housing Assembly', required: 200, completed: 0, status: 'Pending' }
  ];

  // Handle stage change — updates the job status and auto-calculates progress
  // Only managers are allowed to change the stage
  const handleStageChange = (newStage) => {
    if (!isManager) return; // Block if the user is not a manager
    
    // Map each stage to an approximate progress percentage
    const stageProgress = {
      'Created': 0,
      'Production': 30,
      'Assembly': 60,
      'Quality Check': 90,
      'Completed': 100
    };

    // Update the job's status and progress in the database
    updateJob(job.id, { 
      status: newStage, 
      progress: stageProgress[newStage] || job.progress 
    });
  };

  // Return color scheme for a given priority level (used for priority badges)
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return { bg: '#fee2e2', text: '#ef4444' };      // Red
      case 'Urgent': return { bg: '#fee2e2', text: '#ef4444' };    // Red
      case 'Medium': return { bg: '#ffedd5', text: '#f59e0b' };    // Orange
      case 'Low': return { bg: '#dcfce7', text: '#22c55e' };       // Green
      default: return { bg: '#f3f4f6', text: '#6b7280' };          // Gray
    }
  };

  // Quality Check button is only enabled when the job is in "Quality Check" stage
  const isQCActive = job.status === 'Quality Check';

  return (
    <div style={styles.container} className="container">
      {/* HEADER SECTION */}
      <header style={styles.header} className="stack-on-mobile">
        <div style={styles.headerLeft}>
          <button onClick={() => navigate('/manager-dashboard')} style={styles.backBtn}>
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>
          <div style={styles.headerTitleGroup}>
            <h1 style={styles.title}>Job Tracking: {job.id}</h1>
            <p style={styles.subtitle}>Monitor job progress and process stages</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button 
            onClick={() => navigate(`/job/${job.id}/tasks`)} 
            style={styles.outlineBtn}
          >
            Worker Tasks
          </button>
          <button 
            onClick={() => isQCActive && navigate(`/job/${job.id}/qc`)} 
            disabled={!isQCActive}
            style={{
              ...styles.solidGreenBtn,
              ...(isQCActive ? {} : styles.disabledBtn)
            }}
            title={!isQCActive ? "Available only during Quality Check stage" : ""}
          >
            Quality Check
          </button>
        </div>
      </header>

      <div style={styles.contentLayout} className="stack-on-mobile">
        {/* MAIN CONTENT (LEFT) */}
        <div style={styles.mainContent}>
          {/* Job Summary Card */}
          <div style={styles.card}>
            <div style={styles.summaryTop}>
              <h2 style={styles.productName}>{job.product}</h2>
              <span style={{
                ...styles.priorityBadge,
                backgroundColor: getPriorityStyle(job.priority).bg,
                color: getPriorityStyle(job.priority).text
              }}>
                {job.priority} Priority
              </span>
            </div>
            
            <div style={styles.progressSection}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Overall Completion</span>
                <span style={styles.progressValue}>{job.progress}%</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{...styles.progressBarFill, width: `${job.progress}%`}}></div>
              </div>
            </div>

            <div style={styles.summaryGrid} className="responsive-grid-2">
              <div style={styles.gridItem}>
                <span style={styles.label}>Quantity</span>
                <span style={styles.value}>{job.quantity} Units</span>
              </div>
              <div style={styles.gridItem}>
                <span style={styles.label}>Assigned Team</span>
                <span style={styles.value}>{job.team}</span>
              </div>
            </div>
            
            <div style={styles.notesSection}>
              <Info size={14} color="#3b82f6" />
              <p style={styles.notesText}>Production scheduled after material verification. Special handling required.</p>
            </div>
          </div>

          {/* Process Flow Card */}
          <div style={styles.card}>
            <div style={styles.flowHeader} className="stack-on-mobile">
              <h3 style={styles.cardTitle}>Process Flow</h3>
              <div style={styles.stageControl}>
                <span style={styles.stageLabel}>Current Stage:</span>
                <div style={styles.dropdownWrapper}>
                  <select 
                    style={{
                      ...styles.stageSelect,
                      cursor: isManager ? 'pointer' : 'not-allowed'
                    }}
                    value={job.status}
                    onChange={(e) => handleStageChange(e.target.value)}
                    disabled={!isManager}
                  >
                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} style={styles.dropdownIcon} />
                </div>
              </div>
            </div>
            {/* THE TRACKER UI — Dynamic process flow steps */}
            <div style={styles.trackerContainer} className="table-responsive">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '600px', width: '100%', padding: '20px 0' }}>
              {stages.map((step, index) => {
                const currentIndex = stages.indexOf(job.status);
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                
                return (
                  <React.Fragment key={step}>
                    <div style={styles.stepBox}>
                      <div style={{
                        ...styles.stepCircle,
                        backgroundColor: isCompleted ? '#22c55e' : (isCurrent ? '#3b82f6' : '#e5e7eb'),
                        border: isCurrent ? '4px solid #dbeafe' : 'none'
                      }}>
                        {isCompleted ? <CheckCircle size={16} color="white" /> : 
                         <div style={{...styles.innerCircle, backgroundColor: isCurrent ? 'white' : 'transparent'}}></div>}
                      </div>
                      <span style={{
                        ...styles.stepName,
                        color: isCurrent ? '#111827' : '#6b7280',
                        fontWeight: isCurrent ? '700' : '500'
                      }}>{step}</span>
                    </div>
                    {index < stages.length - 1 && (
                      <div style={{
                        ...styles.stepLine,
                        backgroundColor: isCompleted ? '#22c55e' : '#e5e7eb'
                      }}></div>
                    )}
                  </React.Fragment>
                );
              })}
              </div>
            </div>
          </div>

          {/* Parts Progress Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Part-wise Progress</h2>
            <div style={styles.tableContainer} className="table-responsive">
              <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Part Name</th>
                  <th style={styles.th}>Required</th>
                  <th style={styles.th}>Completed</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {mockParts.map((part) => (
                  <tr key={part.name} style={styles.tr}>
                    <td style={styles.tdBold}>{part.name}</td>
                    <td style={styles.td}>{part.required}</td>
                    <td style={styles.td}>{part.completed}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.tableBadge,
                        backgroundColor: part.status === 'Completed' ? '#dcfce7' : (part.status === 'In Progress' ? '#dbeafe' : '#f3f4f6'),
                        color: part.status === 'Completed' ? '#166534' : (part.status === 'In Progress' ? '#1e40af' : '#4b5563')
                      }}>
                        {part.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.tableProgressWrapper}>
                        <div style={styles.tableProgressBg}>
                          <div style={{
                            ...styles.tableProgressFill, 
                            width: `${(part.completed/part.required)*100}%`,
                            backgroundColor: part.status === 'Completed' ? '#22c55e' : '#3b82f6'
                          }}></div>
                        </div>
                        <span style={styles.tableProgressText}>{Math.round((part.completed/part.required)*100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SIDEBAR (RIGHT) */}
      <div style={styles.sidebar}>
          <div style={styles.sideCard}>
            <h3 style={styles.sideTitle}>Job Details</h3>
            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <Hash size={16} color="#9ca3af" />
                <div>
                  <span style={styles.infoLabel}>Job ID</span>
                  <span style={styles.infoValue}>{job.id}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Calendar size={16} color="#9ca3af" />
                <div>
                  <span style={styles.infoLabel}>Created Date</span>
                  <span style={styles.infoValue}>2026-03-25</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Clock size={16} color="#9ca3af" />
                <div>
                  <span style={styles.infoLabel}>Deadline</span>
                  <span style={styles.infoValue}>{job.deadline}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.alertCard}>
            <div style={styles.alertHeader}>
              <AlertTriangle size={18} color="#f59e0b" />
              <span style={styles.alertTitle}>Alerts / Issues</span>
            </div>
            <p style={styles.alertText}>Production delayed by 2 hours due to material shortage in Section B.</p>
            <span style={styles.alertTime}>Updated 15 mins ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f6fa', padding: '32px', fontFamily: "'Inter', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: '1200px', margin: '0 auto 32px auto' },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '8px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontWeight: '600', padding: 0 },
  headerTitleGroup: { marginTop: '8px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: 0 },
  headerRight: { display: 'flex', gap: '12px' },
  outlineBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  solidGreenBtn: { padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#22c55e', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  disabledBtn: { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' },
  contentLayout: { display: 'grid', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
  mainContent: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  summaryTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  productName: { fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0 },
  priorityBadge: { padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
  progressSection: { marginBottom: '24px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  progressLabel: { fontSize: '13px', fontWeight: '600', color: '#6b7280' },
  progressValue: { fontSize: '13px', fontWeight: '700', color: '#3b82f6' },
  progressBarBg: { height: '10px', backgroundColor: '#f3f4f6', borderRadius: '5px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: '5px' },
  summaryGrid: { display: 'grid', gap: '24px', padding: '20px 0', borderTop: '1px solid #f3f4f6' },
  gridItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' },
  value: { fontSize: '15px', fontWeight: '600', color: '#111827' },
  notesSection: { display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px' },
  notesText: { fontSize: '13px', color: '#1e40af', margin: 0 },
  flowHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  cardTitle: { fontSize: '17px', fontWeight: '700', color: '#111827', margin: 0 },
  stageControl: { display: 'flex', alignItems: 'center', gap: '12px' },
  stageLabel: { fontSize: '14px', color: '#6b7280', fontWeight: '500' },
  dropdownWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  stageSelect: { padding: '8px 32px 8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: '14px', fontWeight: '600', color: '#111827', appearance: 'none', outline: 'none' },
  dropdownIcon: { position: 'absolute', right: '12px', pointerEvents: 'none', color: '#6b7280' },
  trackerContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' },
  stepBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 },
  stepCircle: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  innerCircle: { width: '8px', height: '8px', borderRadius: '50%' },
  stepName: { fontSize: '12px', textAlign: 'center' },
  stepLine: { flex: 1, height: '3px', margin: '0 -15px', marginTop: '-24px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', textAlign: 'left', fontSize: '12px', color: '#9ca3af', borderBottom: '1px solid #f3f4f6', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '16px 12px', fontSize: '14px', color: '#4b5563' },
  tdBold: { padding: '16px 12px', fontSize: '14px', fontWeight: '600', color: '#111827' },
  tableBadge: { padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '700' },
  tableProgressWrapper: { display: 'flex', alignItems: 'center', gap: '10px', width: '120px' },
  tableProgressBg: { flex: 1, height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' },
  tableProgressFill: { height: '100%', borderRadius: '3px' },
  tableProgressText: { fontSize: '12px', fontWeight: '700', color: '#111827' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '24px' },
  sideCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  sideTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '20px' },
  infoList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  infoItem: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  infoLabel: { display: 'block', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' },
  infoValue: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827' },
  alertCard: { backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '16px', padding: '20px' },
  alertHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  alertTitle: { fontSize: '14px', fontWeight: '700', color: '#92400e' },
  alertText: { fontSize: '13px', color: '#b45309', margin: '0 0 8px 0', lineHeight: '1.5' },
  alertTime: { fontSize: '11px', color: '#d97706' }
};

export default JobTracking;
