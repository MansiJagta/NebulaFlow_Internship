const nodemailer = require('nodemailer');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserIdentity = require('../models/UserIdentity');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
const JWT_SECRET = process.env.JWT_SECRET || 'nebula-flow-dev-secret';

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
 * POST /api/github/invite
 *
 * Sends a branded invite email via Gmail SMTP (credentials in .env).
 * The From display name and Reply-To always show whoever is logged in,
 * so the recipient sees it as a personal invite.
 */
exports.sendInvite = async (req, res) => {
    const { email, githubUsername, role, repoOwner, repoName } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const results = { emailSent: false, githubInvited: false, errors: [] };

    // Resolve logged-in user for From display name and Reply-To
    const sender = await resolveUser(req);
    const senderName = sender?.fullName || sender?.email || 'Nebula Flow';
    const senderEmail = sender?.email;

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

            const signupLink = `${FRONTEND_URL}/signup`;
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
      <p style="margin:16px 0 24px;">Click below to create your account and get started.</p>
      <div style="text-align:center;">
        <a href="${signupLink}" style="display:inline-block;background:linear-gradient(135deg,#00d8ff,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
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
    if (githubUsername && githubUsername.trim()) {
        try {
            const userId = sender?._id || req.session?.userId;
            if (!userId) {
                results.errors.push('GitHub not connected: no session');
            } else {
                let token = req.session?.githubToken;
                if (!token) {
                    const identity = await UserIdentity.findOne({ userId, provider: 'github' });
                    token = identity?.accessTokenEncrypted;
                }
                if (!token) {
                    results.errors.push('GitHub token not found. Reconnect GitHub.');
                } else if (!repoOwner || !repoName) {
                    results.errors.push('Repository info missing for GitHub invite.');
                } else {
                    const ghRes = await axios.put(
                        `https://api.github.com/repos/${repoOwner}/${repoName}/collaborators/${githubUsername.trim()}`,
                        { permission: 'push' },
                        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
                    );
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
