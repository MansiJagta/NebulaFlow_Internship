const nodemailer = require('nodemailer');
const axios = require('axios');
const UserIdentity = require('../models/UserIdentity');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

/** Build a nodemailer transporter from env config */
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

/**
 * POST /api/github/invite
 * Body: { email, githubUsername?, role, repoOwner, repoName }
 *
 * 1. Sends a platform invite email to `email`
 * 2. If `githubUsername` is provided, sends a GitHub collaborator invitation via GitHub API
 */
exports.sendInvite = async (req, res) => {
    const { email, githubUsername, role, repoOwner, repoName } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const results = { emailSent: false, githubInvited: false, errors: [] };

    // ---- 1. Send platform invite email ----
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail@gmail.com') {
        results.errors.push('Email not configured. Fill in EMAIL_USER and EMAIL_PASS in backend/.env');
    } else {
        try {
            const transporter = createTransporter();
            const signupLink = `${FRONTEND_URL}/signup`;
            const repoSection = repoOwner && repoName
                ? `<p style="margin:0 0 16px">You've also been invited to collaborate on the <strong>${repoOwner}/${repoName}</strong> GitHub repository.</p>`
                : '';

            await transporter.sendMail({
                from: process.env.EMAIL_FROM || `"Nebula Flow" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `You've been invited to join Nebula Flow${repoName ? ` · ${repoName}` : ''}`,
                html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0b0c15; color:#c9d1f5; margin:0; padding:0;">
  <div style="max-width:560px; margin:40px auto; background:#12132a; border-radius:16px; overflow:hidden; border:1px solid #1e2050;">
    <div style="background:linear-gradient(135deg,#00d8ff 0%,#8b5cf6 100%); padding:32px; text-align:center;">
      <h1 style="margin:0; color:#fff; font-size:24px; font-weight:700;">Nebula Flow</h1>
      <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">Project Management Platform</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#e2e8f0; font-size:20px; margin:0 0 16px;">You've been invited!</h2>
      <p style="margin:0 0 16px;">You've been invited to join Nebula Flow as a <strong style="color:#00d8ff">${role || 'Collaborator'}</strong>.</p>
      ${repoSection}
      <p style="margin:0 0 24px;">Click the button below to create your account and get started.</p>
      <div style="text-align:center;">
        <a href="${signupLink}" style="display:inline-block; background:linear-gradient(135deg,#00d8ff,#8b5cf6); color:#fff; text-decoration:none; padding:14px 32px; border-radius:8px; font-weight:600; font-size:15px;">
          Accept Invitation
        </a>
      </div>
      <p style="margin:24px 0 0; font-size:12px; color:#6b7280;">
        If you weren't expecting this invitation, you can safely ignore this email.
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

    // ---- 2. Add GitHub collaborator (only if username provided) ----
    if (githubUsername && githubUsername.trim()) {
        try {
            const userId = req.session.userId;
            if (!userId) {
                results.errors.push('GitHub not connected: no session');
            } else {
                // Get stored token
                let token = req.session.githubToken;
                if (!token) {
                    const identity = await UserIdentity.findOne({ userId, provider: 'github' });
                    token = identity?.accessTokenEncrypted;
                }

                if (!token) {
                    results.errors.push('GitHub token not found. Reconnect GitHub.');
                } else if (!repoOwner || !repoName) {
                    results.errors.push('Repository information missing for GitHub invite.');
                } else {
                    const ghRes = await axios.put(
                        `https://api.github.com/repos/${repoOwner}/${repoName}/collaborators/${githubUsername.trim()}`,
                        { permission: 'push' }, // 'pull' | 'push' | 'admin' | 'maintain' | 'triage'
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: 'application/vnd.github+json',
                            },
                        }
                    );
                    // 201 = invite sent, 204 = already a collaborator
                    results.githubInvited = ghRes.status === 201 || ghRes.status === 204;
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
