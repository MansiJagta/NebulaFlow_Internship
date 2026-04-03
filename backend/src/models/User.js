const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    // For manual login / signup (JWT-based)
    passwordHash: {
      type: String,
      select: false,
    },
    // Role is now per-workspace (see Workspace.members)
    // Kept for backward compat during migration
    role: {
      type: String,
      enum: ['pm', 'collaborator'],
      default: 'pm',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeenAt: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

module.exports = mongoose.model('User', userSchema);

