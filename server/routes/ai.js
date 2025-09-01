const express = require('express');
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/ai/models:
 *   get:
 *     summary: List available base models for AI generation
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of models
 */
router.get('/models', auth, aiController.getModels);

/**
 * @openapi
 * /api/ai/generate:
 *   post:
 *     summary: Use AI to generate a new image based on a prompt
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Text prompt describing the desired image
 *     responses:
 *       501:
 *         description: Not implemented
 */
router.post('/generate', auth, aiController.generateImage);

/**
 * @openapi
 * /api/ai/inpaint:
 *   post:
 *     summary: Perform AI-powered inpainting on a selection
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: Not implemented
 */
router.post('/inpaint', auth, aiController.inpaint);

/**
 * @openapi
 * /api/ai/enhance:
 *   post:
 *     summary: Enhance an image with AI upscaling or styling
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: Not implemented
 */
router.post('/enhance', auth, aiController.enhance);

/**
 * @openapi
 * /api/ai/harmonize:
 *   post:
 *     summary: Harmonize multiple layers into a single cohesive image
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: Not implemented
 */
router.post('/harmonize', auth, aiController.harmonize);

/**
 * Simple chat endpoints for the AI design assistant. These routes are
 * placeholders and currently return mock responses.
 */
router.get('/chat', auth, aiController.getChatMessages);
router.post('/chat', auth, aiController.chatReply);

/**
 * @openapi
 * /api/ai/job/{id}:
 *   get:
 *     summary: Get the status and result of an AI generation job
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Job ID returned by the generate endpoint
 *     responses:
 *       200:
 *         description: Job status and result
 *       404:
 *         description: Job not found
 */
router.get('/job/:id', auth, aiController.getJobStatus);

module.exports = router;