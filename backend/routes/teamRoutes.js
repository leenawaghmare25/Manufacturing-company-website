// Import Express framework for creating route handlers
const express = require('express');
// Create a new Express Router instance
const router = express.Router();
// Import the team controller which handles team, member, and worker operations
const teamController = require('../controllers/teamController');
// Import the auth middleware — ALL team routes require authentication
const authMiddleware = require('../middleware/authMiddleware');

// === WORKER ROUTES (must be defined BEFORE /:id routes) ===
// If these were placed after /:id, Express would interpret "workers" as an :id parameter
router.get('/workers', authMiddleware, teamController.getWorkers);    // GET /api/teams/workers — List all Production Staff users
router.post('/workers', authMiddleware, teamController.createWorker); // POST /api/teams/workers — Create a new worker account

// === TEAM CRUD ROUTES ===
router.get('/', authMiddleware, teamController.getTeams);          // GET /api/teams — Fetch all teams with members
router.post('/', authMiddleware, teamController.createTeam);       // POST /api/teams — Create a new team
router.put('/:id', authMiddleware, teamController.updateTeam);     // PUT /api/teams/:id — Update team name
router.delete('/:id', authMiddleware, teamController.deleteTeam);  // DELETE /api/teams/:id — Delete a team

// === TEAM MEMBER MANAGEMENT ROUTES ===
router.post('/:id/members', authMiddleware, teamController.addMember);              // POST /api/teams/:id/members — Add worker to team
router.delete('/:id/members/:userId', authMiddleware, teamController.removeMember); // DELETE /api/teams/:id/members/:userId — Remove worker from team

// Export the router so it can be mounted in app.js at /api/teams
module.exports = router;
