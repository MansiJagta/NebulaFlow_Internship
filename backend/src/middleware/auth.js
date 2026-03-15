const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'nebula-flow-dev-secret';

async function requireAuth(req, res, next) {
  try {
    let user = null;
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        user = await User.findById(payload.sub);
      } catch {
        // ignore
      }
    }

    // Fallback to session (OAuth)
    if (!user && req.session && req.session.userId) {
      user = await User.findById(req.session.userId);
    }

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[auth] requireAuth failed', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

module.exports = {
  requireAuth,
};
