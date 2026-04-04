const axios = require('axios');
const UserIdentity = require('../models/UserIdentity');

/**
 * Retrieve the stored GitHub access token for the logged-in user.
 * Works via session (OAuth) or falls back to stored UserIdentity.
 */
async function getToken(req) {
    // Prefer the token stored directly in session after OAuth callback
    if (req.session.githubToken) return req.session.githubToken;

    const userId = req.session.userId;
    if (!userId) return null;

    const identity = await UserIdentity.findOne({ userId, provider: 'github' });
    return identity ? identity.accessTokenEncrypted : null;
}

/**
 * GET /api/github/repo?owner=<owner>&repo=<repo>
 *
 * Returns a unified object with:
 *  - repoInfo (stars, forks, open_issues_count, language, description, html_url)
 *  - openPRsCount
 *  - commitFrequency (last 15 days – [{date, count}])
 *  - languages  (breakdown object from GitHub API, converted to % array)
 *  - contributors (top 5 from /contributors)
 *  - recentCommits (last 10 commits)
 */
exports.getRepoDetails = async (req, res) => {
    try {
        const { owner, repo } = req.query;
        if (!owner || !repo) {
            return res.status(400).json({ error: 'owner and repo query params are required' });
        }

        const token = await getToken(req);
        if (!token) {
            return res.status(401).json({ error: 'GitHub not connected' });
        }

        const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
        const base = `https://api.github.com/repos/${owner}/${repo}`;

        // Parallel fetch
        const [repoRes, pullsRes, commitsRes, languagesRes, contributorsRes] = await Promise.all([
            axios.get(base, { headers }),
            axios.get(`${base}/pulls?state=open&per_page=100`, { headers }).catch(() => ({ data: [] })),
            axios.get(`${base}/commits?per_page=100`, { headers }).catch(() => ({ data: [] })),
            axios.get(`${base}/languages`, { headers }).catch(() => ({ data: {} })),
            axios.get(`${base}/contributors?per_page=10`, { headers }).catch(() => ({ data: [] })),
        ]);

        const repoData = repoRes.data;

        // ---- Commit frequency – last 15 days ----
        const today = new Date();
        const dayBuckets = {};
        for (let i = 14; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dayBuckets[label] = 0;
        }
        commitsRes.data.forEach(c => {
            const d = new Date(c.commit.author.date);
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (dayBuckets[label] !== undefined) dayBuckets[label]++;
        });
        const commitFrequency = Object.entries(dayBuckets).map(([date, count]) => ({ date, count }));

        // ---- Language breakdown → percentages ----
        const langData = languagesRes.data;
        const totalBytes = Object.values(langData).reduce((s, v) => s + v, 0);
        const LANG_COLORS = {
            JavaScript: '#f7df1e',
            TypeScript: '#3178c6',
            Python: '#3572A5',
            CSS: '#563d7c',
            HTML: '#e34c26',
            Rust: '#dea584',
            Go: '#00ADD8',
            Java: '#b07219',
            'C++': '#f34b7d',
            Ruby: '#701516',
            Shell: '#89e051',
        };
        const languageBreakdown = Object.entries(langData).map(([name, bytes]) => ({
            name,
            value: totalBytes ? Math.round((bytes / totalBytes) * 100) : 0,
            color: LANG_COLORS[name] || '#8884d8',
        }));

        // ---- Contributors ----
        const contributors = (contributorsRes.data || []).slice(0, 5).map(c => ({
            login: c.login,
            avatarUrl: c.avatar_url,
            commits: c.contributions,
            profileUrl: c.html_url,
        }));

        // ---- Recent commits ----
        const recentCommits = (commitsRes.data || []).slice(0, 10).map(c => ({
            sha: c.sha,
            message: c.commit.message.split('\n')[0].substring(0, 80),
            author: c.commit.author.name,
            time: new Date(c.commit.author.date).toLocaleString(),
            branch: 'main',
            url: c.html_url,
        }));

        return res.json({
            repoInfo: {
                name: repoData.name,
                fullName: repoData.full_name,
                description: repoData.description,
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                openIssues: repoData.open_issues_count,
                language: repoData.language,
                htmlUrl: repoData.html_url,
                updatedAt: repoData.updated_at,
            },
            openPRsCount: pullsRes.data.length,
            commitFrequency,
            languageBreakdown,
            contributors,
            recentCommits,
        });
    } catch (err) {
        console.error('[getRepoDetails Error]', err.response?.data || err.message);
        return res.status(500).json({ error: 'Failed to fetch repo details' });
    }
};

/**
 * GET /api/github/repo/collaborators?owner=<owner>&repo=<repo>
 *
 * Returns array of { login, name, avatarUrl, profileUrl, role }
 * Only returns actual collaborators (not contributors or owner).
 */
exports.getRepoCollaborators = async (req, res) => {
    try {
        const { owner, repo } = req.query;
        if (!owner || !repo) {
            return res.status(400).json({ error: 'owner and repo query params are required' });
        }

        const token = await getToken(req);
        if (!token) {
            return res.status(401).json({ error: 'GitHub not connected' });
        }

        const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
        const base = `https://api.github.com/repos/${owner}/${repo}`;

        // Get ONLY collaborators with explicit permission (not including repo owner or random contributors)
        const collabRes = await axios.get(`${base}/collaborators?per_page=100&affiliation=direct`, { headers });
        
        // Fetch full user details to get real names
        const collaborators = await Promise.all(
            (collabRes.data || []).map(async (c) => {
                try {
                    // Fetch user details to get real name
                    const userRes = await axios.get(`https://api.github.com/users/${c.login}`, { headers });
                    const userData = userRes.data;
                    
                    return {
                        login: c.login,
                        name: userData.name || c.login,  // Use real name from profile, fallback to login
                        avatarUrl: userData.avatar_url,
                        profileUrl: userData.html_url,
                        role: c.permissions?.admin ? 'Admin' : c.permissions?.push ? 'Developer' : 'Read-only',
                    };
                } catch (err) {
                    console.warn(`[getRepoCollaborators] Could not fetch profile for ${c.login}:`, err.message);
                    // Fallback if user fetch fails
                    return {
                        login: c.login,
                        name: c.login,
                        avatarUrl: c.avatar_url,
                        profileUrl: c.html_url,
                        role: c.permissions?.admin ? 'Admin' : c.permissions?.push ? 'Developer' : 'Read-only',
                    };
                }
            })
        );

        return res.json(collaborators);
    } catch (err) {
        console.error('[getRepoCollaborators Error]', err.response?.data || err.message);
        return res.status(500).json({ error: 'Failed to fetch collaborators' });
    }
};
