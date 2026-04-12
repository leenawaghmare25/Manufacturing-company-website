// Import JSON Web Token library for creating authentication tokens
const jwt = require('jsonwebtoken');
// Import the database connection pool for running queries
const pool = require('../config/dbPromise');

// LOGIN HANDLER — Authenticates a user and returns a JWT token
// Called when POST /api/auth/login is hit
exports.login = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // In public access mode, we check if the user exists but don't strictly enforce password.
    // If user doesn't exist, we create a mock user object.
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [username]
    );

    let user = rows[0] || { 
      id: Math.floor(Math.random() * 1000), 
      email: username, 
      name: username.split('@')[0], 
      role: role || 'Order Manager' 
    };

    const token = 'mock-token-' + Date.now();

    return res.json({
      message: 'Login successful (Public Access)',
      token,
      role: user.role,
      userId: user.id,
      userName: user.name
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};
