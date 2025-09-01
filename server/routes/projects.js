const express = require('express');
const projectsController = require('../controllers/projectsController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/projects:
 *   get:
 *     summary: Get all projects for the current user
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of projects
 *   post:
 *     summary: Create a new project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               canvasSize:
 *                 type: object
 *                 properties:
 *                   width:
 *                     type: number
 *                   height:
 *                     type: number
 *               layers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: The created project
 */
router
  .route('/')
  .get(auth, projectsController.getProjects)
  .post(auth, projectsController.createProject);

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     summary: Get a single project by ID
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project object
 *   put:
 *     summary: Update a project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated project
 *   delete:
 *     summary: Delete a project by ID
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success message
 */
router
  .route('/:id')
  .get(auth, projectsController.getProject)
  .put(auth, projectsController.updateProject)
  .delete(auth, projectsController.deleteProject);

module.exports = router;