const nodemailer = require('nodemailer');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserIdentity = require('../models/UserIdentity');
const Workspace = require('../models/Workspace');
const { decrypt } = require('../utils/encryption');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
const JWT_SECRET = process.env.JWT_SECRET || 'nebula-flow-dev-secret';
const INVITE_TOKEN_SECRET = process.env.INVITE_TOKEN_SECRET || 'nebula-invite-token-secret';
const INVITE_TOKEN_EXPIRY = '7d';

async function resolveUser(req) {
    let userId = null;
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        try {
            const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
            userId = payload.sub;
        } catch { /* ignore */ }
    }
    if (!userId) userId = req.session?.userId;
    if (!userId) return null;
    return User.findById(userId);
}

/**
 * Generate invite token encoding workspace context
 */
function generateInviteToken(workspaceId, inviteeEmail, role) {
    return jwt.sign(
        {
            workspaceId,
            inviteeEmail,
            role,
        },
        INVITE_TOKEN_SECRET,
        { expiresIn: INVITE_TOKEN_EXPIRY }
    );
}

/**
 * Verify invite token
 */
function verifyInviteToken(token) {
    try {
        return jwt.verify(token, INVITE_TOKEN_SECRET);
    } catch (err) {
        return null;
    }
}

async function inviteGitHubCollaborator(repoOwner, repoName, collaborator, token) {
    if (!repoOwner || !repoName || !collaborator || !token) return { ok: false, message: 'Missing data for GitHub invite' };
    try {
        const res = await axios.put(
            `https://api.github.com/repos/${repoOwner}/${repoName}/collaborators/${encodeURIComponent(collaborator)}`,
            { permission: 'push' },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                },
            }
        );
        return { ok: res.status === 201 || res.status === 204, status: res.status };
    } catch (err) {
        const msg = err.response?.data?.message || err.message;
        console.warn('[inviteGitHubCollaborator] failed:', collaborator, msg);
        return { ok: false, message: msg };
    }
}

async function getWorkspaceGitHubToken(workspace, currentUser) {
    if (currentUser) {
        const identity = await UserIdentity.findOne({ userId: currentUser._id, provider: 'github' });
        if (identity?.accessTokenEncrypted) return decrypt(identity.accessTokenEncrypted);
    }

    for (const member of workspace.members) {
        const identity = await UserIdentity.findOne({ userId: member.userId._id || member.userId, provider: 'github' });
        if (identity?.accessTokenEncrypted) return decrypt(identity.accessTokenEncrypted);
    }

    return null;
}

/**
 * POST /api/github/invite
 *
 * Sends a branded invite email via Gmail SMTP (credentials in .env).
 * The From display name and Reply-To always show whoever is logged in,
 * so the recipient sees it as a personal invite.
 * 
 * Accepts workspaceId via query/body, or looks up workspace by sender + repoName.
 * 
 * Request body:
 * {
 *   email: string,           // (required) Email of invitee
 *   githubUsername?: string, // GitHub username for repo invite
 *   role?: string,           // 'pm' or 'collaborator' (defaults to 'collaborator' if not specified)
 *   repoOwner?: string,      // GitHub repo owner
 *   repoName?: string,       // GitHub repo name
 *   workspaceId?: string     // MongoDB workspace ID
 * }
 * 
 * Role Assignment Logic:
 * - If role = 'pm': User joins as 'pm' in workspace
 * - If role not specified or role != 'pm': User joins as 'collaborator' (default role)
 * 
 * Returns:
 * {
 *   emailSent: boolean,
 *   githubInvited: boolean,
 *   errors: string[],
 *   inviteToken: string
 * }
 */
exports.sendInvite = async (req, res) => {
    const { email, githubUsername, role, repoOwner, repoName, workspaceId } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const results = { emailSent: false, githubInvited: false, errors: [], inviteToken: null };

    // Resolve logged-in user for From display name and Reply-To
    const sender = await resolveUser(req);
    if (!sender) return res.status(401).json({ error: 'Not authenticated' });

    const senderName = sender?.fullName || sender?.email || 'Nebula Flow';
    const senderEmail = sender?.email;

    // Find workspace
    let workspace = null;
    if (workspaceId) {
        workspace = await Workspace.findById(workspaceId);
    } else if (repoName) {
        // Find workspace by sender + repoName
        workspace = await Workspace.findOne({
            'members.userId': sender._id,
            'githubConfig.repoName': repoName,
        });
    }

    if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
    }

    // Normalize role for workspace enums (pm/collaborator)
    // Default to 'collaborator' if role is not explicitly 'pm'
    const normalizedRole = (role && String(role).toLowerCase() === 'pm') ? 'pm' : 'collaborator';
    console.log(`[sendInvite] Inviting ${email} with role: ${normalizedRole}`);

    // Generate invite token
    const inviteToken = generateInviteToken(workspace._id.toString(), email, normalizedRole);
    const acceptLink = `${FRONTEND_URL}/accept-invite?token=${inviteToken}`;
    results.inviteToken = inviteToken;

    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASS;

    // ---- 1. Send email ----
    if (!smtpUser || smtpUser === 'your_gmail@gmail.com'
        || !smtpPass || smtpPass === 'your_app_password') {
        results.errors.push('Email not configured. Set EMAIL_USER and EMAIL_PASS in backend/.env');
    } else {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: smtpUser, pass: smtpPass },
            });

            const repoSection = repoOwner && repoName
                ? `<p style="margin:0 0 16px">You've also been invited as a collaborator on <strong>${repoOwner}/${repoName}</strong>.</p>`
                : '';

            await transporter.sendMail({
                // From shows the logged-in user's name (dynamic!)
                from: `"${senderName} via Nebula Flow" <${smtpUser}>`,
                // Reply-To goes back to the logged-in user's email (dynamic!)
                replyTo: senderEmail ? `"${senderName}" <${senderEmail}>` : smtpUser,
                to: email,
                subject: `${senderName} invited you to join Nebula Flow${repoName ? ` · ${repoName}` : ''}`,
                html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0b0c15;color:#c9d1f5;margin:0;padding:0;">
  <div style="max-width:560px;margin:40px auto;background:#12132a;border-radius:16px;overflow:hidden;border:1px solid #1e2050;">
    <div style="background:linear-gradient(135deg,#00d8ff 0%,#8b5cf6 100%);padding:32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Nebula Flow</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Project Management Platform</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#e2e8f0;font-size:20px;margin:0 0 16px;">You've been invited!</h2>
      <p style="margin:0 0 8px;">
        <strong style="color:#00d8ff">${senderName}</strong> has invited you to join Nebula Flow as a
        <strong style="color:#00d8ff">${role || 'Collaborator'}</strong>.
      </p>
      ${repoSection}
      <p style="margin:16px 0 24px;">Click below to accept the invitation and get started.</p>
      <div style="text-align:center;">
        <a href="${acceptLink}" style="display:inline-block;background:linear-gradient(135deg,#00d8ff,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
          Accept Invitation
        </a>
      </div>
      <p style="margin:24px 0 0;font-size:12px;color:#6b7280;">
        If you weren't expecting this, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
            });
            results.emailSent = true;
        } catch (err) {
            console.error('[sendInvite] Email error:', err.message);
            results.errors.push(`Email failed: ${err.message}`);
        }
    }

    // ---- 2. Add GitHub collaborator ----
    let resolvedGithubUsername = githubUsername?.trim();
    if (!resolvedGithubUsername) {
        // If we can find invitee's GitHub identity, use it
        const inviteeUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (inviteeUser) {
            const identity = await UserIdentity.findOne({ userId: inviteeUser._id, provider: 'github' });
            if (identity?.username) {
                resolvedGithubUsername = identity.username;
            }
        }
    }

    if (resolvedGithubUsername) {
        try {
            const userId = sender?._id || req.session?.userId;
            if (!userId) {
                results.errors.push('GitHub not connected: no session');
            } else {
                let token = req.session?.githubToken;
                if (!token) {
                    const identity = await UserIdentity.findOne({ userId, provider: 'github' });
                    token = identity?.accessTokenEncrypted ? decrypt(identity.accessTokenEncrypted) : null;
                }

                if (!token) {
                    results.errors.push('GitHub token not found. Reconnect GitHub.');
                } else if (!repoOwner || !repoName) {
                    results.errors.push('Repository info missing for GitHub invite.');
                } else {
                    const ghResult = await inviteGitHubCollaborator(repoOwner, repoName, resolvedGithubUsername, token);
                    results.githubInvited = ghResult.ok;
                    if (!ghResult.ok) {
                        results.errors.push(`GitHub invite failed: ${ghResult.message || 'unknown'}`);
                    }
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            console.error('[sendInvite] GitHub collab error:', msg);
            results.errors.push(`GitHub invite failed: ${msg}`);
        }
    }

    return res.json(results);
};

/**
 * GET /api/auth/accept-invite?token=...
 *
 * Accepts an invite and auto-adds existing users to workspace,
 * or redirects new users to signup with invite token.
 *
 * Role Assignment Logic for Invites:
 * - If invite token has role='pm': User joins as 'pm' in workspace
 * - If invite token has role='collaborator': User joins as 'collaborator'
 * - Default: Invite tokens encode role, typically 'collaborator' if not specified
 *
 * Returns:
 * {
 *   action: 'redirect_to_signup' | 'added_to_workspace_authenticated' | 'added_to_workspace_login' | 'already_member',
 *   message: string,
 *   role: string,
 *   workspaceId: string,
 *   ...
 * }
 */
exports.acceptInvite = async (req, res) => {
    const { token } = req.query;

    console.log('[acceptInvite] token:', token);

    if (!token) {
        console.error('[acceptInvite] missing token');
        return res.status(400).json({ error: 'Invite token is required' });
    }

    // Verify token
    const payload = verifyInviteToken(token);
    if (!payload) {
        console.error('[acceptInvite] invalid/expired token');
        return res.status(400).json({ error: 'Invalid or expired invite token' });
    }

    const { workspaceId, inviteeEmail, role } = payload;
    const normalizedInviteeEmail = String(inviteeEmail || '').trim().toLowerCase();
    console.log('[acceptInvite] payload:', { workspaceId, inviteeEmail: normalizedInviteeEmail, role });

    try {
        // Find workspace
        const workspace = await Workspace.findById(workspaceId).populate('members.userId');
        if (!workspace) {
            console.error('[acceptInvite] workspace not found', workspaceId);
            return res.status(404).json({ error: 'Workspace not found' });
        }

        // Check if user with this email exists (case-insensitive)
        let existingUser = await User.findOne({ email: normalizedInviteeEmail });
        if (!existingUser) {
            existingUser = await User.findOne({ email: new RegExp(`^${normalizedInviteeEmail}$`, 'i') });
        }

        if (!existingUser) {
            // User doesn't exist - redirect to signup with token
            return res.json({
                action: 'redirect_to_signup',
                message: 'Please create an account to accept this invitation',
                token,
                inviteeEmail: normalizedInviteeEmail,
                role,
            });
        }

        // User exists - check if already a member
        const isAlreadyMember = workspace.members.some(
            m => m.userId._id?.toString() === existingUser._id.toString()
        );

        if (isAlreadyMember) {
            return res.json({
                action: 'already_member',
                message: 'You are already a member of this workspace',
                workspaceId,
            });
        }

        // Add user to workspace
        let finalRole = (role && String(role).toLowerCase() === 'pm') ? 'pm' : 'collaborator';

        if (workspace.githubConfig && workspace.githubConfig.repoOwner) {
            const inviteeIdentity = await UserIdentity.findOne({ userId: existingUser._id, provider: 'github' });
            if (inviteeIdentity && inviteeIdentity.username && inviteeIdentity.username.toLowerCase() === workspace.githubConfig.repoOwner.toLowerCase()) {
                finalRole = 'pm';
            }
        }

        workspace.members.push({
            userId: existingUser._id,
            role: finalRole,
            joinedAt: new Date(),
        });

        await workspace.save();

        let githubInviteStatus = null;
        if (workspace.githubConfig?.repoOwner && workspace.githubConfig?.repoName) {
            const targetIdentity = await UserIdentity.findOne({ userId: existingUser._id, provider: 'github' });
            const targetGithubUsername = targetIdentity?.username;
            if (targetGithubUsername) {
                const adminToken = await getWorkspaceGitHubToken(workspace, await resolveUser(req));
                if (adminToken) {
                    const ghResult = await inviteGitHubCollaborator(
                        workspace.githubConfig.repoOwner,
                        workspace.githubConfig.repoName,
                        targetGithubUsername,
                        adminToken
                    );
                    githubInviteStatus = ghResult;
                }
            }
        }

        // If user is authenticated in session, redirect to dashboard
        const currentUser = await resolveUser(req);
        if (currentUser && currentUser._id.toString() === existingUser._id.toString()) {
            return res.json({
                action: 'added_to_workspace_authenticated',
                message: 'Successfully added to workspace!',
                workspaceId,
                role,
                redirectUrl: role === 'pm' ? '/pm/dashboard' : '/collaborator/dashboard',
                githubInviteStatus,
            });
        }

        // Otherwise, redirect to login
        return res.json({
            action: 'added_to_workspace_login',
            message: 'Invite accepted! Please log in to access your workspace',
            workspaceId,
            role,
            workspace: {
                _id: workspace._id,
                name: workspace.name,
                members: workspace.members.map(m => ({
                    _id: m.userId._id,
                    fullName: m.userId.fullName,
                    email: m.userId.email,
                    avatarUrl: m.userId.avatarUrl,
                    role: m.role,
                })),
            },
        });
    } catch (err) {
        console.error('[acceptInvite] Error:', err.message);
        return res.status(500).json({ error: 'Failed to accept invite' });
    }
};
