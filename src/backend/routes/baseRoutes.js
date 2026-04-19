// Import Express framework for creating route handlers
const express = require('express');
// Create a new Express Router instance
const router = express.Router();
// Import the base controller which handles general informational routes
const baseController = require('../controllers/baseController');
// Import the auth middleware to protect certain routes
const authMiddleware = require('../middleware/authMiddleware');

// GET / — Public home page route (no authentication needed)
router.get('/', baseController.getHome);
// GET /help — Public help page listing all available API endpoints
router.get('/help', baseController.getHelp);
// GET /profile — Protected route that returns user profile info (requires valid JWT token)
router.get('/profile', authMiddleware, baseController.getProfile);

// Export the router so it can be mounted in app.js at root path "/"
module.exports = router;
