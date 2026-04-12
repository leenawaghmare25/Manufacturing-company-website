// Import the mysql2 library with promise support for async/await database queries
const mysql = require('mysql2/promise');
// Load environment variables from .env file (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
require('dotenv').config();

// Create a connection pool to the MySQL database
const pool = process.env.DATABASE_URL 
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'job_management',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

// Export the pool so other files can use it to run database queries
module.exports = pool;
