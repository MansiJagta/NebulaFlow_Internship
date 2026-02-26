const mongoose = require('mongoose');

const userIdentitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['google', 'github'],
      required: true,
    },
    providerUserId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      trim: true,
    },
    accessTokenEncrypted: {
      type: String,
    },
    refreshTokenEncrypted: {
      type: String,
    },
    tokenExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: false,
    },
  }
);

userIdentitySchema.index(
  { provider: 1, providerUserId: 1 },
  { unique: true }
);

module.exports = mongoose.model('UserIdentity', userIdentitySchema);

