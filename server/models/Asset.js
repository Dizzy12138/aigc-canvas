const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Asset model represents an uploaded media resource. It can belong to a user
 * and optionally be shared within a team or system library in the future.
 */
const assetSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    tags: [{ type: String }],
    category: {
      type: String,
      enum: ['personal', 'team', 'system'],
      default: 'personal',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Asset', assetSchema);