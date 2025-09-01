const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Layer subdocument captures individual element metadata on the canvas.
 */
const layerSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'text', 'shape', 'component'],
      required: true,
    },
    file: {
      type: String,
      required: false,
    },
    position: {
      x: Number,
      y: Number,
    },
    opacity: {
      type: Number,
      default: 1,
    },
    blendMode: {
      type: String,
      default: 'normal',
    },
    zIndex: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

/**
 * Project model stores canvas metadata, layers and versioning information.
 */
const projectSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    canvasSize: {
      width: { type: Number, default: 1920 },
      height: { type: Number, default: 1080 },
    },
    layers: [layerSchema],
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Project', projectSchema);