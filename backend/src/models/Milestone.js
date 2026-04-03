const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    expectedStartDate: {
      type: Date,
      required: true,
    },
    expectedEndDate: {
      type: Date,
      required: true,
    },
    actualStartDate: {
      type: Date,
    },
    actualEndDate: {
      type: Date,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    color: {
      type: String,
      default: '',
    },
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Milestone', milestoneSchema);
