// Import Express framework for creating route handlers
const express = require('express');
// Create a new Express Router instance
const router = express.Router();
// Import the task controller which handles worker task operations
const taskController = require('../controllers/taskController');
// Import the auth middleware — ALL task routes require authentication
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/tasks — Fetch tasks (supports ?jobId= and ?worker= query filters)
router.get('/', authMiddleware, taskController.getTasks);
// POST /api/tasks — Create a new task and assign it to a worker
router.post('/', authMiddleware, taskController.createTask);
// PUT /api/tasks/:id — Update a task's status (Pending → In Progress → Completed)
router.put('/:id', authMiddleware, taskController.updateTask);

// Export the router so it can be mounted in app.js at /api/tasks
module.exports = router;
