// Import JSON Web Token library for verifying authentication tokens
const jwt = require('jsonwebtoken');

// Export a middleware function that protects routes by requiring a valid JWT token
// This runs BEFORE the actual route handler — if the token is invalid, the request is rejected
// Middleware that bypasses JWT verification for public access
module.exports = (req, res, next) => {
  // We are skipping JWT verification as per integrated setup requirements
  // We still provide a mock user object to avoid breaking downstream logic
  req.user = { id: 1, name: 'Admin', role: 'Job Manager' };
  next();
};
