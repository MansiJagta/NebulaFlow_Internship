const axios = require('axios');
const UserIdentity = require('../models/UserIdentity');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const { decrypt } = require('../utils/encryption');

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
    if (!identity || !identity.accessTokenEncrypted) return null;

    // Decrypt just in case it's encrypted (it should be now)
    return decrypt(identity.accessTokenEncrypted);
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

        // 1. Fetch ALL active collaborators (direct, outside, etc.)
        const collabRes = await axios.get(`${base}/collaborators?per_page=100&affiliation=all`, { headers });
        
        console.log(`[getRepoCollaborators] GitHub returned ${collabRes.data?.length || 0} collaborators for ${owner}/${repo}`);
        console.log(`[getRepoCollaborators] Logins:`, (collabRes.data || []).map(c => c.login));

        // 2. Fetch Pending Invitations to show "Invited" status matching GitHub UI
        let invitations = [];
        try {
            const inviteRes = await axios.get(`${base}/invitations?per_page=100`, { headers });
            invitations = inviteRes.data || [];
            console.log(`[getRepoCollaborators] ${invitations.length} pending invitations found`);
        } catch (err) {
            console.warn('[getRepoCollaborators] Could not fetch invitations:', err.message);
        }

        // --- Process Active Collaborators ---
        const activeCollaborators = await Promise.all(
            (collabRes.data || []).map(async (c) => {
                try {
                    // Case-insensitive match for username
                    const identity = await UserIdentity.findOne({ 
                        provider: 'github', 
                        username: new RegExp(`^${c.login}$`, 'i')
                    }).populate('userId');

                    console.log(`[getRepoCollaborators] ${c.login} -> DB identity: ${identity ? identity.username : 'NOT FOUND'}, hasUser: ${!!identity?.userId}`);

                    const userRes = await axios.get(`https://api.github.com/users/${c.login}`, { headers });
                    const userData = userRes.data;
                    
                    return {
                        login: c.login,
                        name: userData.name || c.login,
                        avatarUrl: userData.avatar_url,
                        profileUrl: userData.html_url,
                        role: c.login.toLowerCase() === owner.toLowerCase() ? 'Project Manager (PM)' : (c.permissions?.admin ? 'Admin' : c.permissions?.push ? 'Developer' : 'Read-only'),
                        status: 'active',
                        hasAccount: !!identity?.userId,
                        userId: identity?.userId?._id || null,
                        email: identity?.userId?.email || null,
                    };
                } catch (err) {
                    console.warn(`[getRepoCollaborators] Error processing ${c.login}:`, err.message);
                    return {
                        login: c.login,
                        name: c.login,
                        avatarUrl: c.avatar_url,
                        profileUrl: c.html_url,
                        role: c.login.toLowerCase() === owner.toLowerCase() ? 'Project Manager (PM)' : (c.permissions?.admin ? 'Admin' : c.permissions?.push ? 'Developer' : 'Read-only'),
                        status: 'active',
                        hasAccount: false,
                        userId: null,
                        email: null,
                    };
                }
            })
        );

        // --- Process Pending Invitations ---
        const pendingCollaborators = invitations.map(inv => ({
            login: inv.invitee?.login || 'invited-user',
            name: inv.invitee?.login || 'Invited User',
            avatarUrl: inv.invitee?.avatar_url || '',
            profileUrl: inv.invitee?.html_url || '',
            role: inv.permissions === 'admin' ? 'Admin' : inv.permissions === 'push' ? 'Developer' : 'Read-only',
            status: 'pending_github',
            hasAccount: false,
            userId: null,
            email: null,
        }));

        console.log(`[getRepoCollaborators] Returning ${activeCollaborators.length} active + ${pendingCollaborators.length} pending`);
        return res.json([...activeCollaborators, ...pendingCollaborators]);
    } catch (err) {
        console.error('[getRepoCollaborators Error]', err.response?.data || err.message);
        return res.status(500).json({ error: 'Failed to fetch collaborators' });
    }
};

/**
 * POST /api/github/sync-repo
 *
 * Syncs a GitHub repository to a workspace.
 * Verifies if the current user is the repository owner using GitHub REST API.
 * - If they are the owner: assigns role 'PM' to the user in the workspace
 * - If they are not the owner: assigns role 'Collaborator' to the user in the workspace
 *
 * Request body:
 * {
 *   repoOwner: string,     // GitHub repo owner login/username
 *   repoName: string,      // GitHub repo name
 *   workspaceId: string    // MongoDB workspace ID (optional, creates new workspace if not provided)
 * }
 *
 * Returns:
 * {
 *   success: boolean,
 *   workspace: { _id, name, members },
 *   userRole: 'pm' | 'collaborator',
 *   isRepoOwner: boolean,
 *   message: string
 * }
 */
exports.syncGitHubRepository = async (req, res) => {
    try {
        const { repoOwner, repoName, workspaceId } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!repoOwner || !repoName) {
            return res.status(400).json({ error: 'repoOwner and repoName are required' });
        }

        // Step 1: Get current user's GitHub identity
        const userIdentity = await UserIdentity.findOne({
            userId,
            provider: 'github',
        });

        if (!userIdentity) {
            return res.status(400).json({
                error:
                    'GitHub not connected to your account. Please connect GitHub first.',
            });
        }

        const userGitHubId = userIdentity.providerUserId;
        if (!userGitHubId) {
            return res.status(400).json({
                error: 'GitHub ID not found. Please reconnect your GitHub account.',
            });
        }

        // Step 2: Get GitHub token (with proper OAuth token handling)
        const token = await getToken(req);
        if (!token) {
            return res.status(401).json({ error: 'GitHub not authenticated' });
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
        };

        // Step 3: Fetch repo info from GitHub to get owner details
        let repoData = null;
        let repoOwnerId = null;

        try {
            const repoRes = await axios.get(
                `https://api.github.com/repos/${repoOwner}/${repoName}`,
                { headers }
            );
            repoData = repoRes.data;
            repoOwnerId = repoData.owner.id.toString();

            console.log(`[syncGitHubRepository] Fetched repo: ${repoOwner}/${repoName}`);
            console.log(
                `[syncGitHubRepository] Repo owner ID: ${repoOwnerId}, User GitHub ID: ${userGitHubId}`
            );
        } catch (err) {
            const errorMsg =
                err.response?.status === 404
                    ? `Repository '${repoOwner}/${repoName}' not found`
                    : err.response?.data?.message || err.message;
            console.error(`[syncGitHubRepository] GitHub API error:`, errorMsg);
            return res.status(400).json({
                error: `Failed to fetch repository: ${errorMsg}`,
            });
        }

        // Step 4: Determine if current user is the repo owner or admin
        const isRepoOwner = repoData.owner.id.toString() === userGitHubId;
        const isRepoAdmin = isRepoOwner || repoData.permissions?.admin === true;
        const assignedRole = isRepoOwner ? 'pm' : 'collaborator';

        console.log(
            `[syncGitHubRepository] User is repo owner: ${isRepoOwner}, admin: ${isRepoAdmin}, assigned role: ${assignedRole}`
        );
        console.log(`[syncGitHubRepository] Repo owner GitHub ID: ${repoOwnerId}, Current user GitHub ID: ${userGitHubId}`);

        // Step 5: Find or create workspace
        // CRITICAL: Search by specific repoId to avoid finding wrong workspace when user has multiple repos
        let workspace = workspaceId
            ? await Workspace.findById(workspaceId)
            : await Workspace.findOne({
                  'githubConfig.repoId': repoData.id.toString(),
              });

        if (!workspace) {
            // Get or create the repo owner as a user (if they exist in our system)
            let actualOwnerId = userId; // Default to current user
            let ownerIdentity = null;

            // Try to find the actual GitHub repo owner in our system
            if (!isRepoOwner) {
                ownerIdentity = await UserIdentity.findOne({
                    provider: 'github',
                    providerUserId: repoOwnerId
                });
                
                if (ownerIdentity && ownerIdentity.userId) {
                    actualOwnerId = ownerIdentity.userId;
                }
            } else {
                actualOwnerId = userId; // Current user is the owner
            }

            // Build initial members array
            const initialMembers = [];
            
            // Add the actual repo owner as PM
            if (!isRepoOwner && ownerIdentity && ownerIdentity.userId) {
                // Repo owner is someone else
                initialMembers.push({
                    userId: ownerIdentity.userId,
                    role: 'pm',
                    joinedAt: new Date()
                });
                console.log(`[syncGitHubRepository] Added repo owner ${ownerIdentity.userId} as PM (workspace owner).`);
            } else {
                // Current user is the repo owner
                initialMembers.push({
                    userId,
                    role: 'pm',
                    joinedAt: new Date()
                });
                console.log(`[syncGitHubRepository] Current user is repo owner, added as PM.`);
            }

            // Add the syncing user as collaborator if they're NOT the owner
            if (!isRepoOwner) {
                initialMembers.push({
                    userId,
                    role: 'collaborator',
                    joinedAt: new Date()
                });
                console.log(`[syncGitHubRepository] Added syncing user ${userId} as collaborator.`);
            }

            workspace = await Workspace.create({
                name: repoName,
                description: `Synced from GitHub repository: ${repoOwner}/${repoName}`,
                ownerId: actualOwnerId,
                githubConfig: {
                    repoOwner,
                    repoName,
                    repoId: repoData.id.toString(),
                    linkedBy: userId,
                    linkedAt: new Date(),
                },
                members: initialMembers,
            });

            console.log(
                `[syncGitHubRepository] Created new workspace: ${workspace._id} with workspace owner: ${actualOwnerId} (GitHub repo owner: ${repoOwner})`
            );
        } else {
            // Update existing workspace
            workspace.name = repoName;
            workspace.githubConfig = {
                repoOwner,
                repoName,
                repoId: repoData.id.toString(),
                linkedBy: userId,
                linkedAt: new Date(),
            };

            const memberIndex = workspace.members.findIndex(
                (m) => m.userId.toString() === userId.toString()
            );

            if (memberIndex !== -1) {
                // User is already a member
                // If they ARE the repo owner, ensure they are PM
                if (isRepoOwner) {
                    workspace.members[memberIndex].role = 'pm';
                    console.log(`[syncGitHubRepository] User is repo owner, updated role to PM.`);
                } else {
                    // If they're not the owner, they should be collaborator
                    workspace.members[memberIndex].role = 'collaborator';
                    console.log(`[syncGitHubRepository] User is not repo owner, updated role to collaborator.`);
                }
            } else {
                // Add user as new member
                const newRole = isRepoOwner ? 'pm' : 'collaborator';
                workspace.members.push({
                    userId,
                    role: newRole,
                    joinedAt: new Date(),
                });
                console.log(`[syncGitHubRepository] Added user as new member with role: ${newRole}`);
            }

            // Ensure the real owner is added as PM if they aren't already a member
            if (!isRepoOwner) {
                const ownerIdentity = await UserIdentity.findOne({
                    provider: 'github',
                    providerUserId: repoOwnerId
                });
                
                if (ownerIdentity && ownerIdentity.userId) {
                    const ownerIndex = workspace.members.findIndex(m => m.userId.toString() === ownerIdentity.userId.toString());
                    if (ownerIndex === -1) {
                        workspace.members.push({
                            userId: ownerIdentity.userId,
                            role: 'pm',
                            joinedAt: new Date()
                        });
                        console.log(`[syncGitHubRepository] Added repo owner ${ownerIdentity.userId} as PM to existing workspace.`);
                    } else {
                        // Ensure owner has PM role
                        workspace.members[ownerIndex].role = 'pm';
                        console.log(`[syncGitHubRepository] Ensured repo owner ${ownerIdentity.userId} has PM role.`);
                    }
                }
            }

            await workspace.save();
            console.log(
                `[syncGitHubRepository] Updated workspace: ${workspace._id} for repo: ${repoName}`
            );
        }

        // Step 6: Populate and return response
        await workspace.populate('members.userId', 'fullName email avatarUrl');
        await workspace.populate('ownerId', 'fullName email');

        const responseMembers = workspace.members.map(m => ({
            _id: m.userId._id,
            fullName: m.userId.fullName,
            email: m.userId.email,
            avatarUrl: m.userId.avatarUrl,
            role: m.role,
            joinedAt: m.joinedAt,
        }));

        return res.json({
            success: true,
            workspace: {
                _id: workspace._id,
                name: workspace.name,
                description: workspace.description,
                ownerId: workspace.ownerId._id,
                owner: {
                    _id: workspace.ownerId._id,
                    fullName: workspace.ownerId.fullName,
                    email: workspace.ownerId.email,
                },
                githubConfig: {
                    repoOwner: workspace.githubConfig.repoOwner,
                    repoName: workspace.githubConfig.repoName,
                    linkedAt: workspace.githubConfig.linkedAt,
                },
                members: responseMembers,
            },
            userRole: assignedRole,
            isRepoAdmin,
            message: isRepoOwner
                ? `Repository synced! You are the owner and have been assigned the 'PM' role.`
                : `Repository synced! You have been assigned the 'Collaborator' role.`,
        });
    } catch (err) {
        console.error('[syncGitHubRepository] Error:', err.message);
        return res.status(500).json({
            error: 'Failed to sync GitHub repository',
            details: err.message,
        });
    }
};
