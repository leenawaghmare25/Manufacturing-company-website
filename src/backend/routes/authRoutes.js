// Import Express framework for creating route handlers
const express = require('express');
// Create a new Express Router instance to define routes
const router = express.Router();
// Import the authentication controller which contains the login handler
const authController = require('../controllers/authController');

// POST /api/auth/login — Handle user login requests
// This route is PUBLIC (no authMiddleware needed since the user is logging in)
router.post('/login', authController.login);

// Export the router so it can be mounted in app.js at /api/auth
module.exports = router;
