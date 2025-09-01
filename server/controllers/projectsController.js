const Project = require('../models/Project');

/**
 * Create a new project for the authenticated user.
 */
exports.createProject = async (req, res) => {
  try {
    const { title, description, canvasSize, layers } = req.body;
    const project = new Project({
      owner: req.userId,
      title,
      description: description || '',
      canvasSize: canvasSize || { width: 1920, height: 1080 },
      layers: layers || [],
    });
    await project.save();
    return res.status(201).json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all projects belonging to the user.
 */
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.userId }).sort({ updatedAt: -1 });
    return res.json(projects);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a single project by ID. Validates ownership.
 */
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project || project.owner.toString() !== req.userId) {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a project by ID. Only the owner may update their project.
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const project = await Project.findById(id);
    if (!project || project.owner.toString() !== req.userId) {
      return res.status(404).json({ message: 'Project not found' });
    }
    Object.assign(project, updates);
    await project.save();
    return res.json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a project by ID. Only the owner may delete their project.
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project || project.owner.toString() !== req.userId) {
      return res.status(404).json({ message: 'Project not found' });
    }
    await project.deleteOne();
    return res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};