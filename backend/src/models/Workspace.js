const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['pm', 'collaborator'],
          default: 'collaborator',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    githubConfig: {
      repoOwner: { type: String, trim: true },
      repoName: { type: String, trim: true },
      repoId: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Workspace', workspaceSchema);
