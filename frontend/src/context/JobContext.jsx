// Import React hooks and utilities needed for context management
import React, { createContext, useState, useContext, useEffect } from 'react';
// Import axios for making HTTP API requests to the backend
import axios from 'axios';

// Create a React Context — this is a way to share data across components without prop drilling
// Any component wrapped in JobProvider can access this context's values
const JobContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'https://manufacturing-company-job-mgmt-module.onrender.com/api';

// Custom hook — makes it easy to access the JobContext from any component
// Usage: const { jobs, addJob, updateJob } = useJobs();
export const useJobs = () => useContext(JobContext);

// JobProvider component — wraps the entire app and provides shared state for jobs and QC records
export const JobProvider = ({ children }) => {
  // State for storing the array of manufacturing jobs fetched from the backend
  const [jobs, setJobs] = useState([]);
  // State for storing quality check records
  const [qcRecords, setQCRecords] = useState([]);
  // Loading state — true while initial data is being fetched
  const [loading, setLoading] = useState(true);

  // useEffect runs once when the component mounts (empty dependency array would cause this,
  // but we intentionally fetch on mount only)
  useEffect(() => {
    // Async function to fetch initial data from the backend
    const fetchData = async () => {
      try {
        // Get the JWT token from localStorage (set during login)
        const token = localStorage.getItem('token');
        if (token) {
          // Create the authorization header config for API requests
          const config = { headers: { Authorization: `Bearer ${token}` } };
          // Fetch both jobs and QC records simultaneously using Promise.all
          // This is faster than fetching them one after another
          const [jobsRes, qcRes] = await Promise.all([
            axios.get(`${API_BASE}/jobs`, config),      // Fetch all jobs
            axios.get(`${API_BASE}/qc`, config).catch(() => ({ data: [] })) // Fetch QC records (fallback to empty array on error)
          ]);
          setJobs(jobsRes.data);       // Store the fetched jobs in state
          setQCRecords(qcRes.data);    // Store the fetched QC records in state
        }
      } catch (error) {
        console.error('Error fetching data:', error); // Log any errors
      } finally {
        setLoading(false); // Mark loading as complete regardless of success/failure
      }
    };
    fetchData(); // Call the fetch function
  }, []); // Empty dependency array = runs only once on mount

  // ADD JOB — Creates a new job via the backend API and adds it to local state
  const addJob = async (jobData) => {
    try {
      const token = localStorage.getItem('token'); // Get auth token
      if (token) {
        // Send POST request to create the job on the backend
        const response = await axios.post(`${API_BASE}/jobs`, jobData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Add the newly created job to the local state array
        // Using functional update (prev =>) to safely update based on previous state
        setJobs(prev => [...prev, response.data.job]);
        return response.data.job; // Return the created job for the caller to use
      }
    } catch (error) {
      console.error('Error creating job:', error);
      throw error; // Re-throw so the calling component can handle the error
    }
  };

  // UPDATE JOB — Updates a job's fields via the backend API and updates local state
  const updateJob = async (id, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Send PUT request to update the job on the backend
        await axios.put(`${API_BASE}/jobs/${id}`, updatedData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Update the job in local state by mapping through all jobs
        // and merging the updated data into the matching job
        setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updatedData } : job));
      }
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  };

  // DELETE JOB — Deletes a job via the backend API and removes it from local state
  const deleteJob = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Send DELETE request to remove the job from the backend database
        await axios.delete(`${API_BASE}/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Remove the job from local state by filtering it out
        setJobs(prev => prev.filter(job => job.id !== id));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  };

  // GET JOB BY ID — Finds a specific job from the local state array
  // This doesn't make an API call — it searches the already-loaded jobs
  const getJobById = (id) => jobs.find(job => job.id === id);

  // ADD QC RECORD — Creates a new quality check record via the backend API
  const addQCRecord = async (record) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Send POST request to create the QC record
        const response = await axios.post(`${API_BASE}/qc`, record, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Add the new record to the beginning of the local state array (newest first)
        setQCRecords(prev => [response.data.record, ...prev]);
        return response.data.record;
      }
    } catch (error) {
      console.error('Error adding QC Record:', error);
      throw error;
    }
  };

  // GET QC RECORDS BY JOB ID — Filters QC records for a specific job from local state
  const getQCRecordsByJobId = (jobId) => qcRecords.filter(r => r.jobId === jobId);

  // Provide all the state and functions to child components via Context
  return (
    <JobContext.Provider value={{ 
      jobs,                   // Array of all manufacturing jobs
      loading,                // Boolean indicating if initial data is still loading
      addJob,                 // Function to create a new job
      updateJob,              // Function to update an existing job
      deleteJob,              // Function to delete a job
      getJobById,             // Function to find a job by its ID
      qcRecords,              // Array of all quality check records
      addQCRecord,            // Function to create a new QC record
      getQCRecordsByJobId     // Function to filter QC records by job ID
    }}>
      {children}  {/* Render all child components inside the provider */}
    </JobContext.Provider>
  );
};
