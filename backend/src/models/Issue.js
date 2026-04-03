const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: false,
    },
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sprint',
      required: false,
    },
    issueKey: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
      default: 'backlog',
    },
    priority: {
      type: Number,
      enum: [1, 2, 3],
      default: 2,
    },
    type: {
      type: String,
      enum: ['story', 'task', 'bug'],
      default: 'task',
    },
    storyPoints: {
      type: Number,
      default: 0,
    },
    assigneeUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reporterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    },
    githubPrUrl: {
      type: String,
    },
    githubIssueNumber: {
      type: Number,
    },
    dueDate: {
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

module.exports = mongoose.model('Issue', issueSchema);
