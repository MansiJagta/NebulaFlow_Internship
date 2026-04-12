const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workspace = require('../models/Workspace');

const JWT_SECRET = process.env.JWT_SECRET || 'nebula-flow-dev-secret';

/**
 * Create or get a test user for development
 * Only works in development mode
 */
async function getOrCreateTestUser() {
  const DEV_USER_EMAIL = 'test@nebula.dev';
  const DEV_USER_PASSWORD = 'Test@12345';

  try {
    // Check if test user exists
    let user = await User.findOne({ email: DEV_USER_EMAIL }).select('+passwordHash');

    if (!user) {
      console.log('[devHelper] Creating test user...');
      const passwordHash = await bcrypt.hash(DEV_USER_PASSWORD, 10);

      user = await User.create({
        email: DEV_USER_EMAIL,
        fullName: 'Test User',
        passwordHash,
        role: 'pm',
        isActive: true,
        lastSeenAt: new Date(),
      });

      console.log('[devHelper] ✅ Test user created');
    }

    // Ensure user has a workspace
    let workspace = await Workspace.findOne({ 'members.userId': user._id });

    if (!workspace) {
      console.log('[devHelper] Creating test workspace...');
      workspace = await Workspace.create({
        name: 'Test Workspace',
        description: 'Development testing workspace',
        ownerId: user._id,
        members: [{ userId: user._id, role: 'pm' }],
      });
      console.log('[devHelper] ✅ Test workspace created');
    }

    // Generate token
    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    return {
      user: {
        id: user._id,
        email: DEV_USER_EMAIL,
        fullName: user.fullName,
        role: user.role,
      },
      token,
      credentials: {
        email: DEV_USER_EMAIL,
        password: DEV_USER_PASSWORD,
      },
    };
  } catch (err) {
    console.error('[devHelper] Failed to create test user:', err);
    throw err;
  }
}

module.exports = {
  getOrCreateTestUser,
};
