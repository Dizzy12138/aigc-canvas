const Asset = require('../models/Asset');

/**
 * Upload a new asset. The uploaded file is made available at `/uploads/<filename>`.
 */
exports.uploadAsset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const asset = new Asset({
      owner: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      tags: req.body.tags ? req.body.tags.split(',') : [],
      category: req.body.category || 'personal',
    });
    await asset.save();
    return res.status(201).json(asset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * List assets owned by the authenticated user.
 */
exports.listAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ owner: req.userId }).sort({ createdAt: -1 });
    return res.json(assets);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};