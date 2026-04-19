const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserIdentity = require('../models/UserIdentity');
const { encrypt, decrypt } = require('../utils/encryption');

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
    console.log(`[Auth] Registration attempt for email: ${email}`);

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
    req.session.userId = user._id.toString();

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
    console.log(`[Auth] Login attempt for email: ${email}`);

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
    req.session.userId = user._id.toString();

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
      // Always update tokens so they stay fresh
      userIdentity.accessTokenEncrypted = encrypt(accessToken);
      if (refreshToken) userIdentity.refreshTokenEncrypted = encrypt(refreshToken);
      userIdentity.tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
      await userIdentity.save();
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
        accessTokenEncrypted: encrypt(accessToken),
        refreshTokenEncrypted: refreshToken ? encrypt(refreshToken) : null,
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




// -------- Connect GitHub --------
exports.connectGitHub = (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).send('Login required');

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'repo user user:email', // include emails
    allow_signup: 'true',
  });

  const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.redirect(url);
};

// GitHub OAuth callback
exports.githubCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code provided');

  try {
    // 1️⃣ Get logged-in platform user
    const userId = req.session.userId;
    if (!userId) return res.status(401).send('Login required');

    const user = await User.findById(userId);
    if (!user) return res.status(401).send('User not found');

    // 2️⃣ Exchange code for GitHub access token
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
    if (!accessToken) return res.status(400).send('No access token received');

    // 3️⃣ Get GitHub user emails
    const emailsRes = await axios.get('https://api.github.com/user/emails', {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'NebulaFlow-App'
      },
    });

    const githubEmails = emailsRes.data
      .filter(e => e.verified)
      .map(e => e.email.toLowerCase());

    // 4️⃣ Check if GitHub emails match logged-in user's email
    if (!githubEmails.includes(user.email.toLowerCase())) {
      return res.status(403).send(
        `GitHub account email (${githubEmails[0]}) does not match your platform email (${user.email})`
      );
    }

    // 5️⃣ Get GitHub user info
    const githubUserRes = await axios.get('https://api.github.com/user', {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'NebulaFlow-App'
      },
    });
    const githubUser = githubUserRes.data;

    // 6️⃣ Remove any previous GitHub identity for this platform user
    await UserIdentity.findOneAndDelete({ userId, provider: 'github' });

    // 7️⃣ Save GitHub identity for this platform user
    await UserIdentity.create({
      userId: user._id.toString(),
      provider: 'github',
      providerUserId: githubUser.id.toString(),
      username: githubUser.login,
      accessTokenEncrypted: encrypt(accessToken),
      tokenExpiresAt: null,
    });

    // 8️⃣ Redirect to frontend repository selection
    res.redirect(`${process.env.FRONTEND_URL}/repository-selection`);
  } catch (err) {
    console.error('[GitHub OAuth Error]', err.response?.data || err);
    res.status(500).send('GitHub authentication failed');
  }
};

// Fetch GitHub repos for logged-in user
exports.getGitHubRepos = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Not logged in' });

    const identity = await UserIdentity.findOne({
      userId,
      provider: 'github',
    });

    if (!identity || !identity.accessTokenEncrypted) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    const token = decrypt(identity.accessTokenEncrypted);

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'User-Agent': 'NebulaFlow-App'
      },
    });

    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner?.login || '',
      description: repo.description || 'No description',
      language: repo.language || 'Unknown',
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

// Check GitHub connection status for logged-in user
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

// -------- Development Helper: Get test token --------
// ⚠️ ONLY FOR DEVELOPMENT - Remove or restrict in production
exports.getTestToken = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  try {
    const { getOrCreateTestUser } = require('../utils/devHelper');
    const result = await getOrCreateTestUser();
    
    res.json({
      message: '🧪 Development Test Credentials',
      credentials: result.credentials,
      token: result.token,
      user: result.user,
      usage: 'Add "Authorization: Bearer <token>" to your API requests',
    });
  } catch (err) {
    console.error('[getTestToken] failed', err);
    res.status(500).json({ error: 'Failed to generate test token' });
  }
};