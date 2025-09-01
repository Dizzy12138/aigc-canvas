const express = require('express');
const multer = require('multer');
const path = require('path');
const assetsController = require('../controllers/assetsController');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer storage. Files are stored in the `uploads` folder with a timestamp prefix.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/**
 * @openapi
 * /api/assets/upload:
 *   post:
 *     summary: Upload an asset
 *     tags:
 *       - Assets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               tags:
 *                 type: string
 *                 description: Comma-separated list of tags
 *     responses:
 *       201:
 *         description: The created asset object
 */
router.post('/upload', auth, upload.single('file'), assetsController.uploadAsset);

/**
 * @openapi
 * /api/assets:
 *   get:
 *     summary: List assets of the current user
 *     tags:
 *       - Assets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of asset objects
 */
router.get('/', auth, assetsController.listAssets);

module.exports = router;