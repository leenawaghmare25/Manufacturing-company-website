// BASE CONTROLLER — Handles basic informational routes (home, help, profile)
// These are general-purpose endpoints not tied to any specific feature

// HOME HANDLER — Returns a welcome message
// Called when GET / is hit
exports.getHome = (req, res) => {
  res.json({ message: 'Welcome to the Job Management API' }); // Simple JSON response
};

// HELP HANDLER — Returns a list of available API endpoints for reference
// Called when GET /help is hit
exports.getHelp = (req, res) => {
  res.json({
    message: 'Help Page',
    endpoints: {
      'GET /': 'Home page',                                        // This endpoint
      'GET /help': 'Help page',                                    // Lists all endpoints
      'GET /profile': 'Protected profile page (requires token)',   // Needs JWT authentication
      'POST /api/auth/login': 'Login with username and password'   // Login endpoint
    }
  });
};

// PROFILE HANDLER — Returns the authenticated user's profile information
// This is a PROTECTED route — the authMiddleware must verify the JWT first
// Called when GET /profile is hit (with valid token)
exports.getProfile = (req, res) => {
  res.json({
    message: 'Protected Profile Route',
    user: req.user  // req.user is set by authMiddleware after token verification
  });
};
