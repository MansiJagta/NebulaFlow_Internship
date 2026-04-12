const axios = require('axios');
const UserIdentity = require('../models/UserIdentity');
const { decrypt } = require('./encryption');

// In-memory cache for GitHub collaborators
const collaboratorCache = new Map();
const CACHE_TTL = 3600 * 1000; // 1 hour

/**
 * Fetch GitHub collaborators for a repo with caching
 * @param {string} userId - User ID to get GitHub token
 * @param {string} owner 
 * @param {string} repo 
 */
async function getCachedGithubCollaborators(userId, owner, repo) {
  const cacheKey = `${owner}/${repo}`;
  const now = Date.now();

  if (collaboratorCache.has(cacheKey)) {
    const { data, timestamp } = collaboratorCache.get(cacheKey);
    if (now - timestamp < CACHE_TTL) {
      console.log(`[GithubSync] Serving collaborators from cache for: ${cacheKey}`);
      return data;
    }
  }

  try {
    const identity = await UserIdentity.findOne({ userId, provider: 'github' });
    if (!identity || !identity.accessTokenEncrypted) throw new Error('GitHub identity not found');

    const token = decrypt(identity.accessTokenEncrypted);
    const res = await axios.get(`https://api.github.com/repos/${owner}/${repo}/collaborators`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const collaborators = res.data;
    collaboratorCache.set(cacheKey, { data: collaborators, timestamp: now });
    
    return collaborators;
  } catch (err) {
    console.error('[GithubSync] Failed to fetch collaborators:', err.message);
    throw err;
  }
}

module.exports = { getCachedGithubCollaborators };
