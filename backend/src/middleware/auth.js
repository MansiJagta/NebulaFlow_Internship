const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'nebula-flow-dev-secret';

async function requireAuth(req, res, next) {
  try {
    let user = null;
    const authHeader = req.headers.authorization || '';
    console.log('[auth] ========== AUTH CHECK ==========');
    console.log('[auth] Request path:', req.path);
    console.log('[auth] Has Authorization header:', !!authHeader);
    console.log('[auth] Authorization header:', authHeader ? authHeader.substring(0, 20) + '...' : 'MISSING');
    console.log('[auth] Has session:', !!req.session?.userId);
    
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        user = await User.findById(payload.sub);
        console.log('[auth] ✅ JWT auth successful for user:', payload.sub);
      } catch (err) {
        console.log('[auth] ❌ JWT verification failed:', err.message);
      }
    }

    // Fallback to session (OAuth)
    if (!user && req.session && req.session.userId) {
      user = await User.findById(req.session.userId);
      console.log('[auth] ✅ Session auth for user:', req.session.userId, 'found:', !!user);
    }

    if (!user) {
      console.log('[auth] ❌ Authentication failed - no valid token or session');
      console.log('[auth] Available auth methods: JWT=' + !!authHeader + ', Session=' + !!(req.session?.userId));
      console.log('[auth] ========== END AUTH CHECK ==========');
      return res.status(401).json({ error: 'Unauthorized - no valid token or session' });
    }

    console.log('[auth] ✅ Auth passed for user:', user._id);
    console.log('[auth] ========== END AUTH CHECK ==========');
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
