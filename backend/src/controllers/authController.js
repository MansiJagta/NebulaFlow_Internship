const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserIdentity = require('../models/UserIdentity');

const FRONTEND_URL = process.env.FRONTEND_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'nebula-flow-dev-secret';
const JWT_EXPIRES_IN = '7d';

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
    lastSeenAt: user.lastSeenAt,
  };
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// -------- Manual email/password auth (JWT) --------

exports.registerWithEmail = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail }).select(
      '+passwordHash'
    );
    if (existing && existing.passwordHash) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    if (existing) {
      existing.passwordHash = passwordHash;
      existing.fullName = existing.fullName || fullName || normalizedEmail.split('@')[0];
      existing.lastSeenAt = new Date();
      user = await existing.save();
    } else {
      user = await User.create({
        email: normalizedEmail,
        fullName: fullName || normalizedEmail.split('@')[0],
        passwordHash,
        role: 'pm',
        isActive: true,
        lastSeenAt: new Date(),
      });
    }

    const token = signToken(user._id.toString());

    return res.status(201).json({
      user: sanitizeUser(user),
      token,
    });
  } catch (err) {
    console.error('[nebula-flow] registerWithEmail failed', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

exports.loginWithEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      '+passwordHash'
    );

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastSeenAt = new Date();
    await user.save();

    const token = signToken(user._id.toString());

    return res.json({
      user: sanitizeUser(user),
      token,
    });
  } catch (err) {
    console.error('[nebula-flow] loginWithEmailPassword failed', err);
    return res.status(500).json({ error: 'Login failed' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    let user = null;

    // Prefer JWT (manual auth)
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        user = await User.findById(payload.sub);
      } catch {
        // ignore invalid token and fall back to session
      }
    }

    // Fallback to session (OAuth)
    if (!user && req.session.userId) {
      user = await User.findById(req.session.userId);
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('[nebula-flow] getCurrentUser failed', err);
    return res.status(500).json({ error: 'Failed to load user' });
  }
};

exports.logout = (req, res) => {
  // For JWT-based auth, frontend should simply discard the token.
  // Here we only clear any server session used by OAuth.
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(204).end();
  });
};

// -------- Google OAuth (login + signup) --------

exports.startGoogleOAuth = (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(url);
};

exports.handleGoogleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing "code" in Google callback');
  }

  try {
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const {
      id_token: idToken,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    } = tokenResponse.data;

    const payload = JSON.parse(
      Buffer.from(idToken.split('.')[1], 'base64').toString()
    );

    const email = String(payload.email || '').toLowerCase();
    const fullName = payload.name || '';
    const avatarUrl = payload.picture || '';
    const providerUserId = payload.sub;

    let userIdentity = await UserIdentity.findOne({
      provider: 'google',
      providerUserId,
    });

    let user;

    if (userIdentity) {
      user = await User.findById(userIdentity.userId);
    } else {
      user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          email,
          fullName,
          avatarUrl,
          role: 'pm',
          isActive: true,
          lastSeenAt: new Date(),
        });
      }

      userIdentity = await UserIdentity.create({
        userId: user._id,
        provider: 'google',
        providerUserId,
        username: email,
        accessTokenEncrypted: accessToken,
        refreshTokenEncrypted: refreshToken || null,
        tokenExpiresAt: expiresIn
          ? new Date(Date.now() + expiresIn * 1000)
          : null,
      });
    }

    user.lastSeenAt = new Date();
    await user.save();

    req.session.userId = user._id.toString();

    const redirectUrl = `${FRONTEND_URL}/repository-selection`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('[nebula-flow] Google OAuth callback failed', err.response?.data || err);
    return res.status(500).send('Google authentication failed');
  }
};
exports.connectGitHub = (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL, // must match GitHub app callback
    scope: 'repo user',
    allow_signup: 'true',
  });
  const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.redirect(url);
};

exports.githubCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code provided');

  try {
    // Exchange code for token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenRes.data.access_token;

    // Get GitHub user
    const githubUser = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const providerUserId = githubUser.data.id.toString();
    const username = githubUser.data.login;

    // Get logged-in user from session
    const userId = req.session.userId;
    if (!userId) return res.status(401).send('Login required first');

    // Save GitHub info in DB
    await UserIdentity.findOneAndUpdate(
      { provider: 'github', providerUserId },
      { userId, provider: 'github', providerUserId, username, accessTokenEncrypted: accessToken },
      { upsert: true, new: true }
    );

    req.session.githubToken = accessToken;

    // Redirect back to frontend
    res.redirect(`${process.env.FRONTEND_URL}/repository-selection`);
  } catch (err) {
    console.error('[GitHub OAuth Error]', err.response?.data || err);
    res.status(500).send('GitHub authentication failed');
  }
};

exports.getGitHubRepos = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const identity = await UserIdentity.findOne({
      userId,
      provider: 'github',
    });

    if (!identity) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    const token = identity.accessTokenEncrypted;

    const response = await axios.get(
      'https://api.github.com/user/repos',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner?.login || repo.full_name?.split('/')[0] || '',
      description: repo.description || "No description",
      language: repo.language || "Unknown",
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    }));

    res.json(repos);

  } catch (err) {
    console.error('[Fetch Repos Error]', err.response?.data || err);
    res.status(500).json({ error: 'Failed to fetch repos' });
  }
};

exports.getGitHubStatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.json({ connected: false });

    const identity = await UserIdentity.findOne({ userId, provider: 'github' });
    return res.json({ connected: !!identity });
  } catch (err) {
    return res.json({ connected: false });
  }
};