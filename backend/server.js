require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

// Database Connections
const db        = require('./config/db');        // MySQL2 callback pool/connection
const dbPromise = require('./config/dbPromise'); // MySQL2 promise pool

// Route imports
const ordersRoutes      = require('./routes/orders');
const invOrdersRoutes   = require('./routes/invOrdersRoutes');
const materialsRoutes   = require('./routes/materialsRoutes');
const suppliersRoutes   = require('./routes/suppliersRoutes');
const requestsRoutes    = require('./routes/requestsRoutes');

const jobRoutes         = require('./routes/jobRoutes');
const taskRoutes        = require('./routes/taskRoutes');
const teamRoutes        = require('./routes/teamRoutes');
const authRoutes        = require('./routes/authRoutes');
const qcRoutes          = require('./routes/qcRoutes'); 
const customersRoutes   = require('./routes/customers');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.locals.db = db;

// Basic health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 📦 Order Management
app.use('/api/orders', ordersRoutes);
app.use('/api/customers', customersRoutes);

// 📋 Inventory Management
app.use('/api/materials', materialsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/inv-orders', invOrdersRoutes);

// 🔧 Job Management
app.use('/api/jobs', jobRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/qc', qcRoutes);

// 404 & Error Handling
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
